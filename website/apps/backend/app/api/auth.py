from fastapi import APIRouter
from app.models.user_models import CreateNewUser
from app.services.auth_service import create_new_user

router = APIRouter()

@router.post("/register")
async def create_user_endpoint(data: CreateNewUser):
    return create_new_user(
        language=data.language
    )