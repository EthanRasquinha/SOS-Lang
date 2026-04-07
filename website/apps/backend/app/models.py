from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone


class NoteModel(BaseModel):
    note_title: str
    content: str
    

class UserModel(BaseModel):
    language: str
    