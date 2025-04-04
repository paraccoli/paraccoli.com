from datetime import datetime
from typing import Optional, Dict

class User:
    """ユーザーモデル"""
    
    def __init__(
        self,
        discord_id: str,
        username: str,
        balance: int = 0,
        created_at: Optional[datetime] = None,
        last_login: Optional[datetime] = None,
        login_token: Optional[str] = None,
        token_expires: Optional[datetime] = None
    ):
        self.discord_id = discord_id
        self.username = username
        self.balance = balance
        self.created_at = created_at or datetime.utcnow()
        self.last_login = last_login or datetime.utcnow()
        self.login_token = login_token
        self.token_expires = token_expires

    @classmethod
    def from_dict(cls, data: Dict) -> 'User':
        """辞書からユーザーオブジェクトを生成"""
        return cls(
            discord_id=data['discord_id'],
            username=data['username'],
            balance=data.get('balance', 0),
            created_at=data.get('created_at'),
            last_login=data.get('last_login')
        )

    def to_dict(self) -> Dict:
        """ユーザーオブジェクトを辞書に変換"""
        return {
            'discord_id': self.discord_id,
            'username': self.username,
            'balance': self.balance,
            'created_at': self.created_at,
            'last_login': self.last_login
        }

    def update_login(self):
        """最終ログイン時間を更新"""
        self.last_login = datetime.utcnow()

    def add_balance(self, amount: int):
        """残高を増加"""
        if amount < 0:
            raise ValueError("Amount must be positive")
        self.balance += amount

    def subtract_balance(self, amount: int):
        """残高を減少"""
        if amount < 0:
            raise ValueError("Amount must be positive")
        if self.balance < amount:
            raise ValueError("Insufficient balance")
        self.balance -= amount