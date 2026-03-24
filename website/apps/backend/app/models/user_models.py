from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone


class CreateNewUser(BaseModel):
    language: str
    
