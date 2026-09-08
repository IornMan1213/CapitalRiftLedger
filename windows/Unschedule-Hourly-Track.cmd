@echo off
title Unschedule Hourly Track
schtasks /Delete /TN "Capital Rift Ledger Hourly Track" /F 2>nul
echo Done (or task was not present).
pause
