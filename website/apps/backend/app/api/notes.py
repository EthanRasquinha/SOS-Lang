from fastapi import APIRouter
from models import NoteModel
from services.note_service import create_note

router = APIRouter()

@router.post("/")
async def create_note_endpoint(data: NoteModel):
    return create_note(
        user_id=data.user_id,
        title=data.title,
        content=data.content
    )