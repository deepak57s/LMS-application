import random
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends

from auth import get_current_user
from database import topics_collection, questions_collection, exam_sessions_collection
from models import (
    StartExamRequest,
    StartExamResponse,
    QuestionOut,
    SubmitExamRequest,
    ExamResultResponse,
)
router = APIRouter(prefix="/api/exams", tags=["Exams"])

@router.post("/start", response_model=StartExamResponse)
async def start_exam(
    data: StartExamRequest,
    current_user: dict = Depends(get_current_user),
):
    """Start"""
    # Verify-topic
    topic = await topics_collection.find_one({"_id": ObjectId(data.topic_id)})
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    # Random-sample
    num_questions = random.randint(5, 10)
    pipeline = [
        {"$match": {"topic_id": ObjectId(data.topic_id)}},
        {"$sample": {"size": num_questions}},
    ]
    questions = []
    async for q in questions_collection.aggregate(pipeline):
        questions.append(q)

    if len(questions) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions available for this topic",
        )

    # Create-session
    session_doc = {
        "user_id": ObjectId(current_user["_id"]),
        "topic_id": ObjectId(data.topic_id),
        "question_ids": [q["_id"] for q in questions],
        "submitted_answers": {},
        "score": None,
        "total_questions": len(questions),
        "percentage": None,
        "completed": False,
        "created_at": datetime.now(timezone.utc),
    }
    result = await exam_sessions_collection.insert_one(session_doc)

    # Safe-response
    safe_questions = [
        QuestionOut(
            id=str(q["_id"]),
            question_text=q["question_text"],
            options=q["options"],
            # Redact-answers
        )
        for q in questions
    ]

    return StartExamResponse(
        session_id=str(result.inserted_id),
        topic_name=topic["name"],
        total_questions=len(questions),
        questions=safe_questions,
    )


@router.post("/{session_id}/submit", response_model=ExamResultResponse)
async def submit_exam(
    session_id: str,
    data: SubmitExamRequest,
    current_user: dict = Depends(get_current_user),
):
    """Submit"""
    # Fetch-session
    session = await exam_sessions_collection.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam session not found")

    # Ownership-check
    if str(session["user_id"]) != current_user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your exam session")

    # Resubmit-guard
    if session["completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam already submitted",
        )

    # Fetch-answers
    question_ids = session["question_ids"]
    correct_answers = {}  # Answers
    async for q in questions_collection.find({"_id": {"$in": question_ids}}):
        correct_answers[str(q["_id"])] = q["correct_option_index"]

    # Score
    score = 0
    for question_id, selected_index in data.answers.items():
        if question_id in correct_answers and correct_answers[question_id] == selected_index:
            score += 1

    total = len(question_ids)
    percentage = round((score / total) * 100, 1) if total > 0 else 0

    # Update-session
    await exam_sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "submitted_answers": data.answers,
                "score": score,
                "percentage": percentage,
                "completed": True,
                "completed_at": datetime.now(timezone.utc),
            }
        },
    )

    return ExamResultResponse(
        session_id=session_id,
        score=score,
        total_questions=total,
        percentage=percentage,
    )


@router.get("/{session_id}/result", response_model=ExamResultResponse)
async def get_result(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Result"""
    session = await exam_sessions_collection.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam session not found")

    if str(session["user_id"]) != current_user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your exam session")

    if not session["completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam not yet submitted",
        )

    return ExamResultResponse(
        session_id=str(session["_id"]),
        score=session["score"],
        total_questions=session["total_questions"],
        percentage=session["percentage"],
    )
