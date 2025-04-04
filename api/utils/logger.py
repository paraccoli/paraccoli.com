import logging
from datetime import datetime
import json
import os

# ログディレクトリの設定
log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
os.makedirs(log_dir, exist_ok=True)

# 一般的なロガーの設定
logger = logging.getLogger('api')
logger.setLevel(logging.INFO)

# 一般ログのファイルハンドラー
general_log_file = os.path.join(log_dir, f'api-{datetime.now().strftime("%Y-%m-%d")}.log')
general_file_handler = logging.FileHandler(general_log_file)
general_file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(general_file_handler)

# セキュリティログの設定
security_logger = logging.getLogger('security')
security_logger.setLevel(logging.INFO)

# セキュリティログのファイルハンドラー
security_log_file = os.path.join(log_dir, f'security-{datetime.now().strftime("%Y-%m-%d")}.log')
file_handler = logging.FileHandler(security_log_file)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
security_logger.addHandler(file_handler)

def log_security_event(event_type: str, details: dict, severity: str = 'INFO'):
    """
    セキュリティイベントをログに記録
    """
    log_data = {
        'event_type': event_type,
        'timestamp': datetime.utcnow().isoformat(),
        'severity': severity,
        'details': details
    }
    
    if severity == 'INFO':
        security_logger.info(json.dumps(log_data))
    elif severity == 'WARNING':
        security_logger.warning(json.dumps(log_data))
    elif severity == 'ERROR':
        security_logger.error(json.dumps(log_data))
    elif severity == 'CRITICAL':
        security_logger.critical(json.dumps(log_data))

# モジュールレベルで他のモジュールから直接importできる形でオブジェクトを公開
# ここが重要：明示的にモジュールからエクスポートするロガーとメソッドを定義
__all__ = ['logger', 'security_logger', 'log_security_event']