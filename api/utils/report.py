import discord
from bot.utils.config import Config
from api.utils.db import db
from datetime import datetime

async def send_report_to_admin(post: dict, report: dict):
    """管理者に通報を通知"""
    try:
        intents = discord.Intents.default()
        intents=intents,
        bot = discord.Client()
        admin_user = await bot.fetch_user(957169126990827520)  # 管理者のID
        
        embed = discord.Embed(
            title="新しい投稿通報",
            description=f"投稿ID: {post['id']}\n理由: {report['reason']}",
            color=discord.Color.red()
        )
        
        embed.add_field(
            name="投稿者",
            value=f"<@{post['author_id']}>",
            inline=True
        )
        
        embed.add_field(
            name="通報者",
            value=f"<@{report['reporter_id']}>",
            inline=True
        )
        
        embed.add_field(
            name="投稿内容",
            value=post['content'][:1000] + "..." if len(post['content']) > 1000 else post['content'],
            inline=False
        )
        
        await admin_user.send(embed=embed)
        
    except Exception as e:
        print(f"Error sending report to admin: {e}")

async def create_site_report(target: dict, report: dict):
    """サイト内の通報を作成"""
    try:
        report_data = {
            "type": report["type"],
            "target_id": report["target_id"],
            "post_id": str(target.get("post_id", target.get("_id"))),  # コメントの場合はpost_idを、投稿の場合は_idを使用
            "reason": report["reason"],
            "reporter_id": report["reporter_id"],
            "status": "pending",
            "created_at": datetime.utcnow(),
            "reported_content": {
                "content": target.get("content"),
                "author_id": target.get("author_id"),
                "author_name": target.get("author_name")
            }
        }
        
        # データベースに通報を保存
        report_id = await db.create_report(report_data)
        return str(report_id)
        
    except Exception as e:
        print(f"Error creating report: {e}")
        raise