from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
import os
import base64
from datetime import datetime, timedelta
import requests
import logging

router = APIRouter()
logger = logging.getLogger("api.crypto")

# マーケットデータのキャッシュと最終更新時間
market_data_cache = None
last_cache_update = datetime.min

@router.get("/market")
async def get_market_data():
    """マーケットデータを取得"""
    global market_data_cache, last_cache_update
    
    try:
        # キャッシュが有効かチェック (1分間有効)
        cache_valid = (datetime.now() - last_cache_update).total_seconds() < 60
        
        if market_data_cache and cache_valid:
            return market_data_cache
        
        # WebSocketサーバーからデータを取得
        try:
            response = requests.get("http://localhost:8001/api/crypto/market", timeout=5)
            
            if response.status_code == 200:
                market_data_cache = response.json()
                last_cache_update = datetime.now()
                return market_data_cache
        except requests.RequestException as e:
            logger.error(f"WebSocketサーバー接続エラー: {e}")
            
        # WebSocketサーバーからの取得に失敗した場合はフォールバック処理
        # 画像ファイルを読み込む（相対パスに修正）
        image_path = os.path.join(
            os.path.dirname(__file__), 
            "../../bot/data/website_chart.png"
        )
        
        if not os.path.exists(image_path):
            image_path = os.path.join(
                os.path.dirname(__file__), 
                "../static/default_chart.png"
            )
            
            if not os.path.exists(image_path):
                logger.warning("チャート画像が見つかりません")
                # チャートなしでデータを返す
                market_data_cache = {
                    "success": True,
                    "data": {
                        "price": {
                            "current": 1250,
                            "change_rate": 0.0
                        },
                        "volume": {
                            "24h": 0
                        },
                        "market_cap": 12500000,
                        "timestamp": int(datetime.utcnow().timestamp()),
                        "chart": ""
                    }
                }
                last_cache_update = datetime.now()
                return market_data_cache
        
        with open(image_path, "rb") as image_file:
            chart_base64 = base64.b64encode(image_file.read()).decode()

        # マーケットデータを返す
        market_data_cache = {
            "success": True,
            "data": {
                "price": {
                    "current": 1250,
                    "change_rate": 2.5
                },
                "volume": {
                    "24h": 50000
                },
                "market_cap": 12500000,
                "timestamp": int(datetime.utcnow().timestamp()),
                "chart": chart_base64
            }
        }
        last_cache_update = datetime.now()
        return market_data_cache
        
    except Exception as e:
        logger.error(f"マーケットデータ取得エラー: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )