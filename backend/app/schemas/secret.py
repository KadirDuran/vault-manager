from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class SecretWriteRequest(BaseModel):
    mount_point: str
    path: str
    secret: Dict[str, Any]

class SecretListRequest(BaseModel):
    mount_point: str
    path: Optional[str] = ""

class SecretReadRequest(BaseModel):
    mount_point: str
    path: str
