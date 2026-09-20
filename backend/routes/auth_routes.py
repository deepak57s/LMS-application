
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends

from auth import hash_password, verify_password, create_access_token, get_current_user
from database import users_collection
from models import SignupRequest, LoginRequest, AuthResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _user_response(user: dict) -> UserResponse:
    """Formatter"""
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        onboarding_completed=user.get("onboarding_completed", False),
    )


@router.post("/signup", response_model=AuthResponse)
async def signup(data: SignupRequest):
    """Signup"""
    # Duplicate-check
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash
    hashed = hash_password(data.password)

    # Insert
    user_doc = {
        "name": data.name,
        "email": data.email,
        "hashed_password": hashed,
        "onboarding_completed": False,
        "preferred_domain_id": None,
        "preferred_topic_id": None,
        "created_at": datetime.now(timezone.utc),
    }
    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # Token
    token = create_access_token(str(result.inserted_id))

    # Response
    return AuthResponse(token=token, user=_user_response(user_doc))


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    """Login"""
    user = await users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(str(user["_id"]))
    return AuthResponse(token=token, user=_user_response(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Profile"""
    return _user_response(current_user)
