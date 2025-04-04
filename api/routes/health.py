from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def health_check():
    """サーバーのヘルスチェック用エンドポイント"""
    return {"status": "ok"}