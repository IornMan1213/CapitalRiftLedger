Place a portable Node.js Windows binary here as:

  node.exe

Download from https://nodejs.org/ (Windows Binary .zip) and copy node.exe into this folder.

Or use the full CapitalRiftLedger-Windows release zip which already includes runtime\node.exe (~85MB).

Without node.exe, the .cmd scripts will fail; you can still run from the repo root with a system-wide Node install:

  node cli.cjs setup
  node cli.cjs track
  node cli.cjs open
