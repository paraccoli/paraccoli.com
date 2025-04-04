from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Dict, Optional
from api.routes.auth import verify_token, oauth2_scheme, is_admin
from api.utils.db import db
from api.models.reports import Report, ReportResponse
from pydantic import BaseModel
from api.models.quest import QuestType, QuestActionType, daily_quest_templates, weekly_quest_templates
from datetime import datetime, timedelta
from api.utils.logger import logger
import math
from bson import ObjectId

router = APIRouter()

class FeedbackReply(BaseModel):
    response: str
    reward: float = 0  # 報酬フィールドを追加

@router.get("/reports")
async def get_reports(user: dict = Depends(is_admin)):
    """管理者用の通報一覧取得"""
    try:
        reports = await db.get_reports()
        # モデルによるバリデーションを回避
        return reports
    except Exception as e:
        print(f"Error getting reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")

@router.put("/reports/{report_id}")
async def update_report_status(
    report_id: str,
    data: Dict[str, str],
    user: dict = Depends(is_admin)
):
    """通報ステータスを更新"""
    try:
        if not report_id:
            raise HTTPException(status_code=400, detail="Invalid report ID")

        status = data.get("status")
        if status not in ["pending", "resolved", "rejected"]:
            raise HTTPException(status_code=400, detail="Invalid status value")
            
        result = await db.update_report_status(report_id, status, user["discord_id"])
        if not result:
            raise HTTPException(status_code=404, detail="Report not found")
            
        return {"message": "Report status updated successfully", "status": status}
        
    except Exception as e:
        print(f"Error updating report status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: str,
    user: dict = Depends(is_admin)
):
    """通報を削除"""
    try:
        result = await db.delete_report(report_id)
        if not result:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"message": "Report deleted successfully"}
    except Exception as e:
        print(f"Error deleting report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback")
async def get_all_feedback(user: dict = Depends(is_admin)):
    """フィードバック一覧を取得"""
    feedback = await db.get_all_feedback()
    return feedback

@router.post("/feedback/{feedback_id}/reply")
async def reply_to_feedback(
    feedback_id: str,
    reply: FeedbackReply,
    user: dict = Depends(is_admin)
):
    """フィードバックに返信"""
    try:
        result = await db.update_feedback_response(
            feedback_id=feedback_id,
            response=reply.response,
            reward=reply.reward,  # 報酬を追加
            admin_id=user["discord_id"],
            admin_name=user["username"]  # 管理者名を追加
        )
        if not result:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"message": "Reply sent successfully"}
    except Exception as e:
        print(f"Error replying to feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quests/generate")
async def generate_quests(user: dict = Depends(is_admin)):
    """クエストを生成"""
    try:
        # 既存のアクティブなクエストを無効化
        await db.db.quests.update_many(
            {"is_active": True},
            {"$set": {"is_active": False}}
        )

        # 既存のユーザークエスト進捗をリセット
        await db.db.user_quests.delete_many({})
        print("Deleted all user quest progress")

        # デイリークエストの生成
        for quest in daily_quest_templates:
            # 同じタイプと行動のクエストを検索
            existing_quest = await db.db.quests.find_one({
                "type": QuestType.DAILY,
                "action_type": quest["action_type"],
                "is_active": False
            })

            if existing_quest:
                # 既存のクエストを更新
                await db.db.quests.update_one(
                    {"_id": existing_quest["_id"]},
                    {
                        "$set": {
                            **quest,
                            "expires_at": datetime.utcnow() + timedelta(days=1),
                            "is_active": True,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                print(f"Updated daily quest: {quest['title']}")
            else:
                # 新規クエストを作成
                new_quest_id = await db.create_quest({
                    **quest,
                    "expires_at": datetime.utcnow() + timedelta(days=1),
                    "is_active": True,
                    "created_at": datetime.utcnow()
                })
                print(f"Created new daily quest: {quest['title']}")

        # ウィークリークエストの生成（同様の処理）
        for quest in weekly_quest_templates:
            existing_quest = await db.db.quests.find_one({
                "type": QuestType.WEEKLY,
                "action_type": quest["action_type"],
                "is_active": False
            })

            if existing_quest:
                await db.db.quests.update_one(
                    {"_id": existing_quest["_id"]},
                    {
                        "$set": {
                            **quest,
                            "expires_at": datetime.utcnow() + timedelta(weeks=1),
                            "is_active": True,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                print(f"Updated weekly quest: {quest['title']}")
            else:
                new_quest_id = await db.create_quest({
                    **quest,
                    "expires_at": datetime.utcnow() + timedelta(weeks=1),
                    "is_active": True,
                    "created_at": datetime.utcnow()
                })
                print(f"Created new weekly quest: {quest['title']}")

        return {"message": "クエストが生成され、進捗がリセットされました"}
    except Exception as e:
        print(f"Error generating quests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quests/generate/daily")
async def generate_daily_quests(user: dict = Depends(is_admin)):
    """デイリークエストを生成"""
    try:
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

        # デイリークエストの生成
        for quest in daily_quest_templates:
            existing_quest = await db.db.quests.find_one({
                "type": QuestType.DAILY,
                "action_type": quest["action_type"],
                "is_active": False
            })

            if existing_quest:
                await db.db.quests.update_one(
                    {"_id": existing_quest["_id"]},
                    {
                        "$set": {
                            **quest,
                            "expires_at": datetime.utcnow() + timedelta(days=1),
                            "is_active": True,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
            else:
                await db.create_quest({
                    **quest,
                    "expires_at": datetime.utcnow() + timedelta(days=1),
                    "is_active": True,
                    "created_at": datetime.utcnow()
                })

        return {"message": "デイリークエストが生成されました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quests/generate/weekly")
async def generate_weekly_quests(user: dict = Depends(is_admin)):
    """ウィークリークエストを生成"""
    try:
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

        # ウィークリークエストの生成
        for quest in weekly_quest_templates:
            existing_quest = await db.db.quests.find_one({
                "type": QuestType.WEEKLY,
                "action_type": quest["action_type"],
                "is_active": False
            })

            if existing_quest:
                await db.db.quests.update_one(
                    {"_id": existing_quest["_id"]},
                    {
                        "$set": {
                            **quest,
                            "expires_at": datetime.utcnow() + timedelta(weeks=1),
                            "is_active": True,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
            else:
                await db.create_quest({
                    **quest,
                    "expires_at": datetime.utcnow() + timedelta(weeks=1),
                    "is_active": True,
                    "created_at": datetime.utcnow()
                })

        return {"message": "ウィークリークエストが生成されました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/forums/posts/{post_id}")
async def admin_delete_post(post_id: str, user: dict = Depends(is_admin)):
    """管理者による投稿削除"""
    try:
        # 投稿の存在確認
        post = await db.get_forum_post(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # 投稿と関連コメントを削除
        success = await db.delete_forum_post(post_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete post")

        return {"message": "Post deleted successfully"}
    except Exception as e:
        print(f"Error deleting post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# PARCリクエスト一覧取得エンドポイントを追加
@router.get("/exchange")
async def get_exchange_requests(user: dict = Depends(is_admin)):
    """PARC交換リクエスト一覧を取得"""
    try:
        # データベースから交換リクエストを取得
        exchanges = await db.get_exchange_requests()
        return exchanges
    except Exception as e:
        print(f"Error getting exchange requests: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exchange requests")

# PARCリクエスト完了処理エンドポイントを追加
@router.put("/exchange/{exchange_id}/complete")
async def complete_exchange_request(
    exchange_id: str,
    user: dict = Depends(is_admin)
):
    """PARC交換リクエストを完了処理"""
    try:
        # 交換リクエストを完了に更新
        success = await db.complete_exchange_request(exchange_id, user["discord_id"])
        if not success:
            raise HTTPException(status_code=400, detail="交換リクエストの完了に失敗しました")

        return {"message": "交換リクエストを完了しました"}
    except Exception as e:
        print(f"Error completing exchange request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notifications/count")
async def get_admin_notification_counts(user: dict = Depends(is_admin)):
    """管理者向けの各種通知数を取得"""
    try:
        # 未読の通報数
        unread_reports = await db.count_unread_reports()
        
        # 未回答のフィードバック数
        unread_feedback = await db.count_unread_feedback()
        
        # クエスト関連の通知数（例：期限切れクエスト）
        quest_notifications = await db.count_quest_notifications()
        
        # 未処理の交換リクエスト数
        pending_exchanges = await db.count_pending_exchanges()
        
        # セキュリティ関連の通知数（例：重大な警告）
        security_notifications = await db.count_security_notifications()

        return {
            "reports": unread_reports,
            "feedback": unread_feedback,
            "quests": quest_notifications,
            "exchange": pending_exchanges,
            "security": security_notifications  # セキュリティ通知
        }
    except Exception as e:
        print(f"Error getting admin notification counts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notification counts")

@router.post("/notifications/read/{notification_type}")
async def mark_notifications_read(notification_type: str, user: dict = Depends(is_admin)):
    """管理者向けの通知を既読にする"""
    allowed_types = ["reports", "feedback", "quests", "exchange", "security"]  # security を追加
    
    if notification_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid notification type")
    
    try:
        # 対応する通知タイプを既読にする処理
        if notification_type == "reports":
            await db.mark_reports_as_read()
        elif notification_type == "feedback":
            await db.mark_feedback_as_read()
        elif notification_type == "quests":
            await db.mark_quest_notifications_as_read()
        elif notification_type == "exchange":
            await db.mark_exchanges_as_read()
        elif notification_type == "security":
            # セキュリティ通知も既読化
            await db.db.security_logs.update_many(
                {"notified": {"$ne": True}},
                {"$set": {"notified": True}}
            )
            
        return {"message": f"{notification_type} marked as read"}
    except Exception as e:
        print(f"Error marking {notification_type} as read: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to mark {notification_type} as read")

@router.get("/security-logs")
async def get_security_logs(
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    admin: dict = Depends(is_admin)
):
    """セキュリティログを取得（管理者用）"""
    try:
        # 日付文字列をdatetime形式に変換 (エラーハンドリングを強化)
        start_date_obj = None
        end_date_obj = None
        
        if start_date:
            try:
                start_date_obj = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            except ValueError:
                print(f"Invalid start_date format: {start_date}")
        
        if end_date:
            try:
                end_date_obj = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            except ValueError:
                print(f"Invalid end_date format: {end_date}")
        
        # デバッグログ
        print(f"Fetching security logs with filters: user_id={user_id}, ip_address={ip_address}, event_type={event_type}, severity={severity}")
        print(f"Date range: {start_date_obj} to {end_date_obj}")
        
        logs = await db.get_security_logs(
            user_id=user_id,
            ip_address=ip_address,
            event_type=event_type,
            severity=severity,
            start_date=start_date_obj,
            end_date=end_date_obj,
            limit=limit
        )
        
        # JSON変換可能な形式に整形
        formatted_logs = []
        for log in logs:
            # タイムスタンプがdatetimeオブジェクトの場合だけ変換
            if isinstance(log.get("timestamp"), datetime):
                log["timestamp"] = log["timestamp"].isoformat()
            formatted_logs.append(log)
        
        # デバッグログ
        print(f"Returning {len(formatted_logs)} security logs")
        
        return formatted_logs
    except Exception as e:
        print(f"Error getting security logs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch security logs: {str(e)}")

# ユーザー一覧エンドポイント
@router.get("/users")
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    user: dict = Depends(is_admin)
):
    """ユーザー一覧を取得"""
    try:
        skip = (page - 1) * page_size
        
        # 検索条件を構築
        query = {}
        if search:
            query = {
                "$or": [
                    {"username": {"$regex": search, "$options": "i"}},
                    {"_id": {"$regex": search, "$options": "i"}},
                ]
            }
        
        # ユーザー数のカウント
        total_users = await db.db.users.count_documents(query)
        total_pages = math.ceil(total_users / page_size)
        
        # ユーザーデータの取得
        cursor = db.db.users.find(query).skip(skip).limit(page_size).sort("created_at", -1)
        users = await cursor.to_list(length=page_size)
        
        # MongoDBのObjectIdをstr型に変換
        for user in users:
            user["_id"] = str(user["_id"])
        
        return {
            "users": users,
            "total": total_users,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
    
    except Exception as e:
        logger.error(f"Failed to get users: {str(e)}")
        raise HTTPException(status_code=500, detail="ユーザー一覧の取得中にエラーが発生しました")

# ユーザーのPARC残高更新エンドポイント
@router.put("/users/{user_id}/balance")
async def update_user_balance(
    user_id: str,
    data: dict = Body(...),
    admin_user: dict = Depends(is_admin)
):
    """管理者によるユーザーPARC残高の更新"""
    try:
        # リクエストの検証
        action = data.get("action")
        amount = data.get("amount")
        reason = data.get("reason", "管理者による調整")
        
        if action not in ["add", "remove"]:
            raise HTTPException(status_code=400, detail="無効な操作です")
        
        if not isinstance(amount, int) or amount <= 0:
            raise HTTPException(status_code=400, detail="無効な金額です")
        
        # ユーザーの存在確認
        target_user = await db.db.users.find_one({"_id": ObjectId(user_id)})
        if not target_user:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
        
        # 残高更新
        update_operation = {"$inc": {"balance": amount}} if action == "add" else {"$inc": {"balance": -amount}}
        
        # 残高がマイナスにならないようにチェック
        if action == "remove" and target_user.get("balance", 0) < amount:
            raise HTTPException(status_code=400, detail="ユーザーの残高が不足しています")
        
        result = await db.db.users.update_one(
            {"_id": ObjectId(user_id)},
            update_operation
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="ユーザー残高の更新に失敗しました")
        
        # 通知を作成
        notification = {
            "user_id": ObjectId(user_id),
            "type": "admin_balance",
            "title": "管理者からの通知",
            "content": f"管理者があなたの口座に{amount} PARCを{'付与' if action == 'add' else '削除'}しました。",
            "created_at": datetime.utcnow(),
            "read": False
        }
        
        await db.db.notifications.insert_one(notification)
        
        # トランザクション履歴を記録
        transaction = {
            "user_id": ObjectId(user_id),
            "type": "admin_adjustment",
            "amount": amount if action == "add" else -amount,
            "currency": "PARC",
            "description": reason,
            "admin_id": ObjectId(admin_user["_id"]),
            "created_at": datetime.utcnow()
        }
        
        await db.db.transactions.insert_one(transaction)
        
        return {"success": True, "message": f"ユーザーの残高が正常に{'増加' if action == 'add' else '減少'}しました"}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to update user balance: {str(e)}")
        raise HTTPException(status_code=500, detail="ユーザー残高の更新中にエラーが発生しました")

# ユーザーをキックするエンドポイント
@router.post("/users/{user_id}/kick")
async def kick_user(
    user_id: str,
    admin_user: dict = Depends(is_admin)
):
    """管理者によるユーザーのキック（一時的なアカウント停止）"""
    try:
        # ユーザーの存在確認
        target_user = await db.db.users.find_one({"_id": ObjectId(user_id)})
        if not target_user:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
        
        # ユーザーを一時的に停止状態にする
        result = await db.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "status": "kicked",
                "kicked_at": datetime.utcnow(),
                "kicked_by": ObjectId(admin_user["_id"]),
                "kick_reason": "管理者によるアカウント停止"
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="ユーザーのキック処理に失敗しました")
        
        # 通知を作成
        notification = {
            "user_id": ObjectId(user_id),
            "type": "admin_action",
            "title": "アカウント停止のお知らせ",
            "content": "管理者によりアカウントが一時停止されました。詳細はサポートにお問い合わせください。",
            "created_at": datetime.utcnow(),
            "read": False
        }
        
        await db.db.notifications.insert_one(notification)
        
        # 管理者ログを記録
        admin_log = {
            "admin_id": ObjectId(admin_user["_id"]),
            "target_user_id": ObjectId(user_id),
            "action": "kick",
            "details": "ユーザーを一時停止",
            "created_at": datetime.utcnow()
        }
        
        await db.db.admin_logs.insert_one(admin_log)
        
        return {"success": True, "message": "ユーザーを正常にキックしました"}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to kick user: {str(e)}")
        raise HTTPException(status_code=500, detail="ユーザーのキック処理中にエラーが発生しました")

# ユーザーをBANするエンドポイント
@router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    admin_user: dict = Depends(is_admin)
):
    """管理者によるユーザーのBAN（永久アカウント停止）"""
    try:
        # ユーザーの存在確認
        target_user = await db.db.users.find_one({"_id": ObjectId(user_id)})
        if not target_user:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
        
        # ユーザーをBAN状態にする
        result = await db.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "status": "banned",
                "banned_at": datetime.utcnow(),
                "banned_by": ObjectId(admin_user["_id"]),
                "ban_reason": "管理者による永久BAN"
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="ユーザーのBAN処理に失敗しました")
        
        # 通知を作成
        notification = {
            "user_id": ObjectId(user_id),
            "type": "admin_action",
            "title": "アカウントBANのお知らせ",
            "content": "管理者によりアカウントが永久的に制限されました。詳細はサポートにお問い合わせください。",
            "created_at": datetime.utcnow(),
            "read": False
        }
        
        await db.db.notifications.insert_one(notification)
        
        # 管理者ログを記録
        admin_log = {
            "admin_id": ObjectId(admin_user["_id"]),
            "target_user_id": ObjectId(user_id),
            "action": "ban",
            "details": "ユーザーを永久BAN",
            "created_at": datetime.utcnow()
        }
        
        await db.db.admin_logs.insert_one(admin_log)
        
        return {"success": True, "message": "ユーザーを正常にBANしました"}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to ban user: {str(e)}")
        raise HTTPException(status_code=500, detail="ユーザーのBAN処理中にエラーが発生しました")