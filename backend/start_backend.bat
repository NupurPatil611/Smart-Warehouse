@echo off
echo ================================
echo  Starting Warehouse Backend API
echo ================================
cd /d "%~dp0"

REM Install dependencies if needed
pip install -r requirements.txt

REM Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
