@echo off
title Capital Rift Ledger — Add to Startup
cd /d "%~dp0"

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT=%STARTUP%\Capital Rift Ledger Track.lnk"
set "TARGET=%~dp0Track-Silent.cmd"

if not exist "%~dp0runtime\node.exe" (
  echo.
  echo  Missing runtime\node.exe — unzip the full package first.
  echo.
  pause
  exit /b 1
)

if not exist "%~dp0app\cli.cjs" (
  echo.
  echo  Missing app\cli.cjs
  echo.
  pause
  exit /b 1
)

if not exist "%APPDATA%\CapitalRiftLedger" mkdir "%APPDATA%\CapitalRiftLedger"

echo.
echo  Creating startup shortcut:
echo    %SHORTCUT%
echo.
echo  Each time you sign in to Windows, Track-Silent.cmd will run
echo  (fetches your stats into growth-history.json).
echo  Log: %%APPDATA%%\CapitalRiftLedger\startup-track.log
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%TARGET%'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 7; $s.Description = 'Capital Rift Ledger — daily track on login'; $s.Save()"

if errorlevel 1 (
  echo  Failed to create shortcut.
  pause
  exit /b 1
)

echo  Done. Ledger will track on next sign-in.
echo.
echo  To remove later, run Remove-from-Startup.cmd
echo.
pause
