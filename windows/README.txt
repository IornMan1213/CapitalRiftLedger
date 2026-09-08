Capital Rift — Empire Ledger (Windows portable)
===============================================

No install required when runtime\node.exe is present (full zip).
From this git repo, add node.exe under windows\runtime\ or use system Node.

QUICK START
-----------
1. Ensure runtime\node.exe exists (or use system node from repo root).

2. Double-click:  1-Setup.cmd
   - Paste your player UUID
   - Paste your session Cookie from the browser
     (Chrome/Edge → F12 → Network → any play.capitalrift.com request
      → Headers → Cookie → copy the value)

3. Double-click:  2-Track-Today.cmd
   - Pulls live net worth / cash / income into local history

4. Double-click:  3-Open-Dashboard.cmd
   - Opens the ledger in your browser
   - Leave that window open while viewing the dashboard

You can also double-click CapitalRiftLedger.cmd for a simple text menu.

DAILY USE
---------
  2-Track-Today.cmd   → once per day (or whenever you want a new point)
  3-Open-Dashboard.cmd → view charts and day-over-day changes

WHERE DATA IS STORED
--------------------
  %APPDATA%\CapitalRiftLedger\
    config.json           your UUID + cookie (private)
    growth-history.json   your time series
    raw-latest.json       last API response
    dashboard.html        local UI copy

Nothing is uploaded to third parties. Requests go only to play.capitalrift.com.

COOKIE EXPIRED?
---------------
If Track says 401/403, run 1-Setup.cmd again with a fresh Cookie.

AUTO-TRACK ON WINDOWS STARTUP
-----------------------------
1. Run 1-Setup.cmd once.
2. Double-click:  Add-to-Startup.cmd
3. Log: %APPDATA%\CapitalRiftLedger\startup-track.log
4. Remove: Remove-from-Startup.cmd

SCHEDULE DAILY / HOURLY
-----------------------
  Schedule-Daily-Track.cmd / Unschedule-Daily-Track.cmd
  Schedule-Hourly-Track.cmd / Unschedule-Hourly-Track.cmd

ONE-CLICK LAUNCH
----------------
  Launch.cmd or CapitalRiftLedger.cmd (no args)
  Tracks then opens the dashboard server.
