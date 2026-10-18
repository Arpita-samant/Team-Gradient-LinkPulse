@echo off
echo ===================================================
echo     Starting LinkPulse URL Shortener & Analytics
echo ===================================================
echo.
echo Launching Backend on http://localhost:5000 ...
start "LinkPulse Backend" cmd /k "cd /d %~dp0backend && npm start"

echo Launching Frontend on http://localhost:5173 ...
start "LinkPulse Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo - Frontend UI: http://localhost:5173
echo - Backend API: http://localhost:5000
echo.
pause
