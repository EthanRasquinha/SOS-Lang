from db.client import supabase

def create_summary(user_id: str, note_id: str, content: str):

    response = supabase.table("study").insert({
        "user_id": user_id,
        "note_id": note_id,
        "content": content,
    }).execute()

    return response.data