from fastapi import Request, HTTPException, Depends
from typing import Dict, List, Optional, Callable
from datetime import datetime, timedelta
import functools
import time
from api.utils.db import db
from collections import defaultdict

# auth.py からの依存関係を削除

# 不正なアクティビティを追跡するためのインメモリストア
# 本番環境ではRedisやデータベースを使用することを推奨
login_attempts: Dict[str, List[datetime]] = {}
report_attempts: Dict[str, Dict[str, List[datetime]]] = {}
api_calls: Dict[str, List[float]] = {}  # 全般的なAPIレート制限

# グローバル設定
GLOBAL_RATE_LIMITS = {
    "default": {"requests": 60, "window": 60},  # 通常エンドポイント: 60 req/min
    "auth": {"requests": 10, "window": 60},     # 認証関連: 10 req/min
    "api": {"requests": 30, "window": 60},      # API全般: 30 req/min
    "public": {"requests": 120, "window": 60}   # 公開情報: 120 req/min
}

# エンドポイントごとの制限を定義
ENDPOINT_RATE_LIMITS = {
    "/api/auth/login": {"requests": 5, "window": 60},
    "/api/auth/register": {"requests": 3, "window": 60},
    "/api/forums/posts": {"requests": 20, "window": 60},
    "/api/users/profile": {"requests": 30, "window": 60},
}

# IP単位でのブラックリスト
ip_blacklist = set()
# ブラックリスト理由の記録
ip_blacklist_reasons = {}
# IP単位の疑わしい行動検出
suspicious_activity = defaultdict(int)
# エンドポイントごとの制限違反回数
endpoint_violations = defaultdict(lambda: defaultdict(int))

# ログイン試行のチェック
async def check_login_attempts(ip_address: str, max_attempts: int = 5, window_minutes: int = 15) -> bool:
    """
    指定されたIPアドレスからのログイン試行回数をチェック
    """
    current_time = datetime.utcnow()
    cutoff_time = current_time - timedelta(minutes=window_minutes)
    
    # 古い試行記録を削除
    if ip_address in login_attempts:
        login_attempts[ip_address] = [
            attempt for attempt in login_attempts[ip_address]
            if attempt > cutoff_time
        ]
    
    # 試行回数を確認
    if ip_address in login_attempts and len(login_attempts[ip_address]) >= max_attempts:
        # 失敗したログイン試行をログに記録
        await log_security_event(
            ip_address=ip_address,
            event_type="excessive_login_attempts",
            details={"attempts": len(login_attempts[ip_address])},
            severity="WARNING"
        )
        return False
    
    # 新しい試行を記録
    if ip_address not in login_attempts:
        login_attempts[ip_address] = []
    login_attempts[ip_address].append(current_time)
    
    return True

# 通報試行のチェック
async def check_report_attempts(
    user_id: str, 
    target_id: str = None, 
    max_attempts: int = 3, 
    window_hours: int = 24
) -> bool:
    """
    ユーザーの通報試行回数をチェック
    - 同じターゲットには24時間に1回まで
    - 全体では24時間に最大3回まで
    """
    current_time = datetime.utcnow()
    cutoff_time = current_time - timedelta(hours=window_hours)
    
    # ユーザーの通報記録を初期化
    if user_id not in report_attempts:
        report_attempts[user_id] = {
            "all": [],
            "targets": {}
        }
    
    # 古い通報記録を削除
    report_attempts[user_id]["all"] = [
        attempt for attempt in report_attempts[user_id]["all"]
        if attempt > cutoff_time
    ]
    
    # 特定のターゲットへの通報を処理
    if target_id:
        if target_id not in report_attempts[user_id]["targets"]:
            report_attempts[user_id]["targets"][target_id] = []
        
        # 古い特定ターゲット通報記録を削除
        report_attempts[user_id]["targets"][target_id] = [
            attempt for attempt in report_attempts[user_id]["targets"][target_id]
            if attempt > cutoff_time
        ]
        
        # 同じターゲットへの通報回数をチェック (最大1回/24時間)
        if len(report_attempts[user_id]["targets"][target_id]) >= 1:
            await log_security_event(
                user_id=user_id,
                event_type="duplicate_report",
                details={"target_id": target_id},
                severity="INFO"
            )
            return False
    
    # 全体の通報回数をチェック
    if len(report_attempts[user_id]["all"]) >= max_attempts:
        await log_security_event(
            user_id=user_id,
            event_type="excessive_reports",
            details={"attempts": len(report_attempts[user_id]["all"])},
            severity="WARNING"
        )
        return False
    
    # 新しい通報を記録
    report_attempts[user_id]["all"].append(current_time)
    if target_id:
        report_attempts[user_id]["targets"][target_id].append(current_time)
    
    return True

# 一般的なレート制限のためのミドルウェア依存関数
async def rate_limiter(
    request: Request,
    max_requests: int = 60,
    window_seconds: int = 60
) -> None:
    """一般的なAPIレート制限を適用するための依存関数"""
    client_ip = request.client.host
    current_time = time.time()
    
    # IPアドレスのエントリを初期化（存在しない場合）
    if client_ip not in api_calls:
        api_calls[client_ip] = []
    
    # 一定期間外のリクエストをリストから削除
    api_calls[client_ip] = [
        timestamp for timestamp in api_calls[client_ip] 
        if current_time - timestamp < window_seconds
    ]
    
    # リクエスト数をチェック
    if len(api_calls[client_ip]) >= max_requests:
        # レート制限超過を記録
        await log_security_event(
            ip_address=client_ip,
            event_type="api_rate_limit_exceeded",
            details={"endpoint": request.url.path},
            severity="WARNING"
        )
        
        raise HTTPException(
            status_code=429,
            detail=f"レート制限を超過しました。{window_seconds}秒後に再試行してください。"
        )
    
    # 新しいリクエストを記録
    api_calls[client_ip].append(current_time)

# 高度なレート制限と不正検知
async def advanced_rate_limiter(
    request: Request,
    category: str = "default"
) -> None:
    """高度なレート制限と不正検知"""
    client_ip = request.client.host
    endpoint = request.url.path
    current_time = time.time()
    
    # ブラックリストチェック
    if client_ip in ip_blacklist:
        reason = ip_blacklist_reasons.get(client_ip, "不明な理由")
        await log_security_event(
            ip_address=client_ip,
            event_type="blacklist_request_blocked",
            details={"endpoint": endpoint, "reason": reason},
            severity="WARNING"
        )
        raise HTTPException(
            status_code=403,
            detail="アクセスが制限されています。"
        )
    
    # エンドポイント固有の制限またはカテゴリ制限を適用
    if endpoint in ENDPOINT_RATE_LIMITS:
        limit_config = ENDPOINT_RATE_LIMITS[endpoint]
    else:
        limit_config = GLOBAL_RATE_LIMITS.get(category, GLOBAL_RATE_LIMITS["default"])
    
    max_requests = limit_config["requests"]
    window_seconds = limit_config["window"]
    
    # IPアドレスのエントリを初期化
    if client_ip not in api_calls:
        api_calls[client_ip] = defaultdict(list)
    
    # エンドポイント固有のリクエスト履歴
    if endpoint not in api_calls[client_ip]:
        api_calls[client_ip][endpoint] = []
    
    # 古いリクエストを削除
    api_calls[client_ip][endpoint] = [
        timestamp for timestamp in api_calls[client_ip][endpoint]
        if current_time - timestamp < window_seconds
    ]
    
    # リクエスト数をチェック
    if len(api_calls[client_ip][endpoint]) >= max_requests:
        # 違反回数を増やす
        endpoint_violations[client_ip][endpoint] += 1
        
        # 疑わしい活動ポイントを増加
        suspicious_activity[client_ip] += 1
        
        # 違反が続くとブラックリストに追加
        if endpoint_violations[client_ip][endpoint] >= 5:
            ip_blacklist.add(client_ip)
            ip_blacklist_reasons[client_ip] = f"レート制限違反を繰り返し ({endpoint})"
            
            await log_security_event(
                ip_address=client_ip,
                event_type="ip_blacklisted",
                details={"endpoint": endpoint, "violations": endpoint_violations[client_ip][endpoint]},
                severity="ERROR"
            )
        
        await log_security_event(
            ip_address=client_ip,
            event_type="advanced_rate_limit_exceeded",
            details={
                "endpoint": endpoint,
                "request_count": len(api_calls[client_ip][endpoint]),
                "window": window_seconds,
                "violation_count": endpoint_violations[client_ip][endpoint]
            },
            severity="WARNING"
        )
        
        raise HTTPException(
            status_code=429,
            detail=f"リクエスト頻度が高すぎます。{window_seconds}秒後に再試行してください。"
        )
    
    # 新しいリクエストを記録
    api_calls[client_ip][endpoint].append(current_time)

# セキュリティイベントのログ記録
async def log_security_event(
    ip_address: str = None,
    user_id: str = None,
    event_type: str = "",
    details: dict = None,
    severity: str = "INFO"
):
    """セキュリティイベントをログとデータベースに記録"""
    try:
        event_data = {
            "timestamp": datetime.utcnow(),
            "event_type": event_type,
            "severity": severity,
            "details": details or {}
        }
        
        if ip_address:
            event_data["ip_address"] = ip_address
            
        if user_id:
            event_data["user_id"] = user_id
        
        # データベースに記録
        await db.db.security_logs.insert_one(event_data)
        
        # 重大なイベントの場合は管理者通知も作成
        if severity in ["WARNING", "ERROR", "CRITICAL"]:
            await create_admin_security_notification(event_data)
            
        # コンソールにも出力
        print(f"[{severity}] {event_type}: {details} (IP: {ip_address}, User: {user_id})")
            
    except Exception as e:
        print(f"Error logging security event: {e}")

async def create_admin_security_notification(event_data: dict):
    """重要なセキュリティイベントを管理者に通知"""
    try:
        # 管理者を取得
        admins = await db.get_all_admins()
        
        for admin in admins:
            # 各管理者に通知を作成
            notification = {
                "user_id": admin["discord_id"],
                "type": "security_alert",
                "title": f"セキュリティ警告: {event_data['event_type']}",
                "content": (
                    f"重要度: {event_data['severity']}\n"
                    f"詳細: {event_data['details']}\n"
                    f"IP: {event_data.get('ip_address', '不明')}\n"
                    f"ユーザー: {event_data.get('user_id', '不明')}"
                ),
                "created_at": datetime.utcnow(),
                "read": False
            }
            
            await db.create_notification(notification)
    except Exception as e:
        print(f"Error creating admin security notification: {e}")

# レート制限デコレータ（クラスメソッドやファンクションに適用可能）
def rate_limit(max_requests: int = 60, window_seconds: int = 60):
    """
    レート制限を設定するデコレータ
    注意: FastAPIのエンドポイント関数には直接適用できません。
    代わりにDependsを使用したrate_limiter関数を使用してください。
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(self, *args, **kwargs):
            # クライアントIPアドレスを取得（必要に応じて実装を変更）
            client_ip = "127.0.0.1"  # デフォルト値
            
            # Requestオブジェクトがあれば使用
            for arg in args:
                if isinstance(arg, Request):
                    client_ip = arg.client.host
                    break
            
            # リクエスト時刻を記録
            current_time = time.time()
            
            # IPアドレスのエントリを初期化
            if client_ip not in api_calls:
                api_calls[client_ip] = []
                
            # 一定期間外のリクエストをリストから削除
            api_calls[client_ip] = [
                timestamp for timestamp in api_calls[client_ip] 
                if current_time - timestamp < window_seconds
            ]
            
            # リクエスト数をチェック
            if len(api_calls[client_ip]) >= max_requests:
                # レート制限超過を記録
                await log_security_event(
                    ip_address=client_ip,
                    event_type="rate_limit_exceeded",
                    details={"function": func.__name__},
                    severity="WARNING"
                )
                
                raise HTTPException(
                    status_code=429,
                    detail=f"レート制限を超過しました。{window_seconds}秒後に再試行してください。"
                )
            
            # 新しいリクエストを記録
            api_calls[client_ip].append(current_time)
            
            # 元の関数を実行
            return await func(self, *args, **kwargs)
        
        return wrapper
    return decorator

# エンドポイント保護デコレータ
def protected_endpoint(max_attempts: int = 5, window_minutes: int = 15):
    """
    エンドポイントを保護するデコレータ
    注意: これはファストAPIのエンドポイント関数に直接適用できません。
    カスタムミドルウェアやDependsを使用してください。
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = request.client.host
            
            # ログイン試行のレート制限をチェック
            if not await check_login_attempts(client_ip, max_attempts, window_minutes):
                await log_security_event(
                    ip_address=client_ip,
                    event_type="endpoint_rate_limited",
                    details={"endpoint": request.url.path},
                    severity="WARNING"
                )
                
                raise HTTPException(
                    status_code=429,
                    detail=f"試行回数が上限を超えました。{window_minutes}分後に再試行してください。"
                )
            
            # 元の関数を実行
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator

def report_limit_required():
    """通報のレート制限を確認する依存関数"""
    async def dependency(
        request: Request,
        target_id: str = None,
        token: str = None  # oauth2_schemeへの依存を削除
    ):
        try:
            # tokenが指定されていない場合はAutorizationヘッダーから取得
            if not token:
                auth_header = request.headers.get("Authorization")
                if not auth_header or not auth_header.startswith("Bearer "):
                    raise HTTPException(status_code=401, detail="認証エラー: トークンが見つかりません")
                token = auth_header.split(" ")[1]
            
            # トークンの検証とユーザーIDの取得は呼び出し元で行う
            user_id = "placeholder"  # 実際には呼び出し元でverify_tokenの結果を使用
            
            # 通報試行のチェック
            if not await check_report_attempts(user_id, target_id):
                raise HTTPException(
                    status_code=429, 
                    detail="通報回数の制限を超えました。24時間後に再試行してください。"
                )
                
            return user_id
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"認証エラー: {str(e)}")
    
    return dependency

# パターン検知用の定数
REQUEST_PATTERNS = {
    "rapid_sequence": {"threshold": 10, "window": 5},    # 5秒に10リクエスト
    "endpoint_hopping": {"threshold": 8, "window": 10},  # 10秒に8つの異なるエンドポイント
    "error_rate": {"threshold": 0.8, "window": 30}       # 30秒間のエラー率80%以上
}

# リクエストパターンの記録
request_history = defaultdict(list)
endpoint_history = defaultdict(list)
error_history = defaultdict(list)

async def detect_suspicious_activity(request: Request):
    """不審なリクエストパターンを検出する"""
    client_ip = request.client.host
    endpoint = request.url.path
    current_time = time.time()
    
    # リクエスト履歴を更新
    request_history[client_ip].append(current_time)
    endpoint_history[client_ip].append((current_time, endpoint))
    
    # 古い履歴を削除
    request_history[client_ip] = [t for t in request_history[client_ip] if current_time - t < 60]
    endpoint_history[client_ip] = [(t, e) for t, e in endpoint_history[client_ip] if current_time - t < 60]
    error_history[client_ip] = [(t, s) for t, s in error_history[client_ip] if current_time - t < 60]
    
    suspicion_score = 0
    details = {}
    
    # 急速なリクエストシーケンス検出
    rapid_config = REQUEST_PATTERNS["rapid_sequence"]
    recent_requests = [t for t in request_history[client_ip] if current_time - t < rapid_config["window"]]
    if len(recent_requests) > rapid_config["threshold"]:
        suspicion_score += 2
        details["rapid_requests"] = len(recent_requests)
    
    # エンドポイントホッピング検出（異なるエンドポイントへの短時間アクセス）
    hopping_config = REQUEST_PATTERNS["endpoint_hopping"]
    recent_endpoints = [e for t, e in endpoint_history[client_ip] if current_time - t < hopping_config["window"]]
    unique_endpoints = set(recent_endpoints)
    if len(unique_endpoints) > hopping_config["threshold"]:
        suspicion_score += 3
        details["endpoint_hopping"] = len(unique_endpoints)
    
    # エラー率検出
    error_config = REQUEST_PATTERNS["error_rate"]
    recent_responses = [status for t, status in error_history[client_ip] if current_time - t < error_config["window"]]
    if recent_responses:
        error_count = sum(1 for status in recent_responses if status >= 400)
        error_rate = error_count / len(recent_responses)
        if error_rate > error_config["threshold"] and len(recent_responses) > 5:
            suspicion_score += 3
            details["high_error_rate"] = f"{error_rate:.2f}"
    
    # 高い疑惑スコアでブラックリストに追加
    if suspicion_score >= 5:
        if client_ip not in ip_blacklist:
            ip_blacklist.add(client_ip)
            ip_blacklist_reasons[client_ip] = f"不審な活動パターン検出: {details}"
            
            await log_security_event(
                ip_address=client_ip,
                event_type="suspicious_activity_detected",
                details=details,
                severity="ERROR"
            )
            
            return True
    
    return False

# レスポンス後のエラー履歴更新
def update_error_history(client_ip: str, status_code: int):
    """ステータスコード履歴を更新する"""
    error_history[client_ip].append((time.time(), status_code))

# api/utils/security.py に追加
from datetime import datetime
from typing import Dict, Tuple

# トークンバケットの状態管理
token_buckets: Dict[str, Tuple[int, datetime]] = {}  # IP -> (tokens, last_update)

async def token_bucket_rate_limiter(
    request: Request,
    capacity: int = 60,
    refill_rate: int = 1,  # トークン/秒
    cost: int = 1  # 標準リクエストコスト
) -> None:
    """トークンバケットアルゴリズムによるレート制限"""
    client_ip = request.client.host
    endpoint = request.url.path
    now = datetime.utcnow()
    
    # 特定のエンドポイントは高いコストを設定
    if endpoint.startswith("/api/auth/"):
        cost = 5  # 認証関連は高コスト
    elif endpoint.startswith("/api/admin/"):
        cost = 3  # 管理者機能は中程度のコスト
    elif "search" in endpoint:
        cost = 2  # 検索操作は通常より高コスト
    
    # バケットを初期化（存在しない場合）
    if client_ip not in token_buckets:
        token_buckets[client_ip] = (capacity, now)
    
    # 現在のトークン数と最終更新時間を取得
    tokens, last_update = token_buckets[client_ip]
    
    # 経過時間に基づきトークンを補充
    elapsed_seconds = (now - last_update).total_seconds()
    new_tokens = min(capacity, tokens + int(elapsed_seconds * refill_rate))
    
    # リクエストの処理に十分なトークンがあるか確認
    if new_tokens < cost:
        # トークン不足を記録
        await log_security_event(
            ip_address=client_ip,
            event_type="token_bucket_limit_exceeded",
            details={
                "endpoint": endpoint,
                "available_tokens": new_tokens,
                "required_tokens": cost
            },
            severity="INFO"
        )
        
        wait_time = (cost - new_tokens) / refill_rate
        raise HTTPException(
            status_code=429,
            detail=f"リソース使用量の上限に達しました。{int(wait_time) + 1}秒後に再試行してください。"
        )
    
    # トークンを消費して更新
    token_buckets[client_ip] = (new_tokens - cost, now)

# api/utils/security.py に追加

# IP評価システム
ip_reputation = defaultdict(int)  # -100 (悪意あり) ~ 100 (信頼)
IP_REPUTATION_THRESHOLD = -50  # このスコア以下でブラックリスト化

def update_ip_reputation(ip_address: str, score_change: int):
    """IPアドレスの評価スコアを更新"""
    ip_reputation[ip_address] = max(-100, min(100, ip_reputation[ip_address] + score_change))
    
    # 評価スコアが閾値を下回った場合はブラックリスト化
    if ip_reputation[ip_address] <= IP_REPUTATION_THRESHOLD and ip_address not in ip_blacklist:
        ip_blacklist.add(ip_address)
        ip_blacklist_reasons[ip_address] = f"評価スコア低下: {ip_reputation[ip_address]}"
        return True
        
    return False

# IPブラックリスト管理
async def add_to_blacklist(ip_address: str, reason: str, expiry_hours: int = 24):
    """IPアドレスをブラックリストに追加"""
    ip_blacklist.add(ip_address)
    ip_blacklist_reasons[ip_address] = reason
    
    # データベースに記録して永続化
    await db.db.ip_blacklist.insert_one({
        "ip_address": ip_address,
        "reason": reason,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=expiry_hours)
    })
    
    await log_security_event(
        ip_address=ip_address,
        event_type="ip_blacklisted",
        details={"reason": reason, "expiry_hours": expiry_hours},
        severity="WARNING"
    )

async def remove_from_blacklist(ip_address: str):
    """IPアドレスをブラックリストから削除"""
    if ip_address in ip_blacklist:
        ip_blacklist.remove(ip_address)
        if ip_address in ip_blacklist_reasons:
            del ip_blacklist_reasons[ip_address]
    
    # データベースからも削除
    await db.db.ip_blacklist.delete_one({"ip_address": ip_address})
    
    await log_security_event(
        ip_address=ip_address,
        event_type="ip_removed_from_blacklist",
        details={},
        severity="INFO"
    )

# アプリケーション起動時にブラックリストを読み込む関数
async def load_blacklist_from_db():
    """データベースからブラックリストをロード"""
    current_time = datetime.utcnow()
    
    # 有効なブラックリストエントリを取得
    blacklist_entries = await db.db.ip_blacklist.find({
        "expires_at": {"$gt": current_time}
    }).to_list(length=1000)
    
    # メモリ内ブラックリストを更新
    for entry in blacklist_entries:
        ip_blacklist.add(entry["ip_address"])
        ip_blacklist_reasons[entry["ip_address"]] = entry["reason"]
    
    print(f"Loaded {len(blacklist_entries)} IP addresses to blacklist")