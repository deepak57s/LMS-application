@echo off
title LMS Platform Launcher
echo ===================================================
echo   Launching Full-Stack LMS Platform
echo ===================================================

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "LMS Backend (FastAPI)" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "LMS Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up in separate terminal windows!
echo - Unified Web App: http://localhost:3000 (UI + API proxy)
echo - Direct Backend API Docs: http://localhost:8000/docs
echo ===================================================