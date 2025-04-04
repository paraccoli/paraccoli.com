from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class FeedbackBase(BaseModel):
    title: str
    content: str
    type: str  # 'improvement', 'question', 'bug', 'promotion', 'other'
    url: Optional[str] = None  # 宣伝URLを追加
    status: str = "pending"  # pending, answered, closed
    
class Feedback(FeedbackBase):
    id: str = Field(default_factory=str)
    author_id: str
    author_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    response: Optional[str] = None
    responded_at: Optional[datetime] = None
    responded_by: Optional[str] = None
    reward: Optional[float] = 0

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    title: str
    content: str
    type: str
    url: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    title: str
    content: str
    type: str
    author_id: str
    created_at: datetime
    status: str = "pending"
    response: Optional[str] = None
    responded_at: Optional[datetime] = None
    responded_by: Optional[str] = None

class FeedbackReply(BaseModel):
    response: str
    reward: float = 0  # 報酬フィールドを追加