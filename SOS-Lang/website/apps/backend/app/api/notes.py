from fastapi import APIRouter
from app.models.note_models import NoteModel
from app.services.note_service import create_new_note

router = APIRouter()

@router.post("/newnote")
async def create_note_endpoint(data: NoteModel):
    return create_new_note(
        language=data.language
    )