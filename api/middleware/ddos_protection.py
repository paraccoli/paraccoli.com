# api/middleware/ddos_protection.py
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from api.utils.security import detect_suspicious_activity, update_error_history
import time

class DDoSProtectionMiddleware(BaseHTTPMiddleware):
    """DDoS攻撃からの保護とトラフィック監視"""
    
    def __init__(self, app):
        super().__init__(app)
        self.request_counts = {}
        self.last_cleanup = time.time()
    
    async def dispatch(self, request: Request, call_next):
        # クライアントIPを取得
        client_ip = request.client.host
        start_time = time.time()
        
        # 定期的なクリーンアップ
        if start_time - self.last_cleanup > 300:  # 5分ごと
            self._cleanup_old_data()
            self.last_cleanup = start_time
        
        # リクエストパターン分析
        is_suspicious = await detect_suspicious_activity(request)
        
        if is_suspicious:
            # 不審なリクエストをブロック
            return Response(
                content='{"detail":"不審なアクティビティが検出されました。"}',
                status_code=403,
                media_type="application/json"
            )
        
        try:
            # 正常に処理を続行
            response = await call_next(request)
            
            # レスポンス情報の記録
            update_error_history(client_ip, response.status_code)
            
            return response
            
        except Exception as e:
            # 例外が発生した場合も記録
            update_error_history(client_ip, 500)
            raise e
    
    def _cleanup_old_data(self):
        """古いデータをクリーンアップする"""
        # 必要に応じて実装
        pass