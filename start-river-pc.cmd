@echo off
REM C:\Ecolife\RiverBot — double-click to start Path Local + tunnel watchdog
setlocal
cd /d "%~dp0"
set PORT=8791

where node >nul 2>&1
if errorlevel 1 (
  echo Install Node 20+ from https://nodejs.org then run this again.
  pause
  exit /b 1
)

if not exist .dev.vars copy .dev.vars.example .dev.vars

findstr /B /C:"DRY_RUN=false" .dev.vars >nul
if errorlevel 1 (
  echo .dev.vars must have DRY_RUN=false and D360_API_KEY set. Opening notepad.
  notepad .dev.vars
)

if not exist node_modules (
  echo Running npm ci...
  call npm ci
  if errorlevel 1 (
    echo npm ci failed.
    pause
    exit /b 1
  )
)

echo Starting River Agent on http://127.0.0.1:%PORT%
echo Leave BOTH new windows open. Sleep stays off.
start "River Agent local" cmd /k "cd /d "%~dp0" && set PORT=8791 && node scripts\local-server.mjs"
timeout /t 3 /nobreak >nul
start "River Agent tunnel" cmd /k "cd /d "%~dp0" && set PORT=8791 && node scripts\watch-tunnel.mjs"
echo Health: http://127.0.0.1:8791/health
echo Inbox:  http://127.0.0.1:8791/inbox
start "" "http://127.0.0.1:8791/health"
pause
