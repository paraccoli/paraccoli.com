from fastapi import APIRouter, Depends, HTTPException
from api.routes.auth import oauth2_scheme, verify_token
from api.utils.db import db
from datetime import datetime

router = APIRouter()

@router.get("/my")
async def get_my_notifications(token: str = Depends(oauth2_scheme)):
    """自分の通知一覧を取得"""
    try:
        user_id = await verify_token(token)
        notifications = await db.get_user_notifications(user_id)
        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))