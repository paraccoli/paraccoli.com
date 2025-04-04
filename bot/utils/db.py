from pymongo import MongoClient
from .config import Config

class Database:
    """MongoDBとの接続を管理するクラス"""
    
    def __init__(self):
        """データベース接続の初期化"""
        self.client = MongoClient(Config.MONGODB_URI)
        self.db = self.client[Config.DB_NAME]
        
        # コレクションの初期化
        self.users = self.db.users
        
        # インデックスの作成
        self._create_indexes()
    
    def _create_indexes(self):
        """必要なインデックスを作成"""
        # discord_idでユニークインデックスを作成
        self.users.create_index('discord_id', unique=True)
    
    def close(self):
        """データベース接続を閉じる"""
        self.client.close()

    async def get_user(self, discord_id: str):
        """ユーザー情報を取得"""
        return await self.users.find_one({'discord_id': discord_id})

    async def create_user(self, user_data: dict):
        """新規ユーザーを作成"""
        return await self.users.insert_one(user_data)

    async def update_user(self, discord_id: str, update_data: dict):
        """ユーザー情報を更新"""
        return await self.users.update_one(
            {'discord_id': discord_id},
            {'$set': update_data}
        )

# グローバルなデータベース接続インスタンス
db = Database()