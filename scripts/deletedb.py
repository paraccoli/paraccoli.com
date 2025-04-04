import asyncio
import sys
import os
from typing import Optional

# プロジェクトルートをPYTHONPATHに追加
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from motor.motor_asyncio import AsyncIOMotorClient
from api.utils.config import Config

async def delete_database(mongodb_url: str, db_name: str) -> bool:
    """データベースを削除する"""
    client: Optional[AsyncIOMotorClient] = None
    try:
        client = AsyncIOMotorClient(mongodb_url)
        if db_name in await client.list_database_names():
            await client.drop_database(db_name)
            print(f"データベース '{db_name}' を削除しました")
            return True
        else:
            print(f"データベース '{db_name}' が見つかりません")
            return False
    except Exception as e:
        print(f"データベース削除中にエラーが発生しました: {e}")
        return False
    finally:
        if client is not None:
            client.close()

async def main():
    """メイン処理"""
    try:
        # 確認プロンプト
        print(f"警告: データベース '{Config.DB_NAME}' を削除しようとしています。")
        confirmation = input("本当に削除しますか？ (yes/no): ")

        if confirmation.lower() == 'yes':
            result = await delete_database(Config.MONGODB_URL, Config.DB_NAME)
            if not result:
                print("データベースの削除に失敗しました")
        else:
            print("操作がキャンセルされました")

    except Exception as e:
        print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    asyncio.run(main())