@echo off
title Capital Rift — Setup
cd /d "%~dp0"
"%~dp0runtime\node.exe" "%~dp0app\cli.cjs" setup
echo.
pause
