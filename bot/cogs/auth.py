import discord
from discord import app_commands
from discord.ext import commands
import secrets
from datetime import datetime, timedelta
from typing import Optional
from bot.models.user import User
from bot.utils.db import db
from bot.utils.config import Config

class Auth(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    def generate_login_token(self):
        """ログイン用のトークンを生成"""
        return secrets.token_urlsafe(32)

    def create_login_embed(self):
        """ログイン案内のEmbedを作成"""
        embed = discord.Embed(
            title="PARCウェブサイト",
            description="以下のURLからウェブサイトにアクセスし、Discordでログインしてください。",
            color=discord.Color.blue()
        )
        
        embed.add_field(
            name="ウェブサイトURL",
            value=f"[こちらをクリック]({Config.WEBSITE_URL})",
            inline=False
        )
        
        embed.add_field(
            name="手順",
            value="1. URLにアクセス\n"
                  "2. 「Discordでログイン」をクリック\n"
                  "3. 認証を許可する",
            inline=False
        )
        
        return embed

    @app_commands.command(name="login", description="PARCウェブサイトにアクセス")
    async def login(self, interaction: discord.Interaction):
        """ウェブサイトへの誘導コマンド"""
        try:
            embed = self.create_login_embed()
            await interaction.response.send_message(
                embed=embed,
                ephemeral=True  # プライベートメッセージとして送信
            )
            
        except Exception as e:
            print(f"Error in login command: {e}")
            await interaction.response.send_message(
                "エラーが発生しました。しばらく待ってから再度お試しください。",
                ephemeral=True
            )

async def setup(bot):
    await bot.add_cog(Auth(bot))

class User:
    def __init__(
        self,
        discord_id: str,
        username: str,
        balance: int = 0,
        created_at: Optional[datetime] = None,
        last_login: Optional[datetime] = None,
        login_token: Optional[str] = None,  # login_tokenを追加
        token_expires: Optional[datetime] = None  # token_expiresを追加
    ):
        self.discord_id = discord_id
        self.username = username
        self.balance = balance
        self.created_at = created_at or datetime.utcnow()
        self.last_login = last_login or datetime.utcnow()
        self.login_token = login_token  # login_tokenを追加
        self.token_expires = token_expires  # token_expiresを追加