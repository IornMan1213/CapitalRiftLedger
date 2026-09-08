@echo off
title Capital Rift — Schedule Daily Track
cd /d "%~dp0"

set /p TIME=Enter daily time HH:MM (default 09:00): 
if "%TIME%"=="" set TIME=09:00

set "TASK=Capital Rift Ledger Daily Track"
set "TR=%~dp0Track-Silent.cmd"

schtasks /Create /TN "%TASK%" /TR "\"%TR%\"" /SC DAILY /ST %TIME% /F
if errorlevel 1 (
  echo Failed to create task.
  pause
  exit /b 1
)
echo Scheduled daily at %TIME%.
echo Remove with Unschedule-Daily-Track.cmd
pause
