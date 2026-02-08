from pydantic import BaseModel
from typing import List, Optional

class AppRoleCreate(BaseModel):
    role_name: str
    token_policies: Optional[List[str]] = None
    token_ttl: Optional[str] = None
    token_max_ttl: Optional[str] = None
    secret_id_ttl: Optional[str] = None
    secret_id_num_uses: Optional[int] = None
    bind_secret_id: Optional[bool] = True
