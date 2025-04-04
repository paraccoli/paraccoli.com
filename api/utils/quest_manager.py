from datetime import datetime, timedelta
from api.utils.db import db
from api.models.quest import QuestActionType

class QuestManager:
    @staticmethod
    async def update_quest_progress(user_id: str, action_type: str, count: int = 1):
        """クエスト進捗を更新"""
        try:
            # アクティブなクエストを取得
            quests = await db.get_active_quests_by_action(action_type)
            print(f"Found {len(quests)} active quests for action {action_type}")

            for quest in quests:
                quest_id = str(quest["_id"])
                
                # ユーザーのクエスト進捗を更新
                await db.db.user_quests.update_one(
                    {
                        "user_id": user_id,
                        "quest_id": quest_id
                    },
                    {
                        "$inc": {"progress": count},
                        "$setOnInsert": {
                            "created_at": datetime.utcnow(),
                            "completed": False,
                            "reward_claimed": False
                        }
                    },
                    upsert=True
                )
                print(f"Updated quest progress for quest {quest_id}")
                
                # 進捗確認と完了フラグ設定
                user_quest = await db.db.user_quests.find_one({
                    "user_id": user_id,
                    "quest_id": quest_id
                })

                if user_quest and user_quest["progress"] >= quest["required_count"]:
                    await db.db.user_quests.update_one(
                        {"_id": user_quest["_id"]},
                        {
                            "$set": {
                                "completed": True,
                                "completed_at": datetime.utcnow()
                            }
                        }
                    )
                    print(f"Quest {quest_id} completed for user {user_id}")

        except Exception as e:
            print(f"Error updating quest progress: {e}")

    @staticmethod
    async def check_expired_quests():
        """期限切れクエストの確認と新規クエストの生成"""
        await db.auto_update_quests()

    @classmethod
    async def handle_action(cls, user_id: str, action_type: str):
        """アクションに応じてクエスト進捗を更新"""
        await cls.update_quest_progress(user_id, action_type)

    @staticmethod
    async def handle_login(user_id: str):
        """ログインアクション処理"""
        try:
            # デイリーログインの進捗を更新
            await QuestManager.update_quest_progress(user_id, QuestActionType.LOGIN)
            print(f"Login quest progress updated for user {user_id}")
        except Exception as e:
            print(f"Error handling login: {e}")

    @staticmethod
    async def handle_post(user_id: str):
        """投稿アクション処理"""
        await QuestManager.update_quest_progress(user_id, QuestActionType.POST)

    @staticmethod
    async def handle_comment(user_id: str):
        """コメントアクション処理"""
        await QuestManager.update_quest_progress(user_id, QuestActionType.COMMENT)

    @staticmethod
    async def handle_reaction(user_id: str):
        """リアクションアクション処理"""
        await QuestManager.update_quest_progress(user_id, QuestActionType.REACT)

    @staticmethod
    async def handle_promotion(user_id: str):
        """宣伝報告アクション処理"""
        try:
            await QuestManager.update_quest_progress(user_id, QuestActionType.PROMOTION)
            print(f"Promotion quest progress updated for user {user_id}")
        except Exception as e:
            print(f"Error handling promotion: {e}")

    @staticmethod
    async def get_user_active_quests(user_id: str):
        """ユーザーのアクティブなクエストを取得"""
        daily = await db.get_active_quests("daily")
        weekly = await db.get_active_quests("weekly")
        user_quests = await db.get_user_quests(user_id)

        # クエスト情報に進捗を追加
        def add_progress(quests):
            for quest in quests:
                user_quest = next(
                    (uq for uq in user_quests if uq["quest_id"] == str(quest["_id"])),
                    None
                )
                if user_quest:
                    quest["progress"] = user_quest.get("progress", 0)
                    quest["completed"] = user_quest.get("completed", False)
                    quest["reward_claimed"] = user_quest.get("reward_claimed", False)
                else:
                    quest["progress"] = 0
                    quest["completed"] = False
                    quest["reward_claimed"] = False
            return quests

        return {
            "daily": add_progress(daily),
            "weekly": add_progress(weekly)
        }