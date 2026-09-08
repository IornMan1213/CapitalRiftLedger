@echo off
title Capital Rift — Launch
cd /d "%~dp0"

set "NODE=%~dp0runtime\node.exe"
if not exist "%NODE%" (
  where node >nul 2>&1
  if errorlevel 1 (
    echo.
    echo  Missing runtime\node.exe and no "node" on PATH.
    echo.
    echo  Install Node from https://nodejs.org/ or copy node.exe into runtime\
    echo.
    pause
    exit /b 1
  )
  set "NODE=node"
)

"%NODE%" "%~dp0app\cli.cjs" launch
pause
