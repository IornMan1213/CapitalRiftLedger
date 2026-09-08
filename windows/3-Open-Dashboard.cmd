@echo off
title Capital Rift — Dashboard (keep this window open)
cd /d "%~dp0"

set "NODE=%~dp0runtime\node.exe"
if not exist "%NODE%" (
  where node >nul 2>&1
  if errorlevel 1 (
    echo.
    echo  Missing runtime\node.exe and no "node" on PATH.
    echo.
    echo  Fix one of:
    echo    1. Install Node.js LTS from https://nodejs.org/  then re-open this window
    echo    2. Copy node.exe into: %~dp0runtime\
    echo    3. Use your original CapitalRiftLedger-Windows zip
    echo.
    pause
    exit /b 1
  )
  set "NODE=node"
)

echo.
echo  Starting local dashboard server...
echo  Leave this window open while you use the dashboard.
echo  Press Ctrl+C to stop.
echo.
"%NODE%" "%~dp0app\cli.cjs" open
pause
