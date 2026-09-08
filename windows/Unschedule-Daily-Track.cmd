@echo off
title Unschedule Daily Track
schtasks /Delete /TN "Capital Rift Ledger Daily Track" /F 2>nul
echo Done (or task was not present).
pause
