from fastapi import APIRouter, Depends, HTTPException
from ..models.exchange import ExchangeRequestCreate
from ..utils.db import db
from ..routes.auth import oauth2_scheme, verify_token
from datetime import datetime

router = APIRouter()

@router.post("/request")
async def create_exchange_request(
    request: ExchangeRequestCreate,
    token: str = Depends(oauth2_scheme)
):
    """PARC交換リクエストを作成"""
    try:
        user_id = await verify_token(token)
        
        # ユーザーの残高を確認
        user = await db.get_user_by_discord_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if user.get("balance", 0) < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        # 残高を減少
        success = await db.decrease_user_balance(user_id, request.amount)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update balance")

        # 交換リクエストを作成
        exchange_id = await db.create_exchange_request({
            "user_id": user_id,
            "username": request.username,
            "amount": request.amount,
            "status": "pending",
            "created_at": datetime.utcnow()
        })

        # 通知を作成
        await db.create_notification({
            "user_id": user_id,
            "type": "exchange_request",
            "title": "PARC交換リクエスト送信完了",
            "content": f"{request.amount} PARCの交換リクエストを受け付けました。",
            "created_at": datetime.utcnow(),
            "read": False
        })

        return {"id": exchange_id, "message": "Exchange request created successfully"}

    except Exception as e:
        print(f"Error creating exchange request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{exchange_id}/complete")
async def complete_exchange(
    exchange_id: str,
    token: str = Depends(oauth2_scheme)
):
    """交換リクエストを完了処理"""
    try:
        # 管理者権限チェック
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        if not user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="管理者権限が必要です")

        # 交換リクエストを完了に更新
        success = await db.complete_exchange_request(exchange_id, user_id)
        if not success:
            raise HTTPException(status_code=400, detail="交換リクエストの完了に失敗しました")

        return {"message": "交換リクエストを完了しました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))