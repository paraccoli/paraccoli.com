from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from api.routes.auth import oauth2_scheme, verify_token
from api.utils.db import db
from api.utils.quest_manager import QuestManager

router = APIRouter()

@router.post("/claim")
async def claim_daily_bonus(token: str = Depends(oauth2_scheme)):
    """デイリーボーナスを受け取る"""
    try:
        # ユーザーIDを取得
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
            
        # 最終ボーナス受け取り日時を確認
        last_claim = user.get("daily_bonus_last_claim")
        now = datetime.utcnow()
        
        # 本日すでに受け取り済みかチェック
        if last_claim and last_claim.date() == now.date():
            raise HTTPException(status_code=400, detail="本日はすでにデイリーボーナスを受け取っています")
            
        # 連続ログイン日数を計算
        streak = user.get("daily_bonus_streak", 0)
        
        # 昨日受け取っていたら連続日数を増やす、そうでなければリセット
        if last_claim and (now.date() - last_claim.date()) == timedelta(days=1):
            streak += 1
        elif last_claim and (now.date() - last_claim.date()) > timedelta(days=1):
            streak = 1
        else:
            streak = 1
            
        # ボーナス金額を計算
        base_amount = 100  # 基本ボーナス額
        bonus_multiplier = min(streak, 30) / 10  # 最大x3.0までボーナス
        
        # 特別ボーナス (7日、14日、30日でさらにボーナス)
        special_bonus = 0
        if streak == 7:
            special_bonus = 200  # 7日連続で200追加
        elif streak == 14:
            special_bonus = 500  # 14日連続で500追加
        elif streak == 30:
            special_bonus = 1000  # 30日連続で1000追加
            
        amount = int(base_amount * (1 + bonus_multiplier)) + special_bonus
        
        # ユーザーの残高を更新
        await db.increase_user_balance(user_id, amount)
        
        # 最終受け取り日時と連続日数を更新
        await db.db.users.update_one(
            {"discord_id": user_id},
            {"$set": {
                "daily_bonus_last_claim": now,
                "daily_bonus_streak": streak,
                "daily_bonus_total_claims": user.get("daily_bonus_total_claims", 0) + 1
            }}
        )
        
        # クエスト進捗を更新
        await QuestManager.handle_daily_bonus(user_id)
        
        return {
            "success": True,
            "streak": streak,
            "amount": amount,
            "next_claim": (now + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"),
            "message": f"{streak}日連続ログイン！ {amount} PARCを獲得しました！"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"デイリーボーナス処理エラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部エラー: {str(e)}")

@router.get("/status")
async def check_daily_status(token: str = Depends(oauth2_scheme)):
    """デイリーボーナスのステータスを確認"""
    try:
        # ユーザーIDを取得
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
            
        now = datetime.utcnow()
        last_claim = user.get("daily_bonus_last_claim")
        streak = user.get("daily_bonus_streak", 0)
        total_claims = user.get("daily_bonus_total_claims", 0)
        
        # 今日すでに受け取り済みかどうか
        claimed_today = last_claim and last_claim.date() == now.date()
        
        # 次回のボーナス時間を計算
        next_claim = None
        if last_claim:
            next_day = datetime.combine(last_claim.date() + timedelta(days=1), datetime.min.time())
            next_claim = next_day.strftime("%Y-%m-%d %H:%M:%S")
        
        # 明日受け取れるボーナス予測額
        next_streak = streak + 1 if last_claim and (now.date() - last_claim.date()) <= timedelta(days=1) else 1
        base_amount = 100
        bonus_multiplier = min(next_streak, 30) / 10
        
        special_bonus = 0
        if next_streak == 7:
            special_bonus = 200
        elif next_streak == 14:
            special_bonus = 500
        elif next_streak == 30:
            special_bonus = 1000
            
        next_amount = int(base_amount * (1 + bonus_multiplier)) + special_bonus
        
        return {
            "claimed_today": claimed_today,
            "streak": streak,
            "total_claims": total_claims,
            "next_claim": next_claim,
            "next_streak": next_streak,
            "next_amount": next_amount,
            "can_claim": not claimed_today
        }
        
    except Exception as e:
        print(f"デイリーボーナスステータスエラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部エラー: {str(e)}")