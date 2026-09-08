@echo off
cd /d "%~dp0"
set "NODE=%~dp0runtime\node.exe"
if not exist "%NODE%" set "NODE=node"
if not exist "%APPDATA%\CapitalRiftLedger" mkdir "%APPDATA%\CapitalRiftLedger"
"%NODE%" "%~dp0app\cli.cjs" track-hourly >> "%APPDATA%\CapitalRiftLedger\startup-track.log" 2>&1
