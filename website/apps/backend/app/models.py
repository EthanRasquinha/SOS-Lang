from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone


class NoteModel(BaseModel):
    note_title: str
    content: str
    tag: Optional[str]
    

class UserModel(BaseModel):
    language: str


class FlashcardModel(BaseModel):
    front: str
    back: str


class FlashcardSetModel(BaseModel):
    title: str
    flashcards: List[FlashcardModel]


class QuizAnswerModel(BaseModel):
    flashcard_id: str
    user_answer: str


class QuizResultModel(BaseModel):
    flashcard_set_id: str
    score: int
    total: int
    