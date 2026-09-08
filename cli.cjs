#!/usr/bin/env node
/** Capital Rift Ledger CLI — setup | track | track-hourly | open | launch | status */
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');

const root = __dirname;
const isWin = process.platform === 'win32';
const dataDir = process.env.CAPITALRIFT_DATA || (isWin
  ? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'CapitalRiftLedger')
  : path.join(os.homedir(), '.capitalrift-ledger'));

function ensureData() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

function configPath() {
  return path.join(ensureData(), 'config.json');
}

function copyAssets() {
  const dir = ensureData();
  for (const f of ['dashboard.html', 'dashboard.js', 'growth-history.demo.json', 'track-growth.mjs']) {
    const src = path.join(root, f);
    const alt = path.join(root, 'assets', f);
    const from = fs.existsSync(src) ? src : (fs.existsSync(alt) ? alt : null);
    if (from) fs.copyFileSync(from, path.join(dir, f));
  }
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
    fs.writeFileSync(path.join(root, 'config.json'), JSON.stringify(body, null, 2));
    copyAssets();
    console.log('Saved', configPath());
  })();
}

function runTrack(hourly) {
  copyAssets();
  const dir = ensureData();
  const cfg = configPath();
  if (fs.existsSync(cfg)) {
    fs.copyFileSync(cfg, path.join(root, 'config.json'));
    fs.copyFileSync(cfg, path.join(dir, 'config.json'));
  }
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
    console.log('Serving', dir);
    try {
      if (isWin) execSync('start ' + url, { shell: true });
      else if (process.platform === 'darwin') execSync('open ' + url);
      else execSync('xdg-open ' + url);
    } catch (_) {}
  });
}

const cmd = (process.argv[2] || 'help').toLowerCase();
if (cmd === 'setup') cmdSetup();
else if (cmd === 'track') runTrack(false);
else if (cmd === 'track-hourly') runTrack(true);
else if (cmd === 'open' || cmd === 'dashboard') openDash();
else if (cmd === 'launch') { runTrack(false); setTimeout(openDash, 1500); }
else if (cmd === 'status') {
  const dir = ensureData();
  console.log('Data:', dir);
  console.log('Config:', fs.existsSync(configPath()) ? 'yes' : 'no');
  for (const f of ['growth-history.json', 'growth-history-hourly.json']) {
    const p = path.join(dir, f);
    console.log(f + ':', fs.existsSync(p) ? fs.statSync(p).size + ' bytes' : 'missing');
  }
} else {
  console.log('Usage: node cli.cjs <setup|track|track-hourly|open|launch|status>');
}
