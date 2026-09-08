#!/usr/bin/env node
/** Windows pack CLI — same as root cli.cjs */
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');

const root = path.join(__dirname, '..');
const appDir = __dirname;
const isWin = process.platform === 'win32';
const dataDir = process.env.APPDATA
  ? path.join(process.env.APPDATA, 'CapitalRiftLedger')
  : path.join(os.homedir(), '.capitalrift-ledger');

function ensureData() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

function configPath() { return path.join(ensureData(), 'config.json'); }

function copyAssets() {
  const dir = ensureData();
  const assets = path.join(appDir, 'assets');
  for (const f of ['dashboard.html', 'growth-history.demo.json']) {
    const from = path.join(assets, f);
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(dir, f));
  }
  const track = path.join(appDir, 'track-growth.mjs');
  if (fs.existsSync(track)) fs.copyFileSync(track, path.join(dir, 'track-growth.mjs'));
  // Prefer repo-root dashboard.js if present next to windows/
  const dashJs = path.join(root, '..', 'dashboard.js');
  if (fs.existsSync(dashJs)) fs.copyFileSync(dashJs, path.join(dir, 'dashboard.js'));
}

function cmdSetup() {
  const dir = ensureData();
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = q => new Promise(res => rl.question(q, res));
  (async () => {
    console.log('Data folder:', dir);
    const playerId = (await ask('Player UUID: ')).trim();
    const cookie = (await ask('Cookie: ')).trim();
    rl.close();
    const body = {
      url: 'https://play.capitalrift.com/api/game/{playerId}',
      playerId,
      headers: { Cookie: cookie }
    };
    fs.writeFileSync(configPath(), JSON.stringify(body, null, 2));
    fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(body, null, 2));
    copyAssets();
    console.log('Saved', configPath());
  })();
}

function runTrack(hourly) {
  copyAssets();
  const dir = ensureData();
  const cfg = configPath();
  if (fs.existsSync(cfg)) fs.copyFileSync(cfg, path.join(dir, 'config.json'));
  const args = [path.join(dir, 'track-growth.mjs')];
  if (hourly) args.push('--hourly');
  const child = spawn(process.execPath, args, { cwd: dir, stdio: 'inherit' });
  child.on('exit', code => process.exit(code || 0));
}

function openDash() {
  copyAssets();
  const dir = ensureData();
  const http = require('http');
  const port = 8765;
  const server = http.createServer((req, res) => {
    let u = req.url.split('?')[0];
    if (u === '/') u = '/dashboard.html';
    const fp = path.join(dir, path.normalize(u).replace(/^(\.\.[/\\])+/, ''));
    if (!fp.startsWith(dir)) { res.writeHead(403); return res.end(); }
    fs.readFile(fp, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      const ext = path.extname(fp);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
  server.listen(port, () => {
    const url = 'http://127.0.0.1:' + port + '/dashboard.html';
    console.log('Dashboard', url);
    try { if (isWin) execSync('start ' + url, { shell: true }); } catch (_) {}
  });
}

const cmd = (process.argv[2] || 'help').toLowerCase();
if (cmd === 'setup') cmdSetup();
else if (cmd === 'track') runTrack(false);
else if (cmd === 'track-hourly') runTrack(true);
else if (cmd === 'open' || cmd === 'dashboard') openDash();
else if (cmd === 'launch') { runTrack(false); setTimeout(openDash, 1500); }
else if (cmd === 'status') {
  console.log('Data:', ensureData());
  console.log('Config:', fs.existsSync(configPath()) ? 'yes' : 'no');
} else {
  console.log('Usage: node cli.cjs <setup|track|track-hourly|open|launch|status>');
}
