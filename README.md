# Capital Rift — Empire Ledger

Local-first dashboard and tracker for **Capital Rift** empire metrics: net worth, cash, income, footprint, network health, workers, and more.

Nothing is uploaded. Data stays on your machine. Requests go only to `play.capitalrift.com`.

**Live demo:** https://iornman1213.github.io/CapitalRiftLedger/

---

## Features

- Wealth over time (net / liquid / cash vs bank)
- Income charts (daily stacked rent vs ops, per-minute lines)
- Network health (coverage % + out-of-stock)
- Footprint (shops & land)
- Inventory, workforce roles, top shops, fleet, bank
- Day-over-day alerts
- Daily / Hourly toggle
- CSV export
- Windows one-click setup, track, schedule, startup

## Option A — Windows portable pack

The `windows/` folder matches the portable package layout (without the bundled `node.exe`, which is ~85MB).

### If you have the full zip (with `runtime\\node.exe`)

1. Unzip anywhere  
2. Double-click **`1-Setup.cmd`** → paste player UUID + session Cookie  
3. **`2-Track-Today.cmd`** → pull live stats  
4. **`3-Open-Dashboard.cmd`** → open charts (leave window open)

Also available:

| Script | What it does |
|--------|----------------|
| `CapitalRiftLedger.cmd` / `Launch.cmd` | Track + open dashboard in one step |
| `Add-to-Startup.cmd` | Track on Windows login |
| `Remove-from-Startup.cmd` | Undo startup |
| `Schedule-Daily-Track.cmd` | Task Scheduler daily track |
| `Unschedule-Daily-Track.cmd` | Remove daily task |
| `Schedule-Hourly-Track.cmd` | Hourly history (ops detail) |
| `Unschedule-Hourly-Track.cmd` | Remove hourly task |
| `Track-Silent.cmd` | Track with no pause (for tasks) |
| `Track-Silent-Hourly.cmd` | Hourly silent track |
| `Create-Desktop-Shortcuts.vbs` | Desktop shortcuts |

Data lives in `%APPDATA%\\CapitalRiftLedger\\` (config, history, logs).

### Using this repo’s `windows/` folder without the big zip

1. Install [Node.js](https://nodejs.org/) 18+ **or** put a portable `node.exe` in `windows/runtime/`  
2. From `windows/`, run the same `.cmd` scripts (they call `runtime\\node.exe` and `app\\cli.cjs`)  
3. Or from the repo root with system Node:

```bat
node cli.cjs setup
node cli.cjs track
node cli.cjs open
```

Full original README for the pack: [`windows/README.txt`](windows/README.txt).

## Option B — Any OS with Node.js 18+

```bash
cp config.example.json config.json
# Edit playerId + Cookie

node track-growth.mjs              # daily point
node track-growth.mjs --hourly     # hourly point

# Serve folder so the dashboard can fetch JSON:
npx --yes serve .
# open http://localhost:3000/dashboard.html
```

You can also open `dashboard.html` and **drop** `growth-history.json` onto the page.

### Cookie

Browser → F12 → Network → any `play.capitalrift.com` request → Headers → Cookie.  
When track returns 401/403, refresh the cookie and run setup again.

## Repo layout

```
├── dashboard.html / index.html   # UI (GitHub Pages)
├── dashboard.js                  # Chart logic
├── growth-history.demo.json      # Demo for Pages
├── config.example.json
├── track-growth.mjs              # Cross-platform tracker
├── cli.cjs                       # setup | track | open | …
└── windows/                      # Portable Windows scripts + app/
    ├── 1-Setup.cmd …
    ├── app/cli.cjs
    ├── app/track-growth.mjs
    └── runtime/README.txt        # node.exe not in git (~85MB)
```

History files and `config.json` are **gitignored** so your numbers stay private.

## GitHub Pages

Settings → Pages → Deploy from branch **main** / **root**.

Demo URL: `https://<you>.github.io/CapitalRiftLedger/`

## Privacy

- Credentials only in local `config.json` / `%APPDATA%`
- Dashboard never uploads data
- Tracker only talks to the official game API

## License

MIT
