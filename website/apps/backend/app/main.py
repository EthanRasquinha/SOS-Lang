from fastapi import FastAPI
from api import notes, ai, auth, root

app = FastAPI()

app.include_router(auth.router, prefix="/register")
app.include_router(auth.router, prefix="/login")
app.include_router(notes.router, prefix="/newnote")
app.include_router(ai.router, prefix="/ai")