
from motor.motor_asyncio import AsyncIOMotorClient

from config import settings

# Client
client = AsyncIOMotorClient(settings.MONGODB_URL)

# Database
db = client["lms_db"]

# Collections

users_collection = db["users"]
domains_collection = db["domains"]
topics_collection = db["topics"]
questions_collection = db["questions"]
exam_sessions_collection = db["exam_sessions"]
