@echo off
title Capital Rift — Empire Ledger
cd /d "%~dp0"

set "NODE=%~dp0runtime\node.exe"
if not exist "%NODE%" (
  where node >nul 2>&1
  if errorlevel 1 (
    echo.
    echo  Missing runtime\node.exe and no "node" on PATH.
    echo  Install Node from https://nodejs.org/ or copy node.exe into runtime\
    echo.
    pause
    exit /b 1
  )
  set "NODE=node"
)

set "APP=%~dp0app\cli.cjs"
if not exist "%APP%" (
  echo Missing app\cli.cjs
  pause
  exit /b 1
)

if "%~1"=="" (
  "%NODE%" "%APP%" launch
) else (
  "%NODE%" "%APP%" %*
)
set EXITCODE=%ERRORLEVEL%

if /I "%~1"=="" goto :eof
if /I "%~1"=="launch" goto :eof
if /I "%~1"=="open" goto :eof
if /I "%~1"=="dashboard" goto :eof

echo.
pause
exit /b %EXITCODE%
