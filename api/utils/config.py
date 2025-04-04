import os
import secrets
from dotenv import load_dotenv
from pathlib import Path

# .envファイルの読み込み
load_dotenv()

class Config:
    """APIサーバーの設定を管理するクラス"""
    
    # アプリケーション設定
    APP_NAME = "Paraccoli API"
    VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # サーバー設定
    HOST = os.getenv("API_HOST", "0.0.0.0")
    PORT = int(os.getenv("API_PORT", "8000"))
    
    # Discord設定
    DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
    DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
    DISCORD_REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")
    
    # JWT設定
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24時間
    
    # MongoDB設定
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME = "paraccoli"
    
    # CORS設定
    CORS_ORIGINS = [
        "http://localhost:5173",  # 開発環境のフロントエンド
        "http://localhost:4173",  # プレビュー環境のフロントエンド
    ]

    # データベース設定
    MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    DB_NAME = os.getenv('DB_NAME', 'paraccoli')

    @staticmethod
    def validate():
        """必要な環境変数が設定されているか確認"""
        required_vars = [
            "DISCORD_CLIENT_ID",
            "DISCORD_CLIENT_SECRET",
            "DISCORD_REDIRECT_URI",
            "JWT_SECRET_KEY",
            "MONGODB_URI"  # MongoDBのURIを必須に追加
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
