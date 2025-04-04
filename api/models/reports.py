from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, GetJsonSchemaHandler
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
    def __get_pydantic_json_schema__(
        cls, 
        field_schema: JsonSchemaValue,
        handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        field_schema.update(type="string")
        return field_schema

class ReportBase(BaseModel):
    """通報の基本モデル"""
    type: str = "post"  # "post" または "comment"
    reason: str
    target_id: str
    reporter_id: str

class Report(ReportBase):
    """データベースに保存される通報モデル"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    status: str = "pending"  # pending, resolved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    reported_content: dict = {}

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ReportResponse(BaseModel):
    """APIレスポンスとして返す通報モデル"""
    id: str
    type: str
    reason: str
    target_id: str
    reporter_id: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    reported_content: dict
    post_id: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {ObjectId: str}