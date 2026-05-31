@echo off
echo =================================
echo  Starting Warehouse Frontend
echo =================================
cd /d "%~dp0"

REM Install node modules if needed
if not exist node_modules (
    echo Installing npm packages...
    npm install
)

REM Start Vite dev server
npm run dev

pause
