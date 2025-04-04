from fastapi import APIRouter, Depends, HTTPException
from api.routes.auth import oauth2_scheme, verify_token
from api.models.feedback import FeedbackCreate, FeedbackResponse
from api.utils.db import db
from api.utils.quest_manager import QuestManager
from datetime import datetime

router = APIRouter()

@router.post("")
async def create_feedback(
    feedback: FeedbackCreate,
    token: str = Depends(oauth2_scheme)
):
    """フィードバックを作成"""
    try:
        # ユーザーIDを取得
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # フィードバックデータを作成
        feedback_data = {
            "title": feedback.title,
            "content": feedback.content,
            "type": feedback.type,
            "url": feedback.url if feedback.type == "promotion" else None,
            "author_id": user_id,
            "author_name": user["username"],
            "status": "pending",
            "created_at": datetime.utcnow()  # 作成日時を追加
        }
        
        # フィードバックをデータベースに保存
        feedback_id = await db.create_feedback(feedback_data)
        
        # 宣伝報告の場合、クエスト進捗を更新
        if feedback.type == "promotion":
            await QuestManager.handle_promotion(user_id)
        
        return {
            "id": feedback_id,
            "message": "Feedback submitted successfully"
        }
    except Exception as e:
        print(f"Error creating feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my")
async def get_my_feedback(token: str = Depends(oauth2_scheme)):
    """自分のフィードバック一覧を取得"""
    try:
        user_id = await verify_token(token)
        feedback = await db.get_user_feedback(user_id)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))