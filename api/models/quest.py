from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
from enum import Enum
from random import randint

class QuestType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    SPECIAL = "special"

class QuestActionType(str, Enum):
    POST = "post"
    COMMENT = "comment"
    LOGIN = "login"
    REACT = "react"
    PROMOTION = "promotion"  # 宣伝報告用のアクションタイプを追加

class QuestBase(BaseModel):
    title: str
    description: str
    type: QuestType
    action_type: QuestActionType
    required_count: int
    reward: int
    expires_at: Optional[datetime] = None

class Quest(QuestBase):
    id: str
    created_at: datetime
    is_active: bool = True

class UserQuest(BaseModel):
    user_id: str
    quest_id: str
    progress: int = 0
    completed: bool = False
    completed_at: Optional[datetime] = None
    reward_claimed: bool = False

# デイリークエストのテンプレート
daily_quest_templates = [
    {
        "title": "デイリーログイン",
        "description": "今日初めてログインする",
        "type": QuestType.DAILY,
        "action_type": QuestActionType.LOGIN,
        "required_count": 1,
        "reward": 5
    },
    {
        "title": "投稿で貢献",
        "description": "フォーラムに投稿する",
        "type": QuestType.DAILY,
        "action_type": QuestActionType.POST,
        "required_count": 1,
        "reward": 10
    },
    {
        "title": "コメンター",
        "description": "3つのコメントを書く",
        "type": QuestType.DAILY,
        "action_type": QuestActionType.COMMENT,
        "required_count": 3,
        "reward": 15
    },
    {
        "title": "リアクション王",
        "description": "5つの投稿にリアクションする",
        "type": QuestType.DAILY,
        "action_type": QuestActionType.REACT,
        "required_count": 5,
        "reward": 5
    }
]

# ウィークリークエストのテンプレート
weekly_quest_templates = [
    {
        "title": "週間アクティブユーザー",
        "description": "週に5日ログインする",
        "type": QuestType.WEEKLY,
        "action_type": QuestActionType.LOGIN,
        "required_count": 5,
        "reward": 50
    },
    {
        "title": "コンテンツクリエイター",
        "description": "週に5つの投稿をする",
        "type": QuestType.WEEKLY,
        "action_type": QuestActionType.POST,
        "required_count": 5,
        "reward": 75
    },
    {
        "title": "コミュニティサポーター",
        "description": "週に15のコメントを書く",
        "type": QuestType.WEEKLY,
        "action_type": QuestActionType.COMMENT,
        "required_count": 15,
        "reward": 100
    },
    {
        "title": "宣伝マスター",
        "description": "週に3つの宣伝報告をする",
        "type": QuestType.WEEKLY,
        "action_type": QuestActionType.PROMOTION,
        "required_count": 3,
        "reward": 150
    }
]