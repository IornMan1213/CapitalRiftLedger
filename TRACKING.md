# Tracker scripts

The full tracker sources live in this repo once pushed:

- `track-growth.mjs` — fetch `/api/game` and append to history
- `cli.cjs` — setup / track / open / launch (used by Windows `.cmd` files)

If they are missing from a sparse clone, copy them from your original **CapitalRiftLedger-Windows** zip:

```
app/track-growth.mjs → repo root and windows/app/
app/cli.cjs          → repo root and windows/app/
```

Or from this machine’s project folder if you still have the upload.

Quick test with system Node:

```bash
cp config.example.json config.json
# edit playerId + Cookie
node track-growth.mjs
node cli.cjs open
```
