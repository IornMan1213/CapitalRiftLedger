#!/usr/bin/env node
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, 'config.json');
const HISTORY_PATH = path.join(__dirname, 'growth-history.json');
const HISTORY_HOURLY = path.join(__dirname, 'growth-history-hourly.json');
const RAW_PATH = path.join(__dirname, 'raw-latest.json');
const HOURLY_KEEP_DAYS = 14;
const hourly = process.argv.includes('--hourly');

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function loadConfig() {
  if (!(await fileExists(CONFIG_PATH))) {
    console.error('Missing config.json — copy config.example.json and set playerId + Cookie.');
    process.exit(1);
  }
  const cfg = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
  const playerId = cfg.playerId || cfg.playerUuid;
  if (!playerId) { console.error('config.json needs playerId'); process.exit(1); }
  let url = (cfg.url || 'https://play.capitalrift.com/api/game/{playerId}').replace('{playerId}', playerId);
  const headers = { Accept: 'application/json', ...(cfg.headers || {}) };
  if (cfg.cookie && !headers.Cookie) headers.Cookie = cfg.cookie;
  if (!headers.Cookie) { console.error('config.json needs headers.Cookie or cookie'); process.exit(1); }
  return { url, headers, playerId };
}

async function loadHistory(p) {
  if (!(await fileExists(p))) return [];
  try {
    const data = JSON.parse(await readFile(p, 'utf-8'));
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function hourKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  return y + '-' + m + '-' + day + 'T' + h;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function extractGameApiSnapshot(body, fetchedAt) {
  const g = body?.game || body?.data?.game || body;
  const player = g?.player || g?.me || g || {};
  const wealth = player.wealth || player.netWorth || {};
  const date = fetchedAt.slice(0, 10);
  return {
    source: 'game_api', date,
    hour_key: hourKey(new Date(fetchedAt)),
    granularity: hourly ? 'hourly' : 'daily',
    fetched_at: fetchedAt,
    game_day: num(player.day ?? player.gameDay ?? g.day),
    city_name: player.city?.name || player.cityName || null,
    run: num(player.run ?? g.run),
    display_name: player.displayName || player.name || null,
    net_worth: num(wealth.net ?? wealth.netWorth ?? player.netWorth),
    cash: num(wealth.cash ?? player.cash),
    bank_total: num(wealth.bank ?? wealth.bankTotal ?? player.bank),
    liquid_cash: num(wealth.liquid ?? wealth.liquidCash),
    income_24h: num(player.income24h ?? player.income_24h ?? wealth.income24h),
    shop_count: num(player.shops?.length ?? player.shopCount),
    land_count: num(player.landCount ?? player.parcels?.length),
    loyalty_points: num(player.loyalty ?? player.loyaltyPoints),
    worker_count: num(player.workers?.length ?? player.workerCount),
    vehicle_count: num(player.vehicles?.length ?? player.vehicleCount),
    network_coverage: num(player.network?.coverage ?? player.networkCoverage),
    network_out_of_stock: num(player.network?.outOfStock ?? player.networkOutOfStock),
    income_rent_income_per_min: num(player.income?.rentPerMin ?? player.rentIncomePerMin),
    income_gross_per_min: num(player.income?.grossPerMin ?? player.grossOpsPerMin),
    income_wage_per_min: num(player.income?.wagePerMin ?? player.wagePerMin),
    income_net_per_min: num(player.income?.netPerMin ?? player.netIncomePerMin),
    inventory: player.inventory || null,
    worker_by_role: player.workerByRole || null,
    top_shops: player.topShops || null,
    bank_accounts: player.bankAccounts || null,
    vehicle_by_model: player.vehicleByModel || null,
  };
}

async function main() {
  const { url, headers } = await loadConfig();
  console.log('Fetching', url);
  const res = await fetch(url, { headers });
  const text = await res.text();
  await writeFile(RAW_PATH, text, 'utf-8');
  if (!res.ok) {
    console.error('HTTP', res.status, text.slice(0, 400));
    process.exit(1);
  }
  let body;
  try { body = JSON.parse(text); } catch (e) {
    console.error('Invalid JSON from API'); process.exit(1);
  }
  const fetchedAt = new Date().toISOString();
  const snapshot = extractGameApiSnapshot(body, fetchedAt);
  const outPath = hourly ? HISTORY_HOURLY : HISTORY_PATH;
  let history = await loadHistory(outPath);
  if (hourly) {
    history = history.filter(r => r.hour_key !== snapshot.hour_key);
    history.push(snapshot);
    const cutoff = Date.now() - HOURLY_KEEP_DAYS * 864e5;
    history = history.filter(r => {
      const t = Date.parse(r.fetched_at || (r.date + 'T00:00:00Z'));
      return !Number.isFinite(t) || t >= cutoff;
    });
  } else {
    history = history.filter(r => r.date !== snapshot.date || r.source !== 'game_api');
    history.push(snapshot);
  }
  history.sort((a, b) => String(a.hour_key || a.date).localeCompare(String(b.hour_key || b.date)));
  await writeFile(outPath, JSON.stringify(history, null, 2), 'utf-8');
  console.log('net_worth', snapshot.net_worth, 'Saved →', outPath, '(' + history.length + ' rows)');
}

main().catch(err => { console.error(err); process.exit(1); });
