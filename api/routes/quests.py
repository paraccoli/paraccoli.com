from fastapi import APIRouter, Depends, HTTPException
from api.routes.auth import oauth2_scheme, verify_token
from api.utils.db import db

router = APIRouter()

@router.get("/daily")
async def get_daily_quests(token: str = Depends(oauth2_scheme)):
    """デイリークエストを取得"""
    try:
        user_id = await verify_token(token)
        quests = await db.get_active_quests("daily")
        user_quests = await db.get_user_quests(user_id)
        
        formatted_quests = []
        for quest in quests:
            quest_data = {
                "id": str(quest["_id"]),
                "title": quest.get("title"),
                "description": quest.get("description"),
                "type": quest.get("type"),
                "action_type": quest.get("action_type"),
                "required_count": quest.get("required_count"),
                "reward": quest.get("reward"),
                "expires_at": quest.get("expires_at"),
                "progress": 0,
                "completed": False,
                "reward_claimed": False
            }
            
            # ユーザーの進捗情報を追加
            user_quest = next(
                (uq for uq in user_quests if uq["quest_id"] == str(quest["_id"])),
                None
            )
            if user_quest:
                quest_data["progress"] = user_quest.get("progress", 0)
                quest_data["completed"] = user_quest.get("completed", False)
                quest_data["reward_claimed"] = user_quest.get("reward_claimed", False)
                
            formatted_quests.append(quest_data)
            
        return formatted_quests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weekly")
async def get_weekly_quests(token: str = Depends(oauth2_scheme)):
    """ウィークリークエストを取得"""
    try:
        user_id = await verify_token(token)
        quests = await db.get_active_quests("weekly")
        user_quests = await db.get_user_quests(user_id)
        
        formatted_quests = []
        for quest in quests:
            quest_data = {
                "id": str(quest["_id"]),
                "title": quest.get("title"),
                "description": quest.get("description"),
                "type": quest.get("type"),
                "action_type": quest.get("action_type"),
                "required_count": quest.get("required_count"),
                "reward": quest.get("reward"),
                "expires_at": quest.get("expires_at"),
                "progress": 0,
                "completed": False,
                "reward_claimed": False
            }
            
            user_quest = next(
                (uq for uq in user_quests if uq["quest_id"] == str(quest["_id"])),
                None
            )
            if user_quest:
                quest_data["progress"] = user_quest.get("progress", 0)
                quest_data["completed"] = user_quest.get("completed", False)
                quest_data["reward_claimed"] = user_quest.get("reward_claimed", False)
                
            formatted_quests.append(quest_data)
            
        return formatted_quests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{quest_id}/claim")
async def claim_quest_reward(quest_id: str, token: str = Depends(oauth2_scheme)):
    """クエスト報酬を受け取る"""
    try:
        user_id = await verify_token(token)
        success = await db.claim_quest_reward(user_id, quest_id)
        
        if not success:
            raise HTTPException(
                status_code=400,
                detail="クエスト報酬を受け取れません"
            )
            
        return {
            "message": "クエスト報酬を受け取りました",
            "success": True
        }
    except Exception as e:
        print(f"Error claiming quest reward: {e}")
        raise HTTPException(status_code=500, detail=str(e))