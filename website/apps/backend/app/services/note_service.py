from db.client import supabase
import uuid
from datetime import datetime

def create_note(user_id: str, title: str, content: str):

    note_id = str(uuid.uuid4())

    supabase.table("notes").insert({
        "note_id": note_id,
        "user_id": user_id,
        "title": title,
        "content": content,
        "created_at": datetime.utcnow().isoformat()
    }).execute()