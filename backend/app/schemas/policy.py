from pydantic import BaseModel
from typing import Optional

class PolicyBase(BaseModel):
    name: str
    rules: str

class PolicyCreate(PolicyBase):
    pass

class PolicyUpdate(PolicyBase):
    pass
