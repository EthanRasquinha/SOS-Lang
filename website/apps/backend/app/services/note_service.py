from app.db.client import supabase
import uuid
from datetime import datetime

def create_note(user_id: str, title: str, content: str, tag: str):

    response = supabase.table("notes").insert({
        "user_id": user_id,
        "title": title,
        "content": content,
        "tag": tag

    }).execute()

    return response.data

def edit_note(note_id: str, user_id: str, title: str, content: str, tag: str):
    response = supabase.table("notes") \
        .update({
            "title": title,
            "content": content,
            "tag": tag
        }) \
        .eq("id", note_id) \
        .eq("user_id", user_id) \
        .execute()

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