from db.client import supabase
import uuid
from datetime import datetime

def create_note(user_id: str, title: str, content: str):

    response = supabase.table("notes").insert({
        "user_id": user_id,
        "title": title,
        "content": content,
    }).execute()

    return response.data


def get_notes(user_id: str):
    response = supabase.table("notes") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("last_updated", desc=True) \
        .execute()

    return response.data

def delete_note(user_id: str, note_id: str):
    response = (
        supabase.table("notes")
        .delete()
        .eq("user_id", user_id)   # ensure you only delete notes for this user
        .eq("note_id", note_id)        # delete the specific note
        .execute()
    )

    return response.data