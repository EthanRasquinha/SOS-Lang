from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone


class NoteModel(BaseModel):
    user_id: str
    title: str
    content: str
    

class UserModel(BaseModel):
    language: str
    