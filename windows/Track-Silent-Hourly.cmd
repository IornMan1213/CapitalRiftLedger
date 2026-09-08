@echo off
cd /d "%~dp0"
"%~dp0runtime\node.exe" "%~dp0app\cli.cjs" track-hourly >> "%APPDATA%\CapitalRiftLedger\startup-track.log" 2>&1
