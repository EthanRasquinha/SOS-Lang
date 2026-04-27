from fastapi import APIRouter, Request, HTTPException
from app.db.client import supabase
import google.genai as genai
import os
import json
from app.services.ai_service import create_summary
from app.services.flashcard_service import create_flashcard_set, get_flashcard_sets, get_flashcard_set_by_id, delete_flashcard_set, save_quiz_result, get_quiz_results

router = APIRouter()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_summary(note_content: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=f"""
        Summarize this note into clear study bullet points in plain text:

        {note_content}
        """
    )

    return response.text


def generate_flashcards(note_content: str) -> dict:
    """Generate flashcards from note content using Gemini API"""
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=f"""
        Create study flashcards from this note content. The questions of the flashcards should be in the language the notes are written, and the answers should be the language the notes are on.
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
    
def generate_mcqs(note_content: str) -> dict:
    """Generate multiple choice questions from note content using Gemini API"""
    
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=f"""
        Create multiple choice quiz questions from this note content.

        Return ONLY valid JSON in this exact format:
        Format:
{{
  "title": string,
  "questions": [
    {{
      "question": string,
      "options": [string, string, string, string],
      "correct_answer": string
      "explanation": "Short explanation of why the answer is correct"
    }}
  ]
}}

        Rules:
        - Generate 5–10 questions
        - Each question must have EXACTLY 4 options
        - Only ONE correct answer
        - Make distractors realistic (not obvious)
        - Keep answers concise
        - Ensure correctness based on the note
        - The questions should be in the language the notes are written, and the answers should be the language the notes are on.
        - make sure options are in the target language the notes are about

        Note content:
        {note_content}
        """
    )

    try:
        response_text = response.text

        # Extract JSON safely
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1

        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            mcq_data = json.loads(json_str)
            return mcq_data
        else:
            raise ValueError("No JSON found in response")

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse MCQ response: {str(e)}"
        )
    

@router.post("/mcqs/{note_id}/generate")
async def generate_mcqs_endpoint(note_id: str, request: Request):
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

    # 🤖 Generate MCQs
    try:
        mcq_data = generate_mcqs(note_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    # 💾 Save MCQ set (optional but recommended)
    mcq_set = (
        supabase.table("mcq_sets")
        .insert({
            "user_id": user_id,
            "note_id": note_id,
            "title": mcq_data["title"]
        })
        .execute()
    )

    mcq_set_id = mcq_set.data[0]["id"]

    # Save questions
    for q in mcq_data["questions"]:
        supabase.table("mcq_questions").insert({
            "mcq_set_id": mcq_set_id,
            "question": q["question"],
            "options": q["options"],
            "correct_answer": q["correct_answer"],
            "explanation": q.get("explanation", "")
        }).execute()

    return {
        "mcq_set_id": mcq_set_id,
        "mcq_data": mcq_data
    }

@router.get("/mcq-sets")
async def get_mcq_sets(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    response = (
        supabase.table("mcq_sets")
        .select("*, mcq_questions(*)")  # 🔥 join questions table
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return {"mcq_sets": response.data}

@router.get("/mcq-sets/{set_id}")
async def get_mcq_set(set_id: str, request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = user.user.id

    # 1. get set
    set_response = (
        supabase.table("mcq_sets")
        .select("*")
        .eq("id", set_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not set_response.data:
        raise HTTPException(status_code=404, detail="MCQ set not found")

    mcq_set = set_response.data

    # 2. get questions
    questions_response = (
        supabase.table("mcq_questions")
        .select("*")
        .eq("mcq_set_id", set_id)
        .execute()
    )

    mcq_set["questions"] = questions_response.data or []

    print(mcq_set)

    return {"mcq_set": mcq_set}

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
        .eq("note_id", note_id)
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
    """Submit quiz results for flashcards OR MCQ"""
    
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
        mcq_set_id = result_data.get("mcq_set_id")
        score = result_data.get("score")
        total = result_data.get("total")

        # Validation: must have exactly ONE set id
        if not flashcard_set_id and not mcq_set_id:
            raise HTTPException(status_code=400, detail="Missing set ID")

        if flashcard_set_id and mcq_set_id:
            raise HTTPException(status_code=400, detail="Provide only one set ID")

        # Insert into DB
        response = (
            supabase.table("quiz_results")
            .insert({
                "user_id": user_id,
                "flashcard_set_id": flashcard_set_id,
                "mcq_set_id": mcq_set_id,
                "score": score,
                "total": total
            })
            .execute()
        )

        return {
            "quiz_result": response.data[0] if response.data else None
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save quiz result: {str(e)}"
        )

@router.get("/quiz-results/{set_id}")
async def get_quiz_results_endpoint(set_id: str, request: Request):
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
        # 🔥 Query BOTH types
        response = (
            supabase.table("quiz_results")
            .select("*")
            .eq("user_id", user_id)
            .or_(f"flashcard_set_id.eq.{set_id},mcq_set_id.eq.{set_id}")
            .order("completed_at", desc=True)
            .execute()
        )

        return {
            "quiz_results": response.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quiz results: {str(e)}"
        )
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
