@echo off
cd /d "%~dp0"

echo.
echo Volna - starting API and frontend
echo.

if not exist "node_modules\" (
  echo Installing frontend dependencies...
  call npm install
  if errorlevel 1 goto error
)

if not exist "server\node_modules\" (
  echo Installing server dependencies...
  call npm install --prefix server
  if errorlevel 1 goto error
)

if not exist "server\.env" (
  echo Copying server\.env from example...
  copy /Y "server\.env.example" "server\.env" >nul
)

echo Starting API: http://localhost:3001
start "Volna API" cmd /k "cd /d "%~dp0" & npm run dev --prefix server"

ping -n 3 127.0.0.1 >nul

echo Starting frontend: http://localhost:5173
start "Volna Frontend" cmd /k "cd /d "%~dp0" & npm run dev"

echo.
echo Done. Open http://localhost:5173 in your browser.
echo Keep both console windows open.
echo.
pause
exit /b 0

:error
echo.
echo Startup failed. Check Node.js and PostgreSQL.
echo.
pause
exit /b 1
