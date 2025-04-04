import discord
from discord.ext import commands
import asyncio
from bot.utils.config import Config  # 修正
from bot.utils.db import db         # 修正

# Botの設定
class ParaccoliBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.members = True
        
        super().__init__(
            command_prefix='!',  # スラッシュコマンドを使用するため、通常のプレフィックスは不要
            intents=intents,
            # application_idは削除（Discordが自動で設定）
        )
    
    async def setup_hook(self):
        """Bot起動時の初期設定"""
        # Cogの読み込み
        await self.load_extension('bot.cogs.auth')  # 修正
        
        # スラッシュコマンドの同期
        guild = discord.Object(id=Config.DISCORD_GUILD_ID)
        self.tree.copy_global_to(guild=guild)
        await self.tree.sync(guild=guild)

    async def on_ready(self):
        """Bot準備完了時のイベント"""
        print(f'Logged in as {self.user} (ID: {self.user.id})')
        print('------')
        
        # ステータスの設定
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name="/login でサイトにログイン"
            )
        )

async def main():
    """メイン関数"""
    # 設定の検証
    Config.validate()
    
    # Botの起動
    async with ParaccoliBot() as bot:
        try:
            await bot.start(Config.DISCORD_TOKEN)
        except Exception as e:
            print(f"Error starting bot: {e}")
        finally:
            # データベース接続のクリーンアップ
            db.close()

# Botの実行
if __name__ == "__main__":
    asyncio.run(main())