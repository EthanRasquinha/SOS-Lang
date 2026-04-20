from fastapi import APIRouter
from app.models import UserModel
from services.auth_service import create_new_user

router = APIRouter()

@router.post("/")
async def create_user_endpoint(data: UserModel):
    return create_new_user(
        language=data.language
    )