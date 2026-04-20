from fastapi import FastAPI
from app.api import notes, ai, auth, root, stats
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
# Allow requests from your frontend origin
origins = [
    "http://localhost:5173",  # React dev server
    "http://sos-lang.s3-website.eu-north-1.amazonaws.com/",
    "https://sos-lang.s3-website.eu-north-1.amazonaws.com/",
    "https://sos-lang.onrender.com",
    "http://sos-lang.onrender.com",
    "http://localhost:3000"
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
app.include_router(stats.router, prefix="/stats")