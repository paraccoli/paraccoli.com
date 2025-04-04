from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..utils.config import Config
import jwt
from datetime import datetime

security = HTTPBearer()

async def verify_auth_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """認証トークンを検証してペイロードを返す"""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            Config.JWT_SECRET_KEY,
            algorithms=[Config.JWT_ALGORITHM]
        )
        
        # トークンの有効期限チェック
        if datetime.fromtimestamp(payload['exp']) < datetime.utcnow():
            raise HTTPException(
                status_code=401,
                detail="Token has expired"
            )
            
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

def get_current_user_id(payload: dict = Depends(verify_auth_token)) -> str:
    """現在のユーザーのdiscord_idを取得"""
    if 'sub' not in payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )
    return payload['sub']