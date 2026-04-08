from db.client import supabase
import uuid
from datetime import datetime
import json


def create_flashcard_set(user_id: str, note_id: str, title: str, flashcards: list):
    """Create a flashcard set with individual flashcards"""
    
    # Create the flashcard set
    flashcard_set_id = str(uuid.uuid4())
    
    set_response = supabase.table("flashcard_sets").insert({
        "id": flashcard_set_id,
        "user_id": user_id,
        "note_id": note_id,
        "title": title,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()
    
    if not set_response.data:
        raise Exception("Failed to create flashcard set")
    
    # Create individual flashcards
    flashcard_records = []
    for flashcard in flashcards:
        flashcard_id = str(uuid.uuid4())
        flashcard_records.append({
            "id": flashcard_id,
            "flashcard_set_id": flashcard_set_id,
            "front": flashcard["front"],
            "back": flashcard["back"],
        })
    
    if flashcard_records:
        cards_response = supabase.table("flashcards").insert(flashcard_records).execute()
        if not cards_response.data:
            raise Exception("Failed to create flashcards")
    
    return set_response.data[0]


def get_flashcard_sets(user_id: str):
    """Get all flashcard sets for a user"""
    response = supabase.table("flashcard_sets") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()
    
    return response.data


def get_flashcard_set_by_id(user_id: str, flashcard_set_id: str):
    """Get a specific flashcard set with all its cards"""
    set_response = supabase.table("flashcard_sets") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("id", flashcard_set_id) \
        .single() \
        .execute()
    
    if not set_response.data:
        raise Exception("Flashcard set not found")
    
    # Get all flashcards in this set
    cards_response = supabase.table("flashcards") \
        .select("*") \
        .eq("flashcard_set_id", flashcard_set_id) \
        .execute()
    
    flashcard_set = set_response.data
    flashcard_set["flashcards"] = cards_response.data or []
    
    return flashcard_set


def delete_flashcard_set(user_id: str, flashcard_set_id: str):
    """Delete a flashcard set and all its cards"""
    # First verify ownership
    set_response = supabase.table("flashcard_sets") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("id", flashcard_set_id) \
        .single() \
        .execute()
    
    if not set_response.data:
        raise Exception("Flashcard set not found or unauthorized")
    
    # Delete all flashcards in this set
    supabase.table("flashcards").delete().eq("flashcard_set_id", flashcard_set_id).execute()
    
    # Delete the set
    response = supabase.table("flashcard_sets").delete() \
        .eq("user_id", user_id) \
        .eq("id", flashcard_set_id) \
        .execute()
    
    return response.data


def save_quiz_result(user_id: str, flashcard_set_id: str, score: int, total: int):
    """Save quiz results"""
    response = supabase.table("quiz_results").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "flashcard_set_id": flashcard_set_id,
        "score": score,
        "total": total,
        "completed_at": datetime.utcnow().isoformat(),
    }).execute()
    
    return response.data[0] if response.data else None


def get_quiz_results(user_id: str, flashcard_set_id: str = None):
    """Get quiz results for a user"""
    query = supabase.table("quiz_results").select("*").eq("user_id", user_id)
    
    if flashcard_set_id:
        query = query.eq("flashcard_set_id", flashcard_set_id)
    
    response = query.order("completed_at", desc=True).execute()
    
    return response.data
