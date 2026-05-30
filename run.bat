@echo off
title NVIDIA Stock Prediction App Launcher
echo ===================================================
echo   NVIDIA Stock Prediction and AI Finance Dashboard
echo ===================================================
echo.
echo [1/2] Starting FastAPI Backend on port 8000...
start "FastAPI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Vite Frontend on port 5173...
start "Vite Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   All systems launched successfully!
echo   - Backend API Docs: http://localhost:8000/docs
echo   - Frontend Interface: http://localhost:5173
echo ===================================================
echo Press any key to exit this launcher window (servers will remain active in separate windows)...
pause > nul
