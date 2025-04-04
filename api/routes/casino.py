from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
import random
from api.routes.auth import oauth2_scheme, verify_token 
from api.utils.db import db
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse

router = APIRouter()

class BetRequest(BaseModel):
    amount: int
    game: str

class ResultRequest(BaseModel):
    game: str
    won: bool
    amount: int
    multiplier: float = 1.0
    pattern: Optional[str] = None

@router.post("/bet")
async def place_bet(request: BetRequest, token: str = Depends(oauth2_scheme)):
    """カジノでベットを行う"""
    try:
        # ユーザーIDを取得
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
            
        # 金額のバリデーション
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="ベット額は1以上である必要があります")
            
        # 残高チェック
        current_balance = user.get('balance', 0)
        if current_balance < request.amount:
            raise HTTPException(status_code=400, detail="残高が不足しています")
        
        try:
            # ベットを記録
            await db.db.casino_bets.insert_one({
                "user_id": user_id,
                "username": user.get("username", "Unknown"),
                "avatar": user.get("avatar"),
                "game": request.game,
                "amount": request.amount,
                "timestamp": datetime.utcnow(),
                "completed": False
            })
            
            # 残高を減らす
            await db.db.users.update_one(
                {"discord_id": user_id},
                {"$inc": {"balance": -request.amount}}
            )
            
            # 更新された残高を取得
            updated_user = await db.get_user_by_discord_id(user_id)
            updated_balance = updated_user.get('balance', 0)
            
            return JSONResponse(  # Response() から JSONResponse() へ変更
                content={
                    "success": True, 
                    "message": "ベットが正常に処理されました", 
                    "current_balance": updated_balance
                }
            )
        except Exception as e:
            # データベース処理のエラーを明示的に処理
            print(f"データベース処理エラー: {str(e)}")
            raise HTTPException(status_code=500, detail=f"データベース処理エラー: {str(e)}")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ベット処理エラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部エラー: {str(e)}")

@router.post("/result")
async def process_result(request: ResultRequest, token: str = Depends(oauth2_scheme)):
    """カジノの勝敗結果を処理"""
    try:
        # ユーザーIDを取得
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
        
        try:    
            # 最後のベットを探す
            latest_bet = await db.db.casino_bets.find_one({
                "user_id": user_id,
                "game": request.game,
                "completed": False
            }, sort=[("timestamp", -1)])
            
            if not latest_bet:
                raise HTTPException(status_code=400, detail="処理対象のベットが見つかりません")
                
            # 勝敗結果を更新
            win_amount = 0
            if request.won:
                win_amount = int(request.amount * request.multiplier)
                
                # 残高を増やす
                await db.db.users.update_one(
                    {"discord_id": user_id},
                    {"$inc": {"balance": win_amount}}
                )
                
                # 連勝記録を更新
                await db.db.users.update_one(
                    {"discord_id": user_id},
                    {"$inc": {"casino_win_streak": 1}}
                )
            else:
                # 負けた場合は連勝記録をリセット
                await db.db.users.update_one(
                    {"discord_id": user_id},
                    {"$set": {"casino_win_streak": 0}}
                )
            
            # ベットを完了状態に更新
            await db.db.casino_bets.update_one(
                {"_id": latest_bet["_id"]},
                {
                    "$set": {
                        "completed": True,
                        "won": request.won,
                        "multiplier": request.multiplier,
                        "win_amount": win_amount,
                        "pattern": request.pattern,
                        "completed_at": datetime.utcnow()
                    }
                }
            )
            
            # ユーザーの最新情報を取得
            updated_user = await db.get_user_by_discord_id(user_id)
            
            return JSONResponse(  # Response() から JSONResponse() へ変更
                content={
                    "success": True, 
                    "won": request.won,
                    "amount": win_amount if request.won else 0,
                    "current_balance": updated_user.get("balance", 0),
                    "message": "結果が処理されました"
                }
            )
        except HTTPException as e:
            raise e
        except Exception as e:
            print(f"データベース処理エラー: {str(e)}")
            raise HTTPException(status_code=500, detail=f"データベース処理エラー: {str(e)}")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"結果処理エラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部エラー: {str(e)}")

@router.get("/leaderboard")
async def get_leaderboard(
    period: str = "daily"
):
    """カジノランキングを取得"""
    try:
        # 期間に応じた集計開始時間
        now = datetime.utcnow()
        if period == "daily":
            start_time = datetime(now.year, now.month, now.day)
        elif period == "weekly":
            # 現在の曜日から週の開始日を計算（月曜日を週初めとする）
            days_to_subtract = now.weekday()  # 月曜:0, 日曜:6
            start_time = datetime(now.year, now.month, now.day) - timedelta(days=days_to_subtract)
        elif period == "monthly":
            start_time = datetime(now.year, now.month, 1)
        else:
            raise HTTPException(status_code=400, detail="無効な期間パラメータです")
        
        # MongoDB集計パイプライン
        pipeline = [
            # 期間でフィルタリング
            {"$match": {
                "completed": True, 
                "completed_at": {"$gte": start_time}
            }},
            # ユーザーごとに集計
            {"$group": {
                "_id": "$user_id",
                "username": {"$first": "$username"},
                "avatar": {"$first": "$avatar"},
                "winnings": {"$sum": {"$cond": [{"$eq": ["$won", True]}, "$win_amount", 0]}},
                "plays": {"$sum": 1},
                "wins": {"$sum": {"$cond": [{"$eq": ["$won", True]}, 1, 0]}},
                "loses": {"$sum": {"$cond": [{"$eq": ["$won", False]}, 1, 0]}}
            }},
            # 勝利金額でソート
            {"$sort": {"winnings": -1}},
            # 上位20人に制限
            {"$limit": 20}
        ]
        
        leaderboard_data = []
        async for doc in db.db.casino_bets.aggregate(pipeline):
            # ユーザーの連勝記録を取得
            user = await db.db.users.find_one({"discord_id": doc["_id"]})
            win_streak = user.get("casino_win_streak", 0) if user else 0
            
            leaderboard_data.append({
                "discord_id": doc["_id"],
                "username": doc["username"],
                "avatar": doc["avatar"],
                "winnings": doc["winnings"],
                "plays": doc["plays"],
                "wins": doc["wins"],
                "loses": doc["loses"],
                "win_streak": win_streak
            })
        
        return {"period": period, "leaderboard": leaderboard_data}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ランキング取得エラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部エラー: {str(e)}")