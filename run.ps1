# NVIDIA Stock Prediction App PowerShell Launcher

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  NVIDIA Stock Prediction & AI Finance Dashboard" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting FastAPI Backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/2] Starting Vite Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  All systems launched successfully!" -ForegroundColor Green
Write-Host "  - Backend API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "  - Frontend Interface: http://localhost:5173" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Press any key to exit this launcher window..."
$null = [Console]::ReadKey($true)
