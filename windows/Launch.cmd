@echo off
title Capital Rift — Launch
cd /d "%~dp0"
"%~dp0runtime\node.exe" "%~dp0app\cli.cjs" launch
pause
