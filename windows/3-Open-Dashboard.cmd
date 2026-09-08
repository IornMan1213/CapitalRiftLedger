@echo off
title Capital Rift — Dashboard (keep this window open)
cd /d "%~dp0"
echo.
echo  Starting local dashboard server...
echo  Leave this window open while you use the dashboard.
echo  Press Ctrl+C to stop.
echo.
"%~dp0runtime\node.exe" "%~dp0app\cli.cjs" open
pause
