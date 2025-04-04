from fastapi import FastAPI, Request, Response, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from starlette.middleware.base import BaseHTTPMiddleware
import time
from collections import defaultdict
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from api.utils.config import Config
from api.utils.db import db
# 循環インポートを避けるためsecurityモジュールを後でインポート
from api.routes import auth, users, forums, admin, feedback, quests, exchange, notifications, crypto, daily, casino, health
from api.utils.quest_manager import QuestManager
# 直接関数をインポート
from api.utils.security import rate_limiter, advanced_rate_limiter, token_bucket_rate_limiter
from api.middleware.ddos_protection import DDoSProtectionMiddleware
from api.utils.scheduler import setup_scheduler
import logging
from fastapi.responses import JSONResponse

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",  # levellevel → levelname に修正
    handlers=[
        logging.FileHandler("api_logs.log"),
        logging.StreamHandler()
    ]
)

# FastAPIアプリケーションの作成
app = FastAPI(
    title=Config.APP_NAME,
    version=Config.VERSION,
    description="Paraccoli API Server"
)

scheduler = setup_scheduler()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RateLimitMiddlewareクラスを修正
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        max_requests: int = 60,
        window_seconds: int = 60
    ):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.request_counts = defaultdict(list)
        # 特定のエンドポイントに対する制限を設定
        self.endpoint_limits = {
            "/api/users/me": {"max": 120, "window": 60},  # 残高確認用に緩和
            "/api/casino/bet": {"max": 20, "window": 60},
            "/api/casino/result": {"max": 20, "window": 60},
            "/api/health": {"max": 120, "window": 60}
        }

    async def dispatch(self, request: Request, call_next):
        # クライアントIPを取得
        client_ip = request.client.host
        
        # 現在時刻を取得
        current_time = time.time()
        
        # パスを取得
        path = request.url.path
        
        # エンドポイント固有の制限を取得（なければデフォルト）
        limits = self.endpoint_limits.get(path, {"max": self.max_requests, "window": self.window_seconds})
        max_requests = limits["max"]
        window_seconds = limits["window"]
        
        # IPとエンドポイントの組み合わせをキーとして使用
        key = f"{client_ip}:{path}"
        
        # ウィンドウ内のリクエストのみを保持
        if key not in self.request_counts:
            self.request_counts[key] = []
            
        self.request_counts[key] = [
            timestamp for timestamp in self.request_counts[key]
            if timestamp > current_time - window_seconds
        ]
        
        # リクエスト数をチェック
        if len(self.request_counts[key]) >= max_requests:
            return JSONResponse(
                content={"detail": "レート制限を超過しました。しばらく待ってから再試行してください。"},
                status_code=429
            )
        
        # リクエスト時間を記録
        self.request_counts[key].append(current_time)
        
        # 次のミドルウェアまたはエンドポイントへ進める
        return await call_next(request)

# アプリケーションにミドルウェアを追加
app.add_middleware(RateLimitMiddleware)
app.add_middleware(DDoSProtectionMiddleware)

# スタートアップイベント
@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    print("Starting application...")
    
    # 設定の検証
    Config.validate()
    
    # データベース接続を初期化（一度だけ）
    await db.connect()
    
    # IPブラックリストをロード
    from api.utils.security import load_blacklist_from_db
    await load_blacklist_from_db()
    
    # クエストの自動更新スケジュール設定
    scheduler.add_job(
        QuestManager.check_expired_quests,
        'interval',
        hours=1,
        id='check_expired_quests'
    )
    
    # セキュリティ関連の定期タスクを追加
    from api.utils.scheduled_tasks import cleanup_expired_blacklists, analyze_security_trends
    scheduler.add_job(cleanup_expired_blacklists, "interval", hours=4)
    scheduler.add_job(analyze_security_trends, "interval", hours=24)
    
    scheduler.start()
    logging.info("Application started, scheduler is running")

# シャットダウンイベント
@app.on_event("shutdown")
async def shutdown_event():
    """アプリケーション終了時の処理"""
    # データベース接続のクローズ
    await db.close()
    # スケジューラを停止
    scheduler.shutdown()
    logging.info("Application shutting down, scheduler stopped")

# ルーターの登録
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(forums.router, prefix="/api/forums", tags=["forums"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
app.include_router(quests.router, prefix="/api/quests", tags=["quests"])
app.include_router(exchange.router, prefix="/api/exchange", tags=["exchange"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(crypto.router, prefix="/api/crypto", tags=["crypto"])
app.include_router(daily.router, prefix="/api/daily", tags=["daily"])
app.include_router(casino.router, prefix="/api/casino", tags=["casino"])
app.include_router(health.router, prefix="/api/health", tags=["health"])

# ヘルスチェックエンドポイント
@app.get("/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "ok", "version": Config.VERSION, "scheduler_running": scheduler.running}

# レート制限を掛ける必要があるエンドポイントに依存関数を追加
@app.get("/api/public-data")
async def get_public_data(rate_limit: None = Depends(lambda req: advanced_rate_limiter(req, "public"))):
    # 処理内容
    return {"data": "公開データ"}

# より厳しいレート制限が必要なエンドポイント
@app.post("/api/sensitive-action")
async def perform_sensitive_action(
    request: Request,
    rate_limit: None = Depends(lambda r: rate_limiter(r, max_requests=10, window_seconds=60))
):
    # 処理内容
    return {"status": "action performed"}

# トークンバケットレート制限のテスト用エンドポイント 
# 注: 実際のログインはauth.routerに実装されているため、こちらはサンプルとする
@app.post("/api/rate-limit-test")
async def rate_limit_test(
    request: Request,
    token_limit: None = Depends(lambda req: token_bucket_rate_limiter(req, capacity=15, refill_rate=0.5, cost=5))
):
    # 処理内容
    token = "sample_token_for_testing"  # サンプルのトークン
    return {"access_token": token, "token_type": "bearer"}