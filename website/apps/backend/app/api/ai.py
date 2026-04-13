from fastapi import APIRouter, Request, HTTPException
from db.client import supabase
import google.genai as genai
import os
import json
from services.ai_service import create_summary
from services.flashcard_service import create_flashcard_set, get_flashcard_sets, get_flashcard_set_by_id, delete_flashcard_set, save_quiz_result, get_quiz_results

router = APIRouter()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_summary(note_content: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=f"""
        Summarize this note into clear study bullet points:

        {note_content}
        """
    )

    return response.text


def generate_flashcards(note_content: str) -> dict:
    """Generate flashcards from note content using Gemini API"""
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=f"""
        Create study flashcards from this note content.
        Generate flashcards in JSON format with the following structure:
        {{
          "title": "A short descriptive title for this flashcard set",
          "flashcards": [
            {{"front": "Question or prompt", "back": "Answer or explanation"}},
            {{"front": "Question or prompt", "back": "Answer or explanation"}}
          ]
        }}

        Create 5-10 flashcards that cover the key concepts and important details.
        Make questions clear and answers concise, one word, but complete.

        Note content:
        {note_content}
        """
    )

    try:
        # Parse the JSON response
        response_text = response.text
        # Try to extract JSON from the response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            flashcard_data = json.loads(json_str)
            return flashcard_data
        else:
            raise ValueError("No JSON found in response")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse flashcard response: {str(e)}")


@router.post("/{note_id}/summarize")
async def summarize_note(note_id: str, request: Request):
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    # 📥 Get note
    note_response = (
        supabase.table("notes")
        .select("*")
        .eq("id", note_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not note_response.data:
        raise HTTPException(status_code=404, detail="Note not found")

    note_content = note_response.data["content"]

    # 🤖 Generate summary
    try:
        summary = generate_summary(note_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    # 💾 Save summary
    create_summary(user_id, note_id, summary)

    return {
        "summary": summary
    }


@router.post("/flashcards/{note_id}/generate")
async def generate_note_flashcards(note_id: str, request: Request):
    """Generate flashcards from a note"""
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    # 📥 Get note
    note_response = (
        supabase.table("notes")
        .select("*")
        .eq("note_id", note_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not note_response.data:
        raise HTTPException(status_code=404, detail="Note not found")

    note_content = note_response.data["content"]
    note_title = note_response.data.get("title", "Untitled")

    # 🤖 Generate flashcards
    try:
        flashcard_data = generate_flashcards(note_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    # 💾 Save flashcard set
    try:
        flashcard_set = create_flashcard_set(
            user_id=user_id,
            note_id=note_id,
            title=flashcard_data.get("title", f"Flashcards from {note_title}"),
            flashcards=flashcard_data.get("flashcards", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save flashcards: {str(e)}")

    # Get the complete flashcard set with all cards
    try:
        complete_set = get_flashcard_set_by_id(user_id, flashcard_set["id"])
    except:
        complete_set = flashcard_set

    return {
        "flashcard_set": complete_set
    }


@router.get("/flashcard-sets")
async def get_user_flashcard_sets(request: Request):
    """Get all flashcard sets for the logged-in user"""
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    try:
        flashcard_sets = get_flashcard_sets(user_id)
        return {
            "flashcard_sets": flashcard_sets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch flashcard sets: {str(e)}")


@router.get("/flashcard-sets/{flashcard_set_id}")
async def get_flashcard_set(flashcard_set_id: str, request: Request):
    """Get a specific flashcard set with all its cards"""
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    try:
        flashcard_set = get_flashcard_set_by_id(user_id, flashcard_set_id)
        return {
            "flashcard_set": flashcard_set
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/flashcard-sets/{flashcard_set_id}")
async def delete_flashcards(flashcard_set_id: str, request: Request):
    """Delete a flashcard set"""
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    try:
        delete_flashcard_set(user_id, flashcard_set_id)
        return {
            "message": "Flashcard set deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/quiz-results")
async def submit_quiz_result(result_data: dict, request: Request):
    """Submit quiz results"""
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    try:
        flashcard_set_id = result_data.get("flashcard_set_id")
        score = result_data.get("score")
        total = result_data.get("total")
        
        quiz_result = save_quiz_result(user_id, flashcard_set_id, score, total)
        return {
            "quiz_result": quiz_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save quiz result: {str(e)}")


@router.get("/quiz-results/{flashcard_set_id}")
async def get_flashcard_quiz_results(flashcard_set_id: str, request: Request):
    """Get quiz results for a specific flashcard set"""
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    try:
        quiz_results = get_quiz_results(user_id, flashcard_set_id)
        return {
            "quiz_results": quiz_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quiz results: {str(e)}")


@router.get("/{note_id}/summary")
async def get_note_summary(note_id: str, request: Request):
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    # 📥 Get summary
    summary_response = (
        supabase.table("summaries")
        .select("*")
        .eq("note_id", note_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not summary_response.data:
        raise HTTPException(status_code=404, detail="Summary not found")

    return {
        "title": summary_response.data["title"],
        "summary": summary_response.data["content"]
    }


@router.get("/summaries")
async def get_all_summaries(request: Request):
    # 🔐 Auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    # 📥 Get all summaries
    summaries_response = (
        supabase.table("summaries")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    if not summaries_response.data:
        raise HTTPException(status_code=404, detail="No summaries found")

    return {
        "summaries": summaries_response.data
    }
