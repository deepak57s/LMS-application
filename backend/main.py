from bson.errors import InvalidId
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes.auth_routes import router as auth_router
from routes.catalog_routes import router as catalog_router
from routes.exam_routes import router as exam_router

app = FastAPI(
    title="Basic LMS API",
    description="Learning Management System — Exam Platform",
    version="1.0.0",
)

# ponytail: Handle malformed MongoDB ObjectIds as 400 Bad Request instead of 500 crashes
@app.exception_handler(InvalidId)
async def invalid_id_handler(request: Request, exc: InvalidId):
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid ID format"}
    )

# ponytail: Safe fallback for unexpected server errors to prevent leaking tracebacks
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred"}
    )

# ponytail: CORS for localhost dev across all ports (3000, 3001, etc.) and IP variations
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(exam_router)


@app.get("/")
async def root():
    """Healthcheck"""
    return {"message": "LMS API is running"}

