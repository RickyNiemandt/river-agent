@echo off
REM Double-click or: scripts\init-local-windows.cmd
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0init-local-windows.ps1"
if errorlevel 1 pause
