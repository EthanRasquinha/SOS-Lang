from db.client import supabase
import uuid
from datetime import datetime


def create_new_user(user_id: str, language: str):
    return supabase.table("users").insert({
        "user_id": user_id,
        "language": language
    }).execute