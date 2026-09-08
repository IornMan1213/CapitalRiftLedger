@echo off
title Capital Rift — Empire Ledger
cd /d "%~dp0"

set "NODE=%~dp0runtime\node.exe"
set "APP=%~dp0app\cli.cjs"

if not exist "%NODE%" (
  echo.
  echo  Missing runtime\node.exe
  echo  Re-download the CapitalRiftLedger-Windows package.
  echo.
  pause
  exit /b 1
)

if not exist "%APP%" (
  echo.
  echo  Missing app\cli.cjs
  echo.
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
if /I "%~1"=="run" goto :eof
if /I "%~1"=="start" goto :eof
if /I "%~1"=="open" goto :eof
if /I "%~1"=="dashboard" goto :eof

echo.
pause
exit /b %EXITCODE%
