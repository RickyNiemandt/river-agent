@echo off
REM C:\Ecolife\RiverBot — start local Path Direct
cd /d "%~dp0.."
if not exist .dev.vars copy .dev.vars.example .dev.vars
echo Starting River Agent local on http://127.0.0.1:8791
echo Set D360_API_KEY and DRY_RUN=false in .dev.vars for live WhatsApp.
echo In a second window: npm run tunnel
node scripts\local-server.mjs
pause
