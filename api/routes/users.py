from fastapi import APIRouter, Depends, HTTPException
from ..models.users import UserUpdate, UserResponse
from ..utils.db import db
from ..routes.auth import verify_token, oauth2_scheme

router = APIRouter()

@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """現在のログインユーザーの情報を取得"""
    discord_id = await verify_token(token)
    user = await db.get_user_by_discord_id(discord_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user)

# 追加: プロフィール情報をGETで取得するエンドポイント
@router.get("/profile")
async def get_profile(token: str = Depends(oauth2_scheme)):
    """現在のユーザープロフィールを取得"""
    discord_id = await verify_token(token)
    user = await db.get_user_by_discord_id(discord_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user)

@router.put("/profile")
async def update_profile(
    update_data: UserUpdate,
    token: str = Depends(oauth2_scheme)
):
    """ユーザープロフィールを更新"""
    discord_id = await verify_token(token)
    user = await db.get_user_by_discord_id(discord_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 更新データの準備
    update_dict = update_data.dict(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # データベースの更新
    await db.update_user(discord_id, update_dict)
    
    # 更新されたユーザー情報を取得
    updated_user = await db.get_user_by_discord_id(discord_id)
    
    # 必須フィールドの確認と設定
    response_data = {
        "discord_id": updated_user["discord_id"],
        "username": updated_user["username"],
        "nickname": updated_user.get("nickname"),
        "avatar": updated_user.get("avatar"),
        "email": updated_user.get("email"),
        "balance": updated_user.get("balance", 0),  # デフォルト値を設定
        "created_at": updated_user["created_at"],
        "last_login": updated_user["last_login"],
        "is_admin": updated_user.get("is_admin", False),  # 管理者フラグを含める
        "is_new_user": False
    }
    
    return UserResponse(**response_data)

@router.get("/profile/{discord_id}")
async def get_user_profile(
    discord_id: str,
    token: str = Depends(oauth2_scheme)
):
    """指定したユーザーのプロフィールを取得"""
    # トークンの検証
    await verify_token(token)
    
    user = await db.get_user_by_discord_id(discord_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user)