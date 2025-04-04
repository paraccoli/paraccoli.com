import os
from dotenv import load_dotenv

# .envファイルの読み込み
load_dotenv()

class Config:
    """設定を管理するクラス"""
    
    # Discordの設定
    DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
    DISCORD_GUILD_ID = os.getenv('DISCORD_GUILD_ID')
    
    # MongoDBの設定
    MONGODB_URI = os.getenv('MONGODB_URI')
    DB_NAME = 'paraccoli'
    
    # トークン関連の設定
    INITIAL_BALANCE = 1000  # 新規ユーザーの初期残高
    
    # ロール設定
    VERIFIED_ROLE_ID = os.getenv('VERIFIED_ROLE_ID')

    # ウェブサイトの設定
    WEBSITE_URL = os.getenv('WEBSITE_URL', 'https://example.com')

    @staticmethod
    def validate():
        """必要な環境変数が設定されているか確認"""
        required_vars = [
            'DISCORD_TOKEN',
            'DISCORD_GUILD_ID',
            'MONGODB_URI',
            'VERIFIED_ROLE_ID'
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")