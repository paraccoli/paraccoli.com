from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ExchangeRequestCreate(BaseModel):
    amount: float = Field(..., ge=100)  # 最低100PARC以上
    username: str

class ExchangeRequest(BaseModel):
    id: str
    user_id: str
    username: str
    amount: float
    status: str = "pending"  # pending/completed/rejected
    created_at: datetime
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None