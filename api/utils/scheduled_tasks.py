# api/utils/scheduled_tasks.py
from datetime import datetime, timedelta
from api.utils.db import db
from api.utils.security import log_security_event

async def cleanup_expired_blacklists():
    """期限切れのブラックリストエントリをクリーンアップ"""
    current_time = datetime.utcnow()
    
    result = await db.db.ip_blacklist.delete_many({
        "expires_at": {"$lt": current_time}
    })
    
    print(f"Cleaned up {result.deleted_count} expired blacklist entries")

async def analyze_security_trends():
    """セキュリティイベントの傾向を分析"""
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    
    # 過去24時間の攻撃パターンを集計
    pipeline = [
        {"$match": {"timestamp": {"$gt": one_day_ago}, "severity": {"$in": ["WARNING", "ERROR", "CRITICAL"]}}},
        {"$group": {"_id": "$event_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    attack_patterns = await db.db.security_logs.aggregate(pipeline).to_list(length=20)
    
    # 結果を管理者に通知
    if attack_patterns:
        most_common = attack_patterns[0]
        if most_common["count"] > 100:  # 閾値を設定
            await db.create_notification({
                "user_id": "admin",  # 全管理者向け
                "type": "security_alert",
                "title": "セキュリティ傾向の警告",
                "content": f"過去24時間で {most_common['_id']} イベントが {most_common['count']} 回発生しています。",
                "created_at": datetime.utcnow(),
                "read": False
            })