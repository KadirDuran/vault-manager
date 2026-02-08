from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional, List

class VaultBase(BaseModel):
    name: str
    url: str
    description: Optional[str] = None
    auth_method: str = "token"
    tags: Optional[str] = None
    auto_unseal_enabled: bool = False
    auto_unseal_interval_minutes: int = 5
    last_auto_unseal_check: Optional[datetime] = None

class VaultCreate(VaultBase):
    token: Optional[str] = None # Plain text token, will be encrypted
    role_id: Optional[str] = None
    secret_id: Optional[str] = None # Plain text secret_id, will be encrypted
    unseal_key_1: Optional[str] = None  # Plain text unseal key, will be encrypted
    unseal_key_2: Optional[str] = None  # Plain text unseal key, will be encrypted
    unseal_key_3: Optional[str] = None  # Plain text unseal key, will be encrypted

class VaultUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    auth_method: Optional[str] = None
    token: Optional[str] = None
    role_id: Optional[str] = None
    secret_id: Optional[str] = None
    tags: Optional[str] = None
    auto_unseal_enabled: Optional[bool] = None
    auto_unseal_interval_minutes: Optional[int] = None

class VaultInDBBase(VaultBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Vault(VaultInDBBase):
    pass
