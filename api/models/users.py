from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    """ユーザーの基本情報を定義するベースモデル"""
    discord_id: str
    username: str
    avatar: Optional[str] = None
    email: Optional[str] = None

class UserCreate(UserBase):
    """ユーザー作成時のモデル"""
    balance: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)

class UserLogin(BaseModel):
    """ログイン情報のモデル"""
    login_token: str
    token_expires: datetime

class UserUpdate(BaseModel):
    """ユーザー情報更新用のモデル"""
    avatar: Optional[str] = None

class UserInDB(UserBase):
    """データベースに保存されるユーザーモデル"""
    discord_id: str
    username: str
    avatar: Optional[str] = None
    balance: int = 0
    created_at: datetime
    last_login: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    """APIレスポンスとして返すユーザーモデル"""
    discord_id: str
    username: str
    avatar: Optional[str] = None
    email: Optional[str] = None
    balance: int = 0  # デフォルト値を設定
    created_at: datetime
    last_login: datetime
    is_new_user: bool = False

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    """トークンデータモデル"""
    access_token: str
    token_type: str
    expires_in: int

class TokenPayload(BaseModel):
    """トークンペイロードモデル"""
    sub: str  # discord_id
    exp: datetime