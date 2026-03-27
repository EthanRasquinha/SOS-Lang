from fastapi import APIRouter


router = APIRouter()

@router.post("/")

def root():
    return {"message": "API is running"}