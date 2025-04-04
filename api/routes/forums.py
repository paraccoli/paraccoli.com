from fastapi import APIRouter, Depends, HTTPException, status, Request
from ..models.forums import PostCreate, PostUpdate, Post, Comment, CommentBase, Report
from ..routes.auth import oauth2_scheme, verify_token, get_current_user
from ..utils.db import db
from ..utils.report import create_site_report
from datetime import datetime
from typing import Optional, List
from bson import ObjectId, json_util
import json
from api.utils.quest_manager import QuestManager
from pydantic import BaseModel
from api.utils.security import report_limit_required, log_security_event, check_report_attempts

router = APIRouter()

def serialize_datetime(obj):
    """datetimeオブジェクトをISOフォーマットに変換"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def serialize_objectid(obj):
    """ObjectIdを文字列に変換"""
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

class CommentCreate(BaseModel):
    content: str

@router.post("/posts")
async def create_forum_post(post: PostCreate, user: dict = Depends(get_current_user)):
    """投稿を作成"""
    try:
        # ユーザー情報を取得
        user_data = await db.get_user_by_discord_id(user["discord_id"])
        avatar_url = user_data.get("avatar") if user_data else None

        post_data = {
            **post.dict(),
            "author_id": user["discord_id"],
            "author_name": user["username"],
            "author_avatar": avatar_url,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        post_id = await db.create_forum_post(post_data)
        await QuestManager.handle_post(user["discord_id"])
        
        # ObjectIDを文字列として返す
        return {"id": str(post_id), "message": "Post created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    update_data: PostUpdate,
    token: str = Depends(oauth2_scheme)
):
    """投稿を編集"""
    user_id = await verify_token(token)
    post = await db.get_forum_post(post_id)
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["author_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    
    update_dict = update_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()
        await db.update_forum_post(post_id, update_dict)
    
    updated_post = await db.get_forum_post(post_id)
    return updated_post

@router.put("/posts/{post_id}/lock")
async def toggle_post_lock(
    post_id: str,
    token: str = Depends(oauth2_scheme)
):
    """投稿のコメントをロック/アンロック"""
    user_id = await verify_token(token)
    post = await db.get_forum_post(post_id)
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["author_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to lock this post")
    
    new_lock_state = not post.get("is_locked", False)
    await db.update_forum_post(post_id, {"is_locked": new_lock_state})
    
    return {"is_locked": new_lock_state}

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    token: str = Depends(oauth2_scheme)
):
    """投稿を削除"""
    try:
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        post = await db.get_forum_post(post_id)
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # 管理者または投稿者本人のみ削除可能
        is_admin = user.get("is_admin", False)
        is_author = post["author_id"] == user_id
        
        if not (is_admin or is_author):
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
        success = await db.delete_forum_post(post_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete post")
        
        return {"message": "Post deleted successfully"}
        
    except Exception as e:
        print(f"Error deleting post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, comment: CommentCreate, user: dict = Depends(get_current_user)):
    """コメントを作成"""
    try:
        # ユーザー情報を取得
        user_data = await db.get_user_by_discord_id(user["discord_id"])
        
        comment_data = {
            **comment.dict(),
            "post_id": post_id,
            "author_id": user["discord_id"],
            "author_name": user["username"],
            "author_avatar": user_data.get("avatar"),  # Discordアバターを設定
            "created_at": datetime.utcnow()  # 作成日時を設定
        }
        
        comment_id = await db.create_forum_comment(comment_data)
        
        # クエスト進捗を更新
        await QuestManager.handle_comment(user["discord_id"])
        
        # 作成したコメントの情報を返す
        return {
            "id": comment_id,
            "content": comment.content,
            "author_id": user["discord_id"],
            "author_name": user["username"],
            "author_avatar": user_data.get("avatar"),
            "created_at": datetime.utcnow().isoformat(),
            "post_id": post_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(
    post_id: str,
    comment_id: str,
    token: str = Depends(oauth2_scheme)
):
    """コメントを削除"""
    try:
        user_id = await verify_token(token)
        user = await db.get_user_by_discord_id(user_id)
        comment = await db.get_comment(comment_id)
        
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        # コメントの投稿IDが一致することを確認
        if comment["post_id"] != post_id:
            raise HTTPException(status_code=400, detail="Comment does not belong to this post")
        
        # 管理者は全てのコメントを削除可能
        if user.get("is_admin"):
            success = await db.delete_comment(comment_id, post_id)
            if not success:
                raise HTTPException(status_code=500, detail="Failed to delete comment")
            return {"message": "Comment deleted successfully"}
        
        # 一般ユーザーの場合は、コメント作成者またはフォーラム投稿の作成者のみ削除可能
        post = await db.get_forum_post(post_id)
        if comment["author_id"] != user_id and post["author_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
        
        success = await db.delete_comment(comment_id, post_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete comment")
        
        return {"message": "Comment deleted successfully"}
        
    except Exception as e:
        print(f"Error deleting comment: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete comment")

# api/routes/forums.py
@router.get("/posts")
async def get_posts(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """フォーラムの投稿一覧を取得"""
    try:
        posts = await db.get_forum_posts(category, tag, page, limit)
        
        # 各投稿の作成者情報を取得
        for post in posts:
            author_id = post.get("author_id")
            if (author_id):
                author = await db.get_user_by_discord_id(author_id)
                if author:
                    # nicknameの代わりにusernameを直接使用
                    post["author_name"] = author.get("username", "不明なユーザー")
                    post["author_avatar"] = author.get("avatar")
            else:
                post["author_name"] = "不明なユーザー"
                post["author_avatar"] = None
        
        return posts
    except Exception as e:
        print(f"Error getting forum posts: {e}")
        raise HTTPException(status_code=500, detail="フォーラム投稿の取得に失敗しました")

@router.get("/posts/{post_id}")
async def get_forum_post(post_id: str):
    """特定のフォーラム投稿を取得"""
    try:
        post = await db.get_forum_post(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="投稿が見つかりません")
        
        # コンテンツが確実に含まれていることを確認
        post["content"] = post.get("content", "")
        
        # 作成者情報を取得
        author_id = post.get("author_id")
        if author_id:
            author = await db.get_user_by_discord_id(author_id)
            if author:
                post["author_name"] = author.get("username", "不明なユーザー")
                post["author_avatar"] = author.get("avatar")
        else:
            post["author_name"] = "不明なユーザー"
            post["author_avatar"] = None
        
        # コメントリストが確実に含まれていることを確認
        if "comments" not in post:
            post["comments"] = []
        
        # コメントの作成者情報も取得
        if isinstance(post["comments"], list):
            for comment in post["comments"]:
                comment_author_id = comment.get("author_id")
                if comment_author_id:
                    comment_author = await db.get_user_by_discord_id(comment_author_id)
                    if comment_author:
                        comment["author_name"] = comment_author.get("username", "不明なユーザー")
                        comment["author_avatar"] = comment_author.get("avatar")
                else:
                    comment["author_name"] = "不明なユーザー"
                    comment["author_avatar"] = None
        
        return post
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting forum post: {e}")
        raise HTTPException(status_code=500, detail="投稿の取得に失敗しました")

@router.post("/posts/{post_id}/reactions")  # URLを修正
async def add_reaction(
    post_id: str,
    user: dict = Depends(get_current_user)
):
    """投稿にリアクションを追加"""
    try:
        # 自分の投稿へのリアクションを防ぐ
        post = await db.get_forum_post(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
            
        if post["author_id"] == user["discord_id"]:
            raise HTTPException(status_code=400, detail="Cannot react to your own post")

        success = await db.add_post_reaction(post_id, user["discord_id"])
        if success:
            # クエスト進捗を更新
            await QuestManager.handle_reaction(user["discord_id"])
            return {"success": True, "message": "Reaction added successfully"}
        else:
            return {"success": False, "message": "Already reacted or post not found"}
            
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error adding reaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# トークン検証を使用して report_limit_required を修正
def report_limit_with_auth():
    """通報制限検証関数（トークン認証込み）"""
    async def dependency(
        request: Request,
        target_id: str = None, 
        token: str = Depends(oauth2_scheme)
    ):
        try:
            user_id = await verify_token(token)
            
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

@router.post("/posts/{post_id}/report")
async def report_post(
    post_id: str,
    report: Report,
    request: Request,
    user_id: str = Depends(report_limit_with_auth())  # 修正した依存関数を使用
):
    """投稿を通報"""
    try:
        # 通報元のコンテンツを取得
        if report.type == "post":
            target = await db.get_forum_post(post_id)
            target_id = post_id
        else:  # comment
            target = await db.get_comment(report.target_id)
            target_id = report.target_id
            
        if not target:
            raise HTTPException(status_code=404, detail="Target content not found")
        
        # 自分のコンテンツは通報できない
        if target.get("author_id") == user_id:
            await log_security_event(
                user_id=user_id,
                ip_address=request.client.host,
                event_type="self_report_attempt",
                details={"target_type": report.type, "target_id": target_id},
                severity="WARNING"
            )
            raise HTTPException(status_code=400, detail="Cannot report your own content")
        
        # サイト内に通報を作成
        report_id = await create_site_report(target, {
            **report.dict(),
            "reporter_id": user_id
        })
        
        # 通報を記録
        await log_security_event(
            user_id=user_id,
            ip_address=request.client.host,
            event_type="content_reported",
            details={
                "report_id": report_id,
                "target_type": report.type,
                "target_id": target_id,
                "reason": report.reason
            },
            severity="INFO"
        )
        
        return {
            "id": report_id,
            "message": "Report submitted successfully"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        await log_security_event(
            user_id=user_id,
            ip_address=request.client.host,
            event_type="report_error",
            details={"error": str(e)},
            severity="ERROR"
        )
        print(f"Error reporting: {e}")
        raise HTTPException(status_code=500, detail=str(e))