from fastapi import APIRouter, Request, HTTPException
from app.db.client import supabase
from datetime import datetime, timedelta
import google.genai as genai
import os
import json

router = APIRouter()

@router.get("/")
async def get_user_stats(request: Request):
    token = request.headers.get("Authorization").split(" ")[1]
    user = supabase.auth.get_user(token)
    user_id = user.user.id

    sets = supabase.table("flashcard_sets") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute().data

    results = supabase.table("quiz_results") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute().data

    total_sets = len(sets)
    total_quizzes = len(results)
    print(results)

    avg_score = (
        sum((r["score"] / r["total"] * 100) for r in results) / total_quizzes
        if total_quizzes > 0 else 0
    )

    return {
        "total_sets": total_sets,
        "total_quizzes": total_quizzes,
        "avg_score": round(avg_score, 2),
    }


@router.get("/activity")
async def get_activity(request: Request):
    from collections import defaultdict

    token = request.headers.get("Authorization").split(" ")[1]
    user = supabase.auth.get_user(token)
    user_id = user.user.id

    results = supabase.table("quiz_results") \
        .select("score, completed_at") \
        .eq("user_id", user_id) \
        .execute().data

    daily = defaultdict(list)

    for r in results:
        day = r["completed_at"][:10]
        daily[day].append(r["score"])

    formatted = [
        {
            "date": day,
            "avgScore": sum(scores) / len(scores),
            "count": len(scores)
        }
        for day, scores in daily.items()
    ]

    return sorted(formatted, key=lambda x: x["date"])



@router.get("/recent")
async def get_recent(request: Request):
    token = request.headers.get("Authorization").split(" ")[1]
    user = supabase.auth.get_user(token)
    user_id = user.user.id

    results = supabase.table("quiz_results") \
        .select("score, total, completed_at, flashcard_sets(title, id)") \
        .eq("user_id", user_id) \
        .order("completed_at", desc=True) \
        .limit(5) \
        .execute()
    print(results.data)
    return results.data



@router.get("/streak")
async def get_streak(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)
    user_id = user.user.id

    results = supabase.table("quiz_results") \
        .select("completed_at") \
        .eq("user_id", user_id) \
        .order("completed_at", desc=True) \
        .execute().data

    if not results:
        return {"streak": 0}

    # Get unique days user studied
    study_days = set(r["completed_at"][:10] for r in results)

    streak = 0
    today = datetime.utcnow().date()

    while True:
        check_day = today - timedelta(days=streak)
        if str(check_day) in study_days:
            streak += 1
        else:
            break

    return {"streak": streak}