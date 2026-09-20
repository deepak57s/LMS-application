
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    MONGODB_URL: str

    # JWT
    JWT_SECRET: str  
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 24 * 60

    class Config:
        env_file = ".env"


# Singleton
settings = Settings()
