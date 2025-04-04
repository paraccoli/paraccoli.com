from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, GetJsonSchemaHandler, constr
from pydantic.json_schema import JsonSchemaValue
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema: JsonSchemaValue, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        field_schema.update(type="string")
        return field_schema

class CategoryEnum(str):
    GENERAL = "general"
    CRYPTO = "crypto"
    GUILD = "guild"
    HELP = "help"

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    author_id: str

class Comment(CommentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    post_id: str
    author_name: str
    author_avatar: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1, max_length=10000)
    category: str = Field(..., pattern='^(general|crypto|guild|help)$')
    tags: List[str] = []

    class Config:
        json_encoders = {ObjectId: str}

class PostCreate(PostBase):
    author_id: str

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, min_length=1, max_length=10000)
    category: Optional[str] = Field(None, pattern='^(general|crypto|guild|help)$')
    tags: Optional[List[str]] = None
    is_locked: Optional[bool] = None

class Post(PostBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    comment_count: int = 0
    like_count: int = 0
    is_locked: bool = False  # コメントロック状態
    reaction_count: int = 0
    reactions: List[str] = []  # リアクションしたユーザーのID一覧

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ReactionCreate(BaseModel):
    post_id: str
    user_id: str

class Reaction(ReactionCreate):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Report(BaseModel):
    reason: str
    type: str = "post"  # "post" または "comment"
    target_id: str  # 投稿IDまたはコメントID
    reporter_id: Optional[str] = None

    class Config:
        json_encoders = {ObjectId: str}