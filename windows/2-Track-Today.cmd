@echo off
title Capital Rift — Track Today
cd /d "%~dp0"
"%~dp0runtime\node.exe" "%~dp0app\cli.cjs" track
echo.
pause
