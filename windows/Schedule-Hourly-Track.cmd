@echo off
title Capital Rift — Schedule Hourly Track
cd /d "%~dp0"

set "TASK=Capital Rift Ledger Hourly Track"
set "TR=%~dp0Track-Silent-Hourly.cmd"

schtasks /Create /TN "%TASK%" /TR "\"%TR%\"" /SC HOURLY /F
if errorlevel 1 (
  echo Failed to create task.
  pause
  exit /b 1
)
echo Scheduled hourly track.
echo Remove with Unschedule-Hourly-Track.cmd
pause
