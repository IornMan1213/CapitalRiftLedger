@echo off
title Capital Rift — Setup
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
    echo    2. Download Node Windows Binary (.zip), copy node.exe into:
    echo       %~dp0runtime\
    echo    3. Use your original CapitalRiftLedger-Windows zip (includes runtime\node.exe)
    echo.
    pause
    exit /b 1
  )
  set "NODE=node"
)

"%NODE%" "%~dp0app\cli.cjs" setup
echo.
pause
