from fastapi import APIRouter, Request
from db.client import supabase
from models import NoteModel
from services.note_service import create_note
from services.note_service import get_notes
from services.note_service import delete_note


router = APIRouter()

@router.post("/")
async def create_note_endpoint(data: NoteModel, request: Request):
    token = request.headers.get("Authorization").split(" ")[1]

    user = supabase.auth.get_user(token)
    user_id = user.user.id
    return create_note(
        user_id=user_id,
        title=data.note_title,
        content=data.content
    )

@router.get("/")
async def get_notes_endpoint(request: Request):
    token = request.headers.get("Authorization").split(" ")[1]

    user = supabase.auth.get_user(token)
    user_id = user.user.id

    return get_notes(user_id)

@router.delete("/{note_id}/")
async def delete_note_endpoint(note_id: str, request: Request):
    token = request.headers.get("Authorization").split(" ")[1]

    user = supabase.auth.get_user(token)
    user_id = user.user.id

    return delete_note(user_id=user_id,note_id=note_id)