# Capital Rift — Empire Ledger

Local-first dashboard and tracker for **Capital Rift** empire metrics: net worth, cash, income, footprint, network health, workers, and more.

Nothing is uploaded. Data stays on your machine. Requests go only to `play.capitalrift.com`.

**Live demo (GitHub Pages):**  
https://iornman1213.github.io/CapitalRiftLedger/

---

## Features

- **Wealth over time** — net worth, liquid, cash vs bank (stacked)
- **Income** — daily income bars + rent vs ops vs wages (stacked or per-minute lines)
- **Network health** — coverage % and out-of-stock lanes
- **Footprint** — shops & land growth
- **Inventory, workforce roles, top shops, fleet breakdown**
- **Day-over-day alerts** (coverage drops, income/net-worth crashes, workforce shrinkage)
- **Daily / Hourly** toggle when you collect hourly history
- **CSV export** of the time series
- Works offline once history is loaded (drag-and-drop JSON or local server)

## Quick start (local)

### Option A — Windows portable pack
Use the full Windows zip (includes Node runtime + helper `.cmd` scripts).

1. Run `1-Setup.cmd` → paste player UUID + session Cookie  
2. Run `2-Track-Today.cmd`  
3. Run `3-Open-Dashboard.cmd`

### Option B — Any machine with Node.js 18+

```bash
# 1. Copy config
cp config.example.json config.json
# Edit config.json → put your player UUID and Cookie

# 2. Track once
node track-growth.mjs
# Optional hourly:
node track-growth.mjs --hourly

# 3. Open the dashboard
# Serve the folder (needed for auto-load of JSON):
npx --yes serve .
# or:  python3 -m http.server 8765
# Then open http://localhost:3000 (or :8765)/dashboard.html
```

You can also open `dashboard.html` directly and **drop** your `growth-history.json` onto the page.

## Config

`config.example.json`:

```json
{
  "playerUuid": "YOUR-PLAYER-UUID",
  "cookie": "session=...; other=..."
}
```

Cookie: browser → F12 → Network → any `play.capitalrift.com` request → Headers → Cookie.

When the cookie expires (401/403), refresh it and run setup/track again.

## Files

| File | Purpose |
|------|---------|
| `dashboard.html` / `index.html` | Charts + KPIs (GitHub Pages serves `index.html`) |
| `track-growth.mjs` | Pulls `/api/game` snapshot and appends to history |
| `cli.cjs` | Small CLI helper used by Windows scripts |
| `growth-history.demo.json` | Sample data so the Pages demo works |
| `config.example.json` | Template for credentials |

History files (`growth-history.json`, `growth-history-hourly.json`) are **gitignored** so your empire numbers stay private.

## GitHub Pages

This repo is set up for Pages from the `main` branch root. After enabling Pages in repo settings:

`https://<you>.github.io/CapitalRiftLedger/`

The demo loads `growth-history.demo.json` automatically. Drop your own JSON or run the tracker locally for real data.

## Privacy

- Credentials live only in local `config.json` (never committed).
- Dashboard reads JSON in the browser; no backend of ours.
- Tracker talks only to the official game API.

## License

MIT — use, fork, and adapt freely.
