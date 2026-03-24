from fastapi import FastAPI
from app.api import notes, ai, auth

app = FastAPI()

app.include_router(auth.router, prefix="/register")
app.include_router(auth.router, prefix="/login")
app.include_router(notes.router, prefix="/notes")
app.include_router(ai.router, prefix="/ai")