from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from api.models.quest import daily_quest_templates, weekly_quest_templates
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional, List
from .config import Config
from fastapi import HTTPException
from random import randint

class Database:
    """MongoDBとの非同期接続を管理するクラス"""
    
    def __init__(self, client: AsyncIOMotorClient = None, db: AsyncIOMotorDatabase = None):
        """データベース接続の初期化"""
        self.client = client or AsyncIOMotorClient(Config.MONGODB_URL)
        self.db = db or self.client[Config.DB_NAME]
    
    async def connect(self):
        """データベースに接続"""
        self.client = AsyncIOMotorClient(Config.MONGODB_URI)
        self.db = self.client[Config.DB_NAME]
        
        # コレクションの初期化
        self.users = self.db.users
        
        # インデックスの作成
        await self._create_indexes()
    
    async def _create_indexes(self):
        """必要なインデックスを作成"""
        # discord_idでユニークインデックスを作成
        await self.users.create_index('discord_id', unique=True)
        # login_tokenでユニークインデックスを作成
        await self.users.create_index('login_token', unique=True, sparse=True)
        # token_expiresの有効期限インデックスを作成
        await self.users.create_index('token_expires', expireAfterSeconds=0)
    
    async def close(self):
        """データベース接続を閉じる"""
        if self.client:
            self.client.close()
    
    async def get_user_by_discord_id(self, discord_id: str) -> Optional[dict]:
        """ユーザー情報を取得"""
        try:
            user = await self.db.users.find_one({"discord_id": discord_id})
            if user:
                user["_id"] = str(user["_id"])
                # is_adminフラグを確実に含める
                user["is_admin"] = bool(user.get("is_admin", False))
                # nickname関連のコードを削除
            return user
        except Exception as e:
            print(f"Database error getting user: {e}")
            return None

    async def get_user_by_token(self, token: str):
        """ログイントークンでユーザーを取得"""
        return await self.users.find_one({
            'login_token': token,
            'token_expires': {'$gt': datetime.utcnow()}
        })

    async def update_user(self, discord_id: str, update_data: dict) -> bool:
        """ユーザー情報を更新"""
        try:
            # nickname関連のフィールドを削除
            if "nickname" in update_data:
                del update_data["nickname"]
            
            if update_data:  # 更新するデータがまだある場合のみ
                await self.db.users.update_one(
                    {"discord_id": discord_id},
                    {"$set": update_data}
                )
            return True
        except Exception as e:
            print(f"Database error updating user: {e}")
            return False

    async def create_user(self, user_data: dict):
        """新規ユーザーを作成"""
        return await self.users.insert_one(user_data)

    # フォーラム関連のメソッド
    async def create_forum_post(self, post_data: dict) -> str:
        """フォーラム投稿を作成"""
        try:
            # _idフィールドを明示的に作成
            post_id = ObjectId()
            post_data["_id"] = post_id
            
            await self.db.forum_posts.insert_one(post_data)
            return str(post_id)
            
        except Exception as e:
            print(f"Database error creating forum post: {e}")
            raise HTTPException(
                status_code=500,
                detail="Database error while creating post"
            )

    async def get_forum_posts(
        self, 
        category: Optional[str] = None,
        tag: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> List[dict]:
        """フォーラム投稿一覧を取得"""
        query = {}
        if category:
            query["category"] = category
        if tag:
            query["tags"] = tag

        skip = (page - 1) * limit
        cursor = self.db.forum_posts.find(query).sort("created_at", -1).skip(skip).limit(limit)
        posts = await cursor.to_list(length=limit)
        
        # ObjectIdを文字列に変換
        for post in posts:
            post["id"] = str(post.pop("_id"))
            
        return posts

    async def get_forum_post(self, post_id: str) -> Optional[dict]:
        """投稿を取得"""
        try:
            if not ObjectId.is_valid(post_id):
                return None
                
            post = await self.db.forum_posts.find_one({"_id": ObjectId(post_id)})
            if not post:
                return None
                
            # コメントを取得して追加
            comments = await self.get_post_comments(str(post["_id"]))
            
            # ObjectIdを文字列に変換
            post["id"] = str(post.pop("_id"))
            
            # コメントのIDも文字列に変換
            formatted_comments = []
            for comment in comments:
                comment["id"] = str(comment.pop("_id"))
                formatted_comments.append(comment)
                
            post["comments"] = formatted_comments
            return post
            
        except Exception as e:
            print(f"Database error getting post: {e}")
            return None

    async def create_forum_comment(self, comment_data: dict) -> str:
        """コメントを作成"""
        try:
            comment_id = ObjectId()
            comment_data["_id"] = comment_id
            
            await self.db.forum_comments.insert_one(comment_data)
            
            # コメント数を更新
            await self.db.forum_posts.update_one(
                {"_id": ObjectId(comment_data["post_id"])},
                {"$inc": {"comment_count": 1}}
            )
            
            return str(comment_id)
            
        except Exception as e:
            print(f"Database error creating comment: {e}")
            raise HTTPException(
                status_code=500,
                detail="Database error while creating comment"
            )

    async def get_post_comments(self, post_id: str) -> List[dict]:
        """投稿のコメントを取得"""
        try:
            cursor = self.db.forum_comments.find({"post_id": post_id}).sort("created_at", 1)
            return await cursor.to_list(length=None)
        except Exception as e:
            print(f"Database error getting comments: {e}")
            return []

    async def update_forum_post(self, post_id: str, update_data: dict) -> bool:
        """フォーラム投稿を更新"""
        result = await self.db.forum_posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    async def delete_forum_post(self, post_id: str) -> bool:
        """フォーラム投稿を削除"""
        # 関連するコメントも削除
        await self.db.forum_comments.delete_many({"post_id": post_id})
        result = await self.db.forum_posts.delete_one({"_id": ObjectId(post_id)})
        return result.deleted_count > 0

    async def get_comment(self, comment_id: str) -> Optional[dict]:
        """コメントを取得"""
        try:
            if not ObjectId.is_valid(comment_id):
                return None
                
            comment = await self.db.forum_comments.find_one({"_id": ObjectId(comment_id)})
            if comment:
                comment["id"] = str(comment["_id"])
            return comment
        except Exception as e:
            print(f"Database error getting comment: {e}")
            return None

    async def delete_comment(self, comment_id: str, post_id: str) -> bool:
        """コメントを削除"""
        try:
            # コメントを削除
            result = await self.db.forum_comments.delete_one({"_id": ObjectId(comment_id)})
            
            if result.deleted_count > 0:
                # 投稿のコメント数を減算
                await self.db.forum_posts.update_one(
                    {"_id": ObjectId(post_id)},
                    {"$inc": {"comment_count": -1}}
                )
                return True
            return False
        except Exception as e:
            print(f"Error deleting comment: {e}")
            return False

    async def add_post_reaction(self, post_id: str, user_id: str) -> bool:
        """投稿にリアクションを追加"""
        try:
            # リアクションを追加
            result = await self.db.forum_posts.update_one(
                {
                    "_id": ObjectId(post_id),
                    "reactions": {"$ne": user_id}  # まだリアクションしていない場合のみ
                },
                {
                    "$addToSet": {"reactions": user_id},
                    "$inc": {"reaction_count": 1}
                }
            )

            if result.modified_count > 0:
                # 投稿者のPARCを増やす
                post = await self.get_forum_post(post_id)
                if post and post.get("author_id"):
                    await self.increase_user_balance(post["author_id"], 1)
                    print(f"Added 1 PARC to author {post['author_id']}")
                    return True
            return False

        except Exception as e:
            print(f"Error adding reaction: {e}")
            return False

    async def increase_user_balance(self, user_id: str, amount: float) -> bool:
        """ユーザーの残高を増やす"""
        try:
            result = await self.db.users.update_one(
                {"discord_id": user_id},
                {"$inc": {"balance": amount}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error increasing user balance: {e}")
            return False

    async def create_report(self, report_data: dict):
        """通報を作成"""
        try:
            result = await self.db.reports.insert_one(report_data)
            return result.inserted_id
        except Exception as e:
            print(f"Database error creating report: {e}")
            raise

    async def get_reports(self):
        """通報一覧を取得"""
        try:
            reports = await self.db.reports.find().sort("created_at", -1).to_list(None)
            formatted_reports = []
            
            for report in reports:
                # 基本データの整形
                formatted_report = {
                    "id": str(report["_id"]),  # _idをidに変換
                    "type": report["type"],
                    "reason": report["reason"],
                    "target_id": report["target_id"],
                    "post_id": report["post_id"],
                    "reporter_id": report["reporter_id"],
                    "status": report["status"],
                    "created_at": report["created_at"],
                    "reported_content": report["reported_content"],
                    "resolved_at": report.get("resolved_at"),
                    "resolved_by": report.get("resolved_by")
                }
                
                # 関連ユーザー情報の取得
                reporter = await self.get_user_by_discord_id(report["reporter_id"])
                if reporter:
                    formatted_report["reporter_name"] = reporter.get("username")
                
                formatted_reports.append(formatted_report)
                
            return formatted_reports
        except Exception as e:
            print(f"Database error getting reports: {e}")
            return []

    async def update_report_status(self, report_id: str, status: str, admin_id: str):
        """通報ステータスを更新"""
        try:
            result = await self.db.reports.update_one(
                {"_id": ObjectId(report_id)},
                {
                    "$set": {
                        "status": status,
                        "resolved_at": datetime.utcnow(),
                        "resolved_by": admin_id
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Database error updating report: {e}")
            return False

    async def delete_report(self, report_id: str) -> bool:
        """通報を削除"""
        try:
            result = await self.db.reports.delete_one({"_id": ObjectId(report_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Database error deleting report: {e}")
            return False

    async def drop_database(self):
        """データベースを完全に削除"""
        try:
            if self.client and self.db:
                await self.client.drop_database(self.db.name)
                print(f"データベース '{self.db.name}' を削除しました")
                return True
            return False
        except Exception as e:
            print(f"データベース削除エラー: {e}")
            return False

    async def create_feedback(self, feedback_data: dict) -> str:
        """フィードバックを作成"""
        try:
            # IDとタイムスタンプを追加
            feedback_id = ObjectId()
            feedback_data["_id"] = feedback_id
            feedback_data["created_at"] = datetime.utcnow()
            
            # データベースに保存
            await self.db.feedback.insert_one(feedback_data)
            
            return str(feedback_id)
        except Exception as e:
            print(f"Database error creating feedback: {e}")
            raise

    async def get_all_feedback(self) -> List[dict]:
        """全てのフィードバックを取得（管理者用）"""
        try:
            cursor = self.db.feedback.find().sort("created_at", -1)
            feedback = await cursor.to_list(length=None)
            
            # データを整形
            for item in feedback:
                item["id"] = str(item.pop("_id"))
                # URLを確実に含める
                if "url" not in item:
                    item["url"] = None
                    
            return feedback
        except Exception as e:
            print(f"Database error getting all feedback: {e}")
            return []

    async def get_user_feedback(self, user_id: str) -> List[dict]:
        """ユーザーのフィードバック一覧を取得"""
        try:
            cursor = self.db.feedback.find({"author_id": user_id}).sort("created_at", -1)
            feedback = await cursor.to_list(length=None)
            
            # IDを文字列に変換
            for item in feedback:
                item["id"] = str(item.pop("_id"))
                
            return feedback
        except Exception as e:
            print(f"Database error getting user feedback: {e}")
            return []

    async def update_feedback_response(
        self,
        feedback_id: str,
        response: str,
        reward: float,
        admin_id: str,
        admin_name: str
    ) -> bool:
        """フィードバックに返信"""
        try:
            # フィードバックを取得
            feedback = await self.db.feedback.find_one({"_id": ObjectId(feedback_id)})
            if not feedback:
                return False

            # 更新を実行
            result = await self.db.feedback.update_one(
                {"_id": ObjectId(feedback_id)},
                {
                    "$set": {
                        "response": response,
                        "reward": reward,
                        "responded_at": datetime.utcnow(),
                        "responded_by": admin_id,
                        "responded_by_name": admin_name,
                        "status": "answered"
                    }
                }
            )

            # 報酬がある場合、ユーザーの残高を更新
            if reward > 0:
                await self.increase_user_balance(feedback["author_id"], reward)

            return result.modified_count > 0
        except Exception as e:
            print(f"Database error updating feedback: {e}")
            return False

    async def get_active_quests(self, quest_type: str) -> List[dict]:
        """アクティブなクエストを取得"""
        try:
            cursor = self.db.quests.find({
                "type": quest_type,
                "is_active": True,
                "expires_at": {"$gt": datetime.utcnow()}
            })
            return await cursor.to_list(length=None)
        except Exception as e:
            print(f"Error getting active quests: {e}")
            return []

    async def get_user_quests(self, user_id: str) -> List[dict]:
        """ユーザーのクエスト進捗を取得"""
        try:
            cursor = self.db.user_quests.find({"user_id": user_id})
            return await cursor.to_list(length=None)
        except Exception as e:
            print(f"Error getting user quests: {e}")
            return []

    async def update_quest_progress(self, user_id: str, action_type: str, count: int = 1) -> None:
        """クエスト進捗を更新"""
        try:
            # アクティブなクエストを取得
            quests = await self.get_active_quests_by_action(action_type)
            
            for quest in quests:
                quest_id = str(quest["_id"])
                
                # ユーザーのクエスト進捗を更新
                await self.db.user_quests.update_one(
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
                
                # 進捗確認と完了フラグ設定
                user_quest = await self.db.user_quests.find_one({
                    "user_id": user_id,
                    "quest_id": quest_id
                })
                
                if user_quest and user_quest["progress"] >= quest["required_count"]:
                    await self.db.user_quests.update_one(
                        {"_id": user_quest["_id"]},
                        {
                            "$set": {
                                "completed": True,
                                "completed_at": datetime.utcnow()
                            }
                        }
                    )
        except Exception as e:
            print(f"Error updating quest progress: {e}")

    async def create_quest_notification(self, user_id: str, quest_title: str, reward: float) -> bool:
        """クエスト報酬の通知を作成"""
        try:
            notification = {
                "user_id": user_id,
                "type": "quest_reward",
                "title": "クエスト報酬を獲得",
                "content": f"{quest_title}のクエストを完了し、{reward} PARCを獲得しました。",
                "created_at": datetime.utcnow(),
                "read": False
            }
            await self.db.notifications.insert_one(notification)
            return True
        except Exception as e:
            print(f"Error creating quest notification: {e}")
            return False

    async def claim_quest_reward(self, user_id: str, quest_id: str) -> bool:
        """クエスト報酬を受け取る"""
        try:
            # クエストの存在確認
            quest = await self.db.quests.find_one({"_id": ObjectId(quest_id)})
            if not quest:
                print(f"Quest not found: {quest_id}")
                return False

            # ユーザークエストの確認
            user_quest = await self.db.user_quests.find_one({
                "user_id": user_id,
                "quest_id": quest_id,
                "completed": True,
                "reward_claimed": False
            })
            
            if not user_quest:
                print(f"User quest not found or already claimed: {user_id}, {quest_id}")
                return False

            # 報酬を付与
            reward_amount = float(quest["reward"])
            
            # ユーザーの残高を更新
            result = await self.db.users.update_one(
                {"discord_id": user_id},
                {"$inc": {"balance": reward_amount}}
            )
            
            if result.modified_count == 0:
                print(f"Failed to update user balance: {user_id}")
                return False

            # 報酬受け取り済みに更新
            await self.db.user_quests.update_one(
                {"_id": user_quest["_id"]},
                {
                    "$set": {
                        "reward_claimed": True,
                        "claimed_at": datetime.utcnow()
                    }
                }
            )

            # 通知を作成
            notification = {
                "user_id": user_id,
                "type": "quest_reward",
                "title": "クエスト報酬を獲得",
                "content": f"{quest['title']}のクエストを完了し、{reward_amount} PARCを獲得しました。",
                "created_at": datetime.utcnow(),
                "read": False
            }
            await self.db.notifications.insert_one(notification)

            print(f"Quest reward claimed successfully: {user_id}, {quest_id}, {reward_amount} PARC")
            return True
            
        except Exception as e:
            print(f"Error claiming quest reward: {e}")
            return False

    async def create_quest(self, quest_data: dict) -> str:
        """クエストを作成"""
        try:
            quest_id = ObjectId()
            quest_data["_id"] = quest_id
            await self.db.quests.insert_one(quest_data)
            return str(quest_id)
        except Exception as e:
            print(f"Error creating quest: {e}")
            raise

    async def get_active_quests_by_action(self, action_type: str) -> List[dict]:
        """アクションタイプに基づくアクティブなクエストを取得"""
        try:
            cursor = self.db.quests.find({
                "action_type": action_type,
                "is_active": True,
                "expires_at": {"$gt": datetime.utcnow()}
            })
            quests = await cursor.to_list(length=None)
            for quest in quests:
                quest["id"] = str(quest["_id"])  # _idをidに変換
            return quests
        except Exception as e:
            print(f"Error getting active quests by action: {e}")
            return []

    async def auto_update_quests(self):
        """期限切れクエストの更新とデイリー/ウィークリークエストの生成"""
        try:
            # 期限切れクエストを無効化
            await self.db.quests.update_many(
                {
                    "expires_at": {"$lt": datetime.utcnow()},
                    "is_active": True
                },
                {"$set": {"is_active": False}}
            )

            # 新しいデイリークエストを生成
            daily_template = daily_quest_templates[
                randint(0, len(daily_quest_templates) - 1)
            ]
            await self.create_quest({
                **daily_template,
                "expires_at": datetime.utcnow() + timedelta(days=1),
                "is_active": True,
                "created_at": datetime.utcnow()
            })

            # 新しいウィークリークエストを生成（月曜日の場合）
            if datetime.utcnow().weekday() == 0:
                weekly_template = weekly_quest_templates[
                    randint(0, len(weekly_quest_templates) - 1)
                ]
                await self.create_quest({
                    **weekly_template,
                    "expires_at": datetime.utcnow() + timedelta(weeks=1),
                    "is_active": True,
                    "created_at": datetime.utcnow()
                })

        except Exception as e:
            print(f"Error in auto update quests: {e}")

    async def create_exchange_request(self, request_data: dict) -> str:
        """交換リクエストを作成"""
        try:
            request_id = ObjectId()
            request_data["_id"] = request_id
            await self.db.exchange_requests.insert_one(request_data)
            return str(request_id)
        except Exception as e:
            print(f"Error creating exchange request: {e}")
            raise

    async def decrease_user_balance(self, user_id: str, amount: float) -> bool:
        """ユーザーの残高を減少"""
        try:
            result = await self.db.users.update_one(
                {
                    "discord_id": user_id,
                    "balance": {"$gte": amount}
                },
                {"$inc": {"balance": -amount}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error decreasing user balance: {e}")
            return False

    async def complete_exchange_request(self, exchange_id: str, admin_id: str) -> bool:
        """交換リクエストを完了処理"""
        try:
            # 交換リクエストを取得
            exchange = await self.db.exchange_requests.find_one({"_id": ObjectId(exchange_id)})
            if not exchange:
                print(f"Exchange request not found: {exchange_id}")
                return False

            # すでに完了済みの場合は処理しない
            if exchange.get("completed"):
                print(f"Exchange request already completed: {exchange_id}")
                return False

            # 交換リクエストを完了に更新
            result = await self.db.exchange_requests.update_one(
                {"_id": ObjectId(exchange_id)},
                {
                    "$set": {
                        "completed": True,
                        "completed_at": datetime.utcnow(),
                        "completed_by": admin_id
                    }
                }
            )

            if result.modified_count > 0:
                # 通知を作成
                await self.create_notification({
                    "user_id": exchange["user_id"],
                    "type": "exchange_completed",
                    "title": "PARC交換完了",
                    "content": f"{exchange['amount']} PARCの交換が完了しました。",
                    "created_at": datetime.utcnow(),
                    "read": False
                })
                return True
            return False

        except Exception as e:
            print(f"Error completing exchange request: {e}")
            return False

    async def create_notification(self, notification_data: dict) -> bool:
        """通知を作成"""
        try:
            notification_id = ObjectId()
            notification_data["_id"] = notification_id
            await self.db.notifications.insert_one(notification_data)
            return True
        except Exception as e:
            print(f"Error creating notification: {e}")
            return False

    async def get_exchange_requests(self) -> list:
        """PARC交換リクエスト一覧を取得"""
        try:
            # 最新の申請順に取得
            exchanges = []
            cursor = self.db.exchange_requests.find().sort("created_at", -1)
            async for exchange in cursor:
                exchange["id"] = str(exchange["_id"])
                del exchange["_id"]
                exchanges.append(exchange)
            return exchanges
        except Exception as e:
            print(f"Error getting exchange requests: {e}")
            return []

    async def get_user_notifications(self, user_id: str) -> list:
        """ユーザーの通知一覧を取得"""
        try:
            notifications = []
            cursor = self.db.notifications.find({
                "user_id": user_id
            }).sort("created_at", -1)  # 新しい順に取得
            
            async for notification in cursor:
                notification["id"] = str(notification["_id"])
                del notification["_id"]
                notifications.append(notification)
            return notifications
        except Exception as e:
            print(f"Error getting user notifications: {e}")
            return []

    async def count_unread_reports(self):
        """未読の通報数をカウント"""
        try:
            count = await self.db.reports.count_documents({"status": "pending"})
            return count
        except Exception as e:
            print(f"Error counting unread reports: {e}")
            return 0

    async def count_unread_feedback(self):
        """未回答のフィードバック数をカウント"""
        try:
            count = await self.db.feedback.count_documents({"status": "pending"})
            return count
        except Exception as e:
            print(f"Error counting unread feedback: {e}")
            return 0

    async def count_quest_notifications(self):
        """クエスト関連の通知数をカウント"""
        try:
            # 例：期限切れクエストの数
            count = await self.db.quests.count_documents({"expires_at": {"$lt": datetime.now()}})
            return count
        except Exception as e:
            print(f"Error counting quest notifications: {e}")
            return 0

    async def count_pending_exchanges(self):
        """未処理の交換リクエスト数をカウント"""
        try:
            count = await self.db.exchanges.count_documents({"status": "pending"})
            return count
        except Exception as e:
            print(f"Error counting pending exchanges: {e}")
            return 0

    async def create_security_log(self, log_data: dict) -> str:
        """セキュリティイベントログを保存"""
        try:
            result = await self.db.security_logs.insert_one(log_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating security log: {e}")
            return None

    async def get_security_logs(
        self, 
        user_id: str = None,
        ip_address: str = None,
        event_type: str = None,
        severity: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        limit: int = 100
    ) -> List[dict]:
        """セキュリティログの取得"""
        try:
            query = {}
            
            # フィルタの構築
            if user_id:
                query["user_id"] = user_id
            if ip_address:
                query["ip_address"] = ip_address
            if event_type:
                query["event_type"] = event_type
            if severity:
                query["severity"] = severity
            
            # 日付範囲フィルタ
            if start_date or end_date:
                query["timestamp"] = {}
                if start_date:
                    query["timestamp"]["$gte"] = start_date
                if end_date:
                    query["timestamp"]["$lte"] = end_date
            
            # クエリ実行
            logs = await self.db.security_logs.find(query).sort("timestamp", -1).limit(limit).to_list(length=None)
            
            # IDをフォーマット
            for log in logs:
                log["id"] = str(log.pop("_id"))
                
            return logs
        except Exception as e:
            print(f"Error getting security logs: {e}")
            return []

    async def get_all_admins(self):
        """全ての管理者ユーザーを取得"""
        admins = await self.db.users.find({"is_admin": True}).to_list(length=100)
        return admins

    async def count_security_notifications(self):
        """重要なセキュリティログの数をカウント"""
        try:
            # 優先度が高いセキュリティイベントのみカウント (WARNING, ERROR, CRITICAL)
            current_time = datetime.utcnow()
            one_day_ago = current_time - timedelta(hours=24)
            
            count = await self.db.security_logs.count_documents({
                "severity": {"$in": ["WARNING", "ERROR", "CRITICAL"]},
                "timestamp": {"$gte": one_day_ago},
                "notified": {"$ne": True}  # 未通知のもののみ
            })
            return count
        except Exception as e:
            print(f"Error counting security notifications: {e}")
            return 0

    async def mark_quest_notifications_as_read(self):
        """クエスト関連の通知を既読に設定"""
        try:
            # 期限切れクエストを取得し、更新フラグを設定
            current_time = datetime.utcnow()
            
            # 既存のクエスト通知を既読に設定
            result = await self.db.quests.update_many(
                {
                    "expires_at": {"$lt": current_time},
                    "notification_sent": {"$ne": True}
                },
                {"$set": {"notification_sent": True}}
            )
            
            # クエスト関連の管理者通知も既読に設定
            await self.db.notifications.update_many(
                {
                    "type": {"$in": ["quest_expired", "quest_generated"]},
                    "read": False
                },
                {"$set": {"read": True}}
            )
            
            return result.modified_count
        except Exception as e:
            print(f"Error marking quest notifications as read: {e}")
            return 0

    async def mark_exchanges_as_read(self):
        """交換リクエスト通知を既読に設定"""
        try:
            result = await self.db.exchange_requests.update_many(
                {"notification_sent": {"$ne": True}},
                {"$set": {"notification_sent": True}}
            )
            
            # 交換関連の管理者通知も既読に設定
            await self.db.notifications.update_many(
                {
                    "type": "exchange_request",
                    "read": False
                },
                {"$set": {"read": True}}
            )
            
            return result.modified_count
        except Exception as e:
            print(f"Error marking exchange notifications as read: {e}")
            return 0

    # api/utils/db.py に追加する関数（存在しない場合）
    async def mark_reports_as_read(self):
        """通報通知を既読に設定"""
        try:
            # 通報ステータスの更新ではなく、通知状態のみを更新
            result = await self.db.reports.update_many(
                {"notification_sent": {"$ne": True}},
                {"$set": {"notification_sent": True}}
            )
            
            # 通報関連の管理者通知も既読に設定
            await self.db.notifications.update_many(
                {
                    "type": {"$regex": "report_"},
                    "read": False
                },
                {"$set": {"read": True}}
            )
            
            return result.modified_count
        except Exception as e:
            print(f"Error marking reports as read: {e}")
            return 0

    async def mark_feedback_as_read(self):
        """フィードバック通知を既読に設定"""
        try:
            result = await self.db.feedback.update_many(
                {"notification_sent": {"$ne": True}},
                {"$set": {"notification_sent": True}}
            )
            
            # フィードバック関連の管理者通知も既読に設定
            await self.db.notifications.update_many(
                {
                    "type": "feedback_received", 
                    "read": False
                },
                {"$set": {"read": True}}
            )
            
            return result.modified_count
        except Exception as e:
            print(f"Error marking feedback as read: {e}")
            return 0

# グローバルなデータベースインスタンス
db = Database()