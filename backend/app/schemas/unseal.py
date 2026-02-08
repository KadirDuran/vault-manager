from pydantic import BaseModel
from typing import List, Optional

class UnsealRequest(BaseModel):
    keys: Optional[List[str]] = None
    reset: bool = False
