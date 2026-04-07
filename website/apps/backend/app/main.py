from fastapi import FastAPI
from api import notes, ai, auth, root
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
# Allow requests from your frontend origin
origins = [
    "http://localhost:5173",  # React dev server
    # "https://yourdomain.com", # production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],       # allow all HTTP methods
    allow_headers=["*"],       # allow all headers
)

app.include_router(auth.router, prefix="/register")
app.include_router(auth.router, prefix="/login")
app.include_router(notes.router, prefix="/notes")
app.include_router(ai.router, prefix="/ai")