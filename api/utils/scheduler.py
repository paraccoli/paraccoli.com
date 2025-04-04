from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
from api.models.quest import QuestType, daily_quest_templates, weekly_quest_templates
from api.utils.db import db

# スケジューラを作成
scheduler = AsyncIOScheduler()

async def generate_daily_quests():
    """デイリークエストを生成する"""
    try:
        print(f"[{datetime.now()}] Generating daily quests...")
        
        # 既存のデイリークエストを無効化
        await db.db.quests.update_many(
            {"type": QuestType.DAILY, "is_active": True},
            {"$set": {"is_active": False}}
        )

        # デイリークエストの進捗をリセット
        await db.db.user_quests.delete_many({
            "quest_id": {"$in": [
                str(q["_id"]) for q in await db.db.quests.find(
                    {"type": QuestType.DAILY}
                ).to_list(length=None)
            ]}
        })

        # デイリークエストを生成
        for quest_template in daily_quest_templates:
            # 既存のクエストを検索
            existing_quest = await db.db.quests.find_one({
                "type": QuestType.DAILY,
                "action_type": quest_template["action_type"],
                "is_active": False
            })
            
            if existing_quest:
                # 既存のクエストを更新
                await db.db.quests.update_one(
                    {"_id": existing_quest["_id"]},
                    {
                        "$set": {
                            **quest_template,
                            "expires_at": datetime.utcnow() + timedelta(days=1),
                            "is_active": True,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
            else:
                # 新規クエストを作成
                await db.create_quest({
                    **quest_template,
                    "expires_at": datetime.utcnow() + timedelta(days=1),
                    "is_active": True,
                    "created_at": datetime.utcnow()
                })
                
        # 管理者通知を作成
        await db.db.notifications.insert_one({
            "type": "quest_generated",
            "message": "デイリークエストが自動生成されました",
            "created_at": datetime.utcnow(),
            "read": False
        })
        
        print(f"[{datetime.now()}] Daily quests generated successfully")
    except Exception as e:
        print(f"[{datetime.now()}] Error generating daily quests: {e}")

async def generate_weekly_quests():
    """ウィークリークエストを生成する"""
    try:
        print(f"[{datetime.now()}] Generating weekly quests...")
        
        # 既存のウィークリークエストを無効化
        await db.db.quests.update_many(
            {"type": QuestType.WEEKLY, "is_active": True},
            {"$set": {"is_active": False}}
        )

        # ウィークリークエストの進捗をリセット
        await db.db.user_quests.delete_many({
            "quest_id": {"$in": [
                str(q["_id"]) for q in await db.db.quests.find(
                    {"type": QuestType.WEEKLY}
                ).to_list(length=None)
            ]}
        })

        # ウィークリークエストを生成
        for quest_template in weekly_quest_templates:
            existing_quest = await db.db.quests.find_one({
                "type": QuestType.WEEKLY,
                "action_type": quest_template["action_type"],
                "is_active": False
            })
            
            if existing_quest:
                await db.db.quests.update_one(
                    {"_id": existing_quest["_id"]},
                    {
                        "$set": {
                            **quest_template,
                            "expires_at": datetime.utcnow() + timedelta(weeks=1),
                            "is_active": True,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
            else:
                await db.create_quest({
                    **quest_template,
                    "expires_at": datetime.utcnow() + timedelta(weeks=1),
                    "is_active": True,
                    "created_at": datetime.utcnow()
                })
                
        # 管理者通知を作成
        await db.db.notifications.insert_one({
            "type": "quest_generated",
            "message": "ウィークリークエストが自動生成されました",
            "created_at": datetime.utcnow(),
            "read": False
        })
        
        print(f"[{datetime.now()}] Weekly quests generated successfully")
    except Exception as e:
        print(f"[{datetime.now()}] Error generating weekly quests: {e}")

def setup_scheduler():
    """スケジューラのセットアップ"""
    # 毎日深夜0時にデイリークエストを生成
    scheduler.add_job(
        generate_daily_quests,
        CronTrigger(hour=0, minute=0),
        id="daily_quest_job",
        replace_existing=True
    )
    
    # 毎週月曜日の深夜0時にウィークリークエストを生成
    scheduler.add_job(
        generate_weekly_quests,
        CronTrigger(day_of_week="mon", hour=0, minute=0),
        id="weekly_quest_job",
        replace_existing=True
    )
    
    return scheduler