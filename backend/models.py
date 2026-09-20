
from pydantic import BaseModel, EmailStr
from typing import Optional


# Auth

class SignupRequest(BaseModel):
    name: str
    email: EmailStr  # Validation
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Profile"""
    id: str
    name: str
    email: str
    onboarding_completed: bool


class AuthResponse(BaseModel):
    """Auth"""
    token: str
    user: UserResponse


# Onboarding

class OnboardingRequest(BaseModel):
    domain_id: str
    topic_id: str


# Exams

class StartExamRequest(BaseModel):
    topic_id: str


class QuestionOut(BaseModel):
    """Question"""
    id: str
    question_text: str
    options: list[str]


class StartExamResponse(BaseModel):
    session_id: str
    topic_name: str
    total_questions: int
    questions: list[QuestionOut]


class SubmitExamRequest(BaseModel):
    """Submission"""
    answers: dict[str, int]


class ExamResultResponse(BaseModel):
    session_id: str
    score: int
    total_questions: int
    percentage: float
