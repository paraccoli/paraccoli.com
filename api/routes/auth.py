from fastapi import APIRouter, Depends, HTTPException, status, Form, Body, Request
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel
from ..models.users import UserLogin, UserResponse, TokenData, TokenPayload
from ..utils.db import db
from ..utils.config import Config
import aiohttp
from api.utils.quest_manager import QuestManager
import secrets
from api.utils.security import check_login_attempts, log_security_event, protected_endpoint, rate_limiter

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

DISCORD_API_ENDPOINT = "https://discord.com/api/v10"

# JWT関連の関数
async def create_access_token(data: dict):
    """アクセストークンを生成"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })
    
    access_token = jwt.encode(
        to_encode, 
        Config.JWT_SECRET_KEY, 
        algorithm=Config.JWT_ALGORITHM
    )
    
    return TokenData(
        access_token=access_token,
        token_type="bearer",
        expires_in=Config.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

async def verify_token(token: str):
    """トークンを検証"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        discord_id = payload.get("sub")
        if discord_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return discord_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def is_admin(token: str = Depends(oauth2_scheme)):
    """管理者権限を確認"""
    try:
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        
        print(f"Admin check for user: {user}")  # デバッグログ
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not user.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin privileges required")
            
        return user
        
    except Exception as e:
        print(f"Admin check error: {e}")  # デバッグログ
        raise

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """現在のログインユーザーの情報を取得"""
    try:
        discord_id = await verify_token(token)
        user = await db.get_user_by_discord_id(discord_id)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
            
        return {
            "discord_id": user["discord_id"],
            "username": user["username"],
            "is_admin": user.get("is_admin", False)
        }
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials"
        )

class DiscordAuthRequest(BaseModel):
    code: str
    redirect_uri: str

# APIエンドポイント
@router.post("/discord")
@protected_endpoint(max_attempts=5, window_minutes=15)  # デコレータはファストAPIでは直接使えないので注意
async def discord_login(request: Request, auth_request: DiscordAuthRequest, rate_limit: None = Depends(rate_limiter)):
    """Discordのコードを使用してログイン"""
    client_ip = request.client.host
    
    # ログイン試行のレート制限をチェック
    if not await check_login_attempts(client_ip):
        await log_security_event(
            ip_address=client_ip,
            event_type="login_rate_limited",
            details={"auth_type": "discord"},
            severity="WARNING"
        )
        raise HTTPException(
            status_code=429,
            detail="ログイン試行回数が上限を超えました。15分後に再試行してください。"
        )
    
    try:
        async with aiohttp.ClientSession() as session:
            # トークン取得
            token_url = f"{DISCORD_API_ENDPOINT}/oauth2/token"
            
            data = {
                "client_id": Config.DISCORD_CLIENT_ID,
                "client_secret": Config.DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": auth_request.code,
                "redirect_uri": auth_request.redirect_uri
            }
            
            async with session.post(
                token_url,
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            ) as response:
                token_data = await response.json()
                
                if (response.status != 200):
                    print(f"Discord token error: {token_data}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to get Discord token: {token_data.get('error_description', 'Unknown error')}"
                    )

                # ユーザー情報を取得
                user_url = f"{DISCORD_API_ENDPOINT}/users/@me"
                headers = {
                    "Authorization": f"Bearer {token_data['access_token']}"
                }
                
                async with session.get(user_url, headers=headers) as response:
                    user_data = await response.json()
                    if response.status != 200:
                        raise HTTPException(
                            status_code=response.status,
                            detail="Failed to get Discord user data"
                        )

                # ユーザー情報の作成または更新
                discord_id = str(user_data["id"])
                existing_user = await db.get_user_by_discord_id(discord_id)
                
                current_time = datetime.utcnow()
                user_info = {
                    "discord_id": discord_id,
                    "username": user_data["username"],
                    "avatar": f"https://cdn.discordapp.com/avatars/{discord_id}/{user_data['avatar']}.png" if user_data.get('avatar') else None,
                    "email": user_data.get("email"),
                    "last_login": current_time
                }

                if not existing_user:
                    # 新規ユーザー
                    user_info.update({
                        "created_at": current_time,
                        "balance": 0,
                        "is_new_user": True,
                        "is_admin": False  # デフォルトは非管理者
                    })
                    result = await db.create_user(user_info)
                    user_info["_id"] = str(result.inserted_id)
                else:
                    # 既存ユーザー
                    user_info.update({
                        "is_new_user": False,
                        "balance": existing_user.get("balance", 0),
                        "created_at": existing_user.get("created_at", current_time),
                        "is_admin": existing_user.get("is_admin", False)  # 既存の管理者フラグを保持
                    })
                    await db.update_user(discord_id, {k: v for k, v in user_info.items() if k != "_id"})
                    user_info["_id"] = str(existing_user["_id"])

                # レスポンス用にdatetimeをISOフォーマットに変換
                response_data = {
                    **user_info,
                    "created_at": user_info["created_at"].isoformat(),
                    "last_login": user_info["last_login"].isoformat()
                }

                # JWTトークンを生成
                token_data = await create_access_token({"sub": discord_id})

                # ログイン成功を記録
                await log_security_event(
                    ip_address=client_ip,
                    user_id=discord_id,
                    event_type="login_success",
                    details={"auth_type": "discord"},
                    severity="INFO"
                )

                return {
                    "access_token": token_data.access_token,
                    "token_type": token_data.token_type,
                    "expires_in": token_data.expires_in,
                    "user": response_data
                }

    except HTTPException as he:
        raise he
    except Exception as e:
        # ログイン失敗を記録
        await log_security_event(
            ip_address=client_ip,
            event_type="login_failure",
            details={"auth_type": "discord", "error": str(e)},
            severity="ERROR"
        )
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login/token")
async def token_login(login: UserLogin):
    """ログイントークンを使用してログイン"""
    user = await db.get_user_by_token(login.login_token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # JWTトークンを生成
    access_token = await create_access_token({"sub": user["discord_id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user, is_new_user=False)
    }

@router.post("/login/token/{token}")
async def token_login(token: str):
    """URLからのトークンを使用してログイン"""
    user = await db.get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # トークンデータを生成
    token_data = await create_access_token({"sub": user["discord_id"]})
    
    # ログイントークンを無効化
    await db.update_user(
        user["discord_id"], 
        {
            "login_token": None,
            "token_expires": None,
            "last_login": datetime.utcnow()
        }
    )
    
    return {
        **token_data.dict(),
        "user": UserResponse(**user, is_new_user=False)
    }

@router.post("/login")
async def login(token: str = Depends(oauth2_scheme)):
    """通常ログイン処理"""
    try:
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # ログインクエストの進捗を更新
        try:
            await QuestManager.handle_login(user_id)
            print(f"Login quest progress updated for user {user_id}")
            
            # ユーザー情報を返す前に最新の情報を取得
            updated_user = await db.get_user_by_discord_id(user_id)
            
            return {
                "message": "ログイン処理が完了しました",
                "user": {
                    "id": str(updated_user["_id"]),
                    "discord_id": updated_user["discord_id"],
                    "username": updated_user["username"],
                    "balance": updated_user.get("balance", 0),
                    "is_admin": updated_user.get("is_admin", False)
                }
            }
        except Exception as e:
            print(f"Error updating login quest progress: {e}")
            raise HTTPException(status_code=500, detail="ログインクエストの更新に失敗しました")
            
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/password-reset/request")
async def request_password_reset(email: str = Body(...)):
    """パスワードリセット要求"""
    try:
        user = await db.find_user_by_email(email)
        if not user:
            # ユーザーが見つからなくても同じレスポンスを返し、ユーザー列挙攻撃を防止
            return {"message": "リセット手順を記載したメールを送信しました（有効なメールアドレスの場合）"}
        
        # ワンタイムトークンを生成
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # トークンをデータベースに保存
        await db.save_reset_token(user["_id"], reset_token, expires_at)
        
        # メール送信ロジック（実装は省略）
        # send_reset_email(email, reset_token)
        
        return {"message": "リセット手順を記載したメールを送信しました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="パスワードリセットリクエストの処理中にエラーが発生しました")