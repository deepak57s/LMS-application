
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends

from auth import get_current_user
from database import domains_collection, topics_collection, users_collection
from models import OnboardingRequest

router = APIRouter(prefix="/api", tags=["Catalog & Onboarding"])


@router.get("/catalog")
async def get_catalog(current_user: dict = Depends(get_current_user)):
    """Catalog"""
    domains = []
    async for domain in domains_collection.find():
        # Topics
        topics = []
        async for topic in topics_collection.find({"domain_id": domain["_id"]}):
            topics.append({
                "id": str(topic["_id"]),
                "name": topic["name"],
                "description": topic.get("description", ""),
            })
        domains.append({
            "id": str(domain["_id"]),
            "name": domain["name"],
            "description": domain.get("description", ""),
            "topics": topics,
        })
    return domains


@router.post("/onboarding")
async def complete_onboarding(
    data: OnboardingRequest,
    current_user: dict = Depends(get_current_user),
):
    """Onboarding"""
    # Validation
    domain = await domains_collection.find_one({"_id": ObjectId(data.domain_id)})
    if not domain:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")

    topic = await topics_collection.find_one({"_id": ObjectId(data.topic_id)})
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    # Update
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {
            "$set": {
                "onboarding_completed": True,
                "preferred_domain_id": data.domain_id,
                "preferred_topic_id": data.topic_id,
            }
        },
    )
    return {"message": "Onboarding completed"}
