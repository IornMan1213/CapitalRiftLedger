@echo off
title Capital Rift Ledger — Remove from Startup
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Capital Rift Ledger Track.lnk"
if exist "%SHORTCUT%" (
  del "%SHORTCUT%"
  echo Removed startup shortcut.
) else (
  echo No startup shortcut found.
)
pause
