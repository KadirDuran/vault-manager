from pydantic import BaseModel
from typing import List, Optional, Dict

class TokenIssueRequest(BaseModel):
    policies: Optional[List[str]] = None
    ttl: Optional[str] = None
    renewable: Optional[bool] = True
    meta: Optional[Dict[str, str]] = None
    display_name: Optional[str] = "vault-manager"

class TokenRevokeRequest(BaseModel):
    token: str
