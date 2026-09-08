/* Capital Rift Ledger - dashboard logic */
/* Full source is also in the local project; this file powers GitHub Pages */
const statusEl = document.getElementById('status');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
let lastHistory = null;
let viewGranularity = 'daily';
let cachedDaily = null;
let cachedHourly = null;
let wealthMode = 'net';
let charts = [];
let incomeMode = 'daily';
let incomeSplitInst = null;
let wealthChartInst = null;

function labelFor(r) {
  if (viewGranularity === 'hourly' && r.hour_key) {
    try {
      const [d, h] = r.hour_key.split('T');
      return fmtDate(d) + ' ' + h + ':00';
    } catch { return r.hour_key; }
  }
  return fmtDate(r.date);
}

document.getElementById('btnGranularity')?.addEventListener('click', () => {
  viewGranularity = viewGranularity === 'daily' ? 'hourly' : 'daily';
  document.getElementById('btnGranularity').textContent = viewGranularity === 'daily' ? 'Daily' : 'Hourly';
  const data = viewGranularity === 'hourly' ? cachedHourly : cachedDaily;
  if (data && data.length) {
    render(data);
    setStatus('Viewing ' + viewGranularity + ' · ' + data.length + ' row(s)', 'ok');
  } else {
    setStatus('No ' + viewGranularity + ' history yet.', 'error');
  }
});

function setStatus(msg, kind){
  statusEl.textContent = msg;
  statusEl.className = kind || '';
}
function openPicker(){ fileInput.click(); }
document.getElementById('btnPick').addEventListener('click', openPicker);
dropzone.addEventListener('click', openPicker);
dropzone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); }
});
fileInput.addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (f) handleFile(f);
});
['dragover','dragenter'].forEach(ev => dropzone.addEventListener(ev, e => {
  e.preventDefault(); dropzone.classList.add('drag');
}));
['dragleave','dragend'].forEach(ev => dropzone.addEventListener(ev, e => {
  dropzone.classList.remove('drag');
}));
dropzone.addEventListener('drop', e => {
  e.preventDefault(); dropzone.classList.remove('drag');
  const f = e.dataTransfer?.files?.[0];
  if (f) handleFile(f);
});
document.getElementById('btnReload').addEventListener('click', () => tryAutoLoad(true));
document.getElementById('btnCsv').addEventListener('click', exportCsv);

function handleFile(file){
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data) && data[0]?.hour_key) {
        cachedHourly = data; viewGranularity = 'hourly';
      } else {
        cachedDaily = data; viewGranularity = 'daily';
      }
      const btn = document.getElementById('btnGranularity');
      if (btn) btn.textContent = viewGranularity === 'daily' ? 'Daily' : 'Hourly';
      render(data);
      setStatus('Loaded from file · ' + data.length + ' row(s)', 'ok');
    } catch (err) {
      setStatus('Invalid JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

async function tryAutoLoad(manual){
  const errors = [];
  let usingDemo = false;
  try {
    const res = await fetch('./growth-history.json', { cache: 'no-store' });
    if (res.ok) cachedDaily = await res.json();
    else errors.push('daily ' + res.status);
  } catch (err) { errors.push('daily ' + err.message); }
  try {
    const res = await fetch('./growth-history-hourly.json', { cache: 'no-store' });
    if (res.ok) cachedHourly = await res.json();
  } catch (err) {}
  if ((!cachedDaily || !cachedDaily.length) && (!cachedHourly || !cachedHourly.length)) {
    try {
      const res = await fetch('./growth-history.demo.json', { cache: 'no-store' });
      if (res.ok) { cachedDaily = await res.json(); usingDemo = true; }
    } catch (err) {}
  }
  const preferred = viewGranularity === 'hourly' ? cachedHourly : cachedDaily;
  const fallback = viewGranularity === 'hourly' ? cachedDaily : cachedHourly;
  const data = (preferred && preferred.length) ? preferred : fallback;
  if (data && data.length) {
    if (preferred !== data) {
      viewGranularity = data === cachedHourly ? 'hourly' : 'daily';
      const btn = document.getElementById('btnGranularity');
      if (btn) btn.textContent = viewGranularity === 'daily' ? 'Daily' : 'Hourly';
    }
    render(data);
    setStatus(
      (usingDemo ? 'Demo data · ' : 'Loaded ') + viewGranularity + ' · ' + data.length + ' row(s)' +
      (usingDemo ? ' — drop your own growth-history.json' : ''),
      usingDemo ? '' : 'ok'
    );
  } else {
    setStatus(manual ? 'Could not fetch history. Use Open JSON.' : 'Open or drop growth-history.json to begin.', manual ? 'error' : '');
  }
}

const GOLD='#E8B54B', MINT='#3ED598', CORAL='#FF6B6B', VIOLET='#8B7FFF', SKY='#5FA8D3';
const PALETTE = [GOLD, VIOLET, MINT, CORAL, SKY, '#C77DFF', '#F0A868', '#7FD1D6'];
const fmtMoney = (n) => {
  if (n == null || !Number.isFinite(n)) return '—';
  const s = n < 0 ? '-' : '';
  return s + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
};
const fmtCompact = (n) => {
  if (n == null || !Number.isFinite(n)) return '—';
  const s = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a >= 1e9) return s + '$' + (a/1e9).toFixed(2) + 'B';
  if (a >= 1e6) return s + '$' + (a/1e6).toFixed(2) + 'M';
  if (a >= 1e3) return s + '$' + (a/1e3).toFixed(1) + 'K';
  return s + '$' + a.toFixed(0);
};
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return d; }
};
function deltaHtml(d){
  if (d == null || !Number.isFinite(d)) return '';
  const cls = d > 0 ? 'pos' : d < 0 ? 'neg' : 'flat';
  const sign = d > 0 ? '+' : '';
  return '<span class="' + cls + '">' + sign + fmtCompact(d) + '</span>';
}
function hasChart(){ return typeof Chart !== 'undefined'; }
function destroyCharts(){
  charts.forEach(c => { try { c.destroy(); } catch(_){} });
  charts = [];
}
function baseTooltip(extra){
  return Object.assign({ backgroundColor: '#111820', titleColor: '#E9EEF3', bodyColor: '#8494A2', borderColor: '#212B35', borderWidth: 1 }, extra || {});
}
function noChart(id){
  const el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="no-chart">Chart library unavailable</div>';
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]));
}

const MPD = 1440;
function rentDay(r){ return (r.income_rent_income_per_min != null) ? r.income_rent_income_per_min * MPD : null; }
function opsDay(r){ return (r.income_gross_per_min != null) ? r.income_gross_per_min * MPD : null; }
function wageDay(r){ return (r.income_wage_per_min != null) ? r.income_wage_per_min * MPD : null; }

function buildAlerts(rows){
  const alerts = [];
  if (rows.length < 2) return alerts;
  const last = rows[rows.length-1], prev = rows[rows.length-2];
  if (last.network_coverage != null && prev.network_coverage != null && (prev.network_coverage - last.network_coverage) >= 0.05)
    alerts.push('Network coverage fell ' + ((prev.network_coverage-last.network_coverage)*100).toFixed(1) + ' pts.');
  return alerts;
}

function render(history){
  if (!Array.isArray(history) || !history.length){ alert('No entries.'); return; }
  const rows = history
    .filter(h => h.source === 'game_api' || (h.net_worth != null && h.source !== 'access_me'))
    .slice()
    .sort((a,b) => String(a.hour_key||a.date||'').localeCompare(String(b.hour_key||b.date||'')));
  if (!rows.length){ alert('No game_api rows.'); return; }
  lastHistory = rows;
  document.getElementById('dropzone').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('btnCsv').disabled = false;
  document.getElementById('singleDayHint').style.display = rows.length < 2 ? 'block' : 'none';
  destroyCharts();
  if (hasChart()) {
    document.getElementById('chartWarn').style.display = 'none';
    Chart.defaults.font.family = "'IBM Plex Mono', monospace";
    Chart.defaults.font.size = 10.5;
    Chart.defaults.color = '#8494A2';
    Chart.defaults.borderColor = '#182029';
  } else document.getElementById('chartWarn').style.display = 'block';

  const last = rows[rows.length - 1];
  const prev = rows.length > 1 ? rows[rows.length - 2] : null;
  const d = (key) => (prev && last[key] != null && prev[key] != null) ? (last[key] - prev[key]) : null;

  const alerts = buildAlerts(rows);
  const alertBox = document.getElementById('alerts');
  if (alertBox) {
    if (alerts.length) {
      alertBox.style.display = 'block';
      const ul = document.getElementById('alertList');
      if (ul) ul.innerHTML = alerts.map(a => '<li>' + escapeHtml(a) + '</li>').join('');
    } else alertBox.style.display = 'none';
  }

  const kRent = document.getElementById('kRent');
  const dRentEl = document.getElementById('dRent');
  if (kRent) kRent.textContent = fmtCompact(rentDay(last));
  if (dRentEl && prev) {
    const rv = (rentDay(last) != null && rentDay(prev) != null) ? rentDay(last) - rentDay(prev) : null;
    dRentEl.innerHTML = deltaHtml(rv);
  }
  const kCov = document.getElementById('kCov');
  const dCovEl = document.getElementById('dCov');
  if (kCov) kCov.textContent = last.network_coverage != null ? (last.network_coverage * 100).toFixed(1) + '%' : '—';
  if (dCovEl) {
    const dCov = d('network_coverage');
    dCovEl.innerHTML = dCov == null ? '' : '<span class="' + (dCov >= 0 ? 'pos' : 'neg') + '">' + (dCov >= 0 ? '+' : '') + (dCov * 100).toFixed(1) + ' pts</span>';
  }

  renderIncomeSplit(rows);
  document.querySelectorAll('#incomeTabs .tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#incomeTabs .tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      incomeMode = btn.dataset.inc;
      renderIncomeSplit(rows);
    };
  });
  renderNetHealth(rows);

  document.getElementById('heroNw').textContent = fmtCompact(last.net_worth);
  document.getElementById('heroDelta').innerHTML = prev
    ? (deltaHtml(d('net_worth')) + ' <span class="flat">vs ' + fmtDate(prev.date) + '</span>')
    : '<span class="flat">First snapshot</span>';
  const city = last.city_name || (last.city && last.city.name) || '—';
  document.getElementById('heroMeta').textContent =
    `Day ${last.game_day ?? '—'} · ${city} · run ${last.run ?? '—'} · ${last.date}` +
    (last.display_name ? ` · ${last.display_name}` : '');

  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const setHtml = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };
  setText('kLiquid', fmtCompact(last.liquid_cash ?? last.bank_total));
  setText('kIncome', fmtCompact(last.income_24h));
  setText('kWorkers', last.worker_count != null ? last.worker_count.toLocaleString() : '—');
  setText('kVehicles', last.vehicle_count != null ? last.vehicle_count.toLocaleString() : '—');
  setText('kFoot', `${last.shop_count ?? '—'} · ${last.land_count ?? '—'}`);
  setText('kLoyalty', last.loyalty_points != null ? last.loyalty_points.toLocaleString() : '—');
  setHtml('dLiquid', deltaHtml(d('liquid_cash') ?? d('bank_total')));
  setHtml('dIncome', deltaHtml(d('income_24h')));
  setHtml('dWorkers', deltaHtml(d('worker_count')));
  setHtml('dVehicles', deltaHtml(d('vehicle_count')));
  const dShop = d('shop_count'), dLand = d('land_count');
  setHtml('dFoot', (dShop != null || dLand != null)
    ? [dShop != null ? `shops ${dShop>0?'+':''}${dShop}` : null, dLand != null ? `land ${dLand>0?'+':''}${dLand}` : null].filter(Boolean).join(' · ') : '');
  setHtml('dLoyalty', deltaHtml(d('loyalty_points')));

  if (hasChart()) {
    charts.push(new Chart(document.getElementById('heroChart'), {
      type: 'line',
      data: {
        labels: rows.map(r => r.date),
        datasets: [{
          data: rows.map(r => r.net_worth),
          borderColor: GOLD, borderWidth: 1.75, pointRadius: 0, tension: 0.3, fill: true,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0,0,0,100);
            g.addColorStop(0, 'rgba(232,181,75,0.25)');
            g.addColorStop(1, 'rgba(232,181,75,0)');
            return g;
          }
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    }));
  }
  renderWealthChart(rows);
  document.querySelectorAll('#wealthTabs .tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#wealthTabs .tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      wealthMode = btn.dataset.mode;
      renderWealthChart(rows);
    };
  });

  // Income bar
  if (hasChart()) {
    charts.push(new Chart(document.getElementById('incomeChart'), {
      type: 'bar',
      data: {
        labels: rows.map(r => labelFor(r)),
        datasets: [{
          data: rows.map(r => r.income_24h),
          backgroundColor: rows.map(r => (r.income_24h ?? 0) >= 0 ? 'rgba(62,213,152,0.75)' : 'rgba(255,107,107,0.75)'),
          maxBarThickness: 28
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: baseTooltip({ callbacks: { label: c => fmtMoney(c.raw) } }) },
        scales: { x: { grid: { display: false } }, y: { grid: { color: '#182029' }, ticks: { callback: v => fmtCompact(v) } } }
      }
    }));
  }
  // Footprint
  if (hasChart()) {
    charts.push(new Chart(document.getElementById('footChart'), {
      type: 'line',
      data: {
        labels: rows.map(r => labelFor(r)),
        datasets: [
          { label: 'Shops', data: rows.map(r => r.shop_count), borderColor: GOLD, pointRadius: 3, borderWidth: 2, tension: 0.2, spanGaps: true },
          { label: 'Land', data: rows.map(r => r.land_count), borderColor: VIOLET, pointRadius: 3, borderWidth: 2, tension: 0.2, spanGaps: true },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, color: '#8494A2', padding: 12 } },
          tooltip: baseTooltip()
        },
        scales: { x: { grid: { display: false } }, y: { grid: { color: '#182029' }, ticks: { precision: 0 } } }
      }
    }));
  }

  // Log table
  const tbody = document.querySelector('#logTable tbody');
  if (tbody) {
    tbody.innerHTML = [...rows].reverse().map((h, i, arr) => {
      const older = arr[i + 1];
      const dn = (older && h.net_worth != null && older.net_worth != null) ? h.net_worth - older.net_worth : null;
      return `<tr>
        <td>${h.date}</td><td>${h.game_day ?? '—'}</td>
        <td class="amt">${fmtMoney(h.net_worth)}</td>
        <td class="amt">${dn == null ? '—' : deltaHtml(dn)}</td>
        <td class="amt">${fmtMoney(h.cash)}</td>
        <td class="amt">${fmtMoney(h.bank_total)}</td>
        <td class="amt">${fmtMoney(h.income_24h)}</td>
        <td class="amt">${h.shop_count ?? '—'}</td>
        <td class="amt">${h.land_count ?? '—'}</td>
      </tr>`;
    }).join('');
  }
}

function renderWealthChart(rows){
  if (wealthChartInst) {
    try { wealthChartInst.destroy(); } catch(_){}
    charts = charts.filter(c => c !== wealthChartInst);
    wealthChartInst = null;
  }
  if (!hasChart()) { noChart('wealthBox'); return; }
  let canvas = document.getElementById('wealthChart');
  if (!canvas) {
    document.getElementById('wealthBox').innerHTML = '<canvas id="wealthChart"></canvas>';
    canvas = document.getElementById('wealthChart');
  }
  let datasets;
  if (wealthMode === 'net') {
    datasets = [{ label: 'Net worth', data: rows.map(r => r.net_worth), borderColor: GOLD, backgroundColor: 'rgba(232,181,75,0.12)', fill: true, pointRadius: 3, pointBackgroundColor: GOLD, tension: 0.25, borderWidth: 2, spanGaps: true }];
  } else if (wealthMode === 'liquid') {
    datasets = [{ label: 'Liquid', data: rows.map(r => r.liquid_cash), borderColor: MINT, backgroundColor: 'rgba(62,213,152,0.12)', fill: true, pointRadius: 3, pointBackgroundColor: MINT, tension: 0.25, borderWidth: 2, spanGaps: true }];
  } else {
    datasets = [
      { label: 'Cash', data: rows.map(r => r.cash), borderColor: MINT, backgroundColor: 'rgba(62,213,152,0.15)', fill: true, pointRadius: 0, borderWidth: 2, stack: 's' },
      { label: 'Bank', data: rows.map(r => r.bank_total), borderColor: VIOLET, backgroundColor: 'rgba(139,127,255,0.15)', fill: true, pointRadius: 0, borderWidth: 2, stack: 's' },
    ];
  }
  wealthChartInst = new Chart(canvas, {
    type: 'line',
    data: { labels: rows.map(r => labelFor(r)), datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: wealthMode === 'split' ? { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, color: '#8494A2', padding: 12 } } : { display: false },
        tooltip: baseTooltip({ callbacks: { label: c => (c.dataset.label || '') + ': ' + fmtMoney(c.raw) } })
      },
      scales: {
        x: { grid: { display: false } },
        y: { stacked: wealthMode === 'split', grid: { color: '#182029' }, ticks: { callback: v => fmtCompact(v) } }
      }
    }
  });
  charts.push(wealthChartInst);
}

function renderIncomeSplit(rows){
  if (incomeSplitInst) { try{incomeSplitInst.destroy();}catch(e){} charts = charts.filter(c => c !== incomeSplitInst); incomeSplitInst = null; }
  if (!hasChart()) { noChart('incomeSplitBox'); return; }
  let canvas = document.getElementById('incomeSplitChart');
  if (!canvas) { document.getElementById('incomeSplitBox').innerHTML = '<canvas id="incomeSplitChart"></canvas>'; canvas = document.getElementById('incomeSplitChart'); }
  const stacked = incomeMode === 'daily';
  const datasets = incomeMode === 'daily' ? [
    { label: 'Rent / day', data: rows.map(r => rentDay(r)), backgroundColor: 'rgba(232,181,75,0.75)', stack: 'i', maxBarThickness: 28 },
    { label: 'Ops / day', data: rows.map(r => opsDay(r)), backgroundColor: 'rgba(62,213,152,0.75)', stack: 'i', maxBarThickness: 28 },
  ] : [
    { label: 'Net / min', data: rows.map(r => r.income_net_per_min), borderColor: GOLD, pointRadius: 2, borderWidth: 2, tension: 0.2, spanGaps: true },
    { label: 'Rent / min', data: rows.map(r => r.income_rent_income_per_min), borderColor: VIOLET, pointRadius: 2, borderWidth: 2, tension: 0.2, spanGaps: true },
  ];
  incomeSplitInst = new Chart(canvas, {
    type: incomeMode === 'daily' ? 'bar' : 'line',
    data: { labels: rows.map(r => labelFor(r)), datasets },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, color: '#8494A2', padding: 12 } },
        tooltip: baseTooltip({ callbacks: { label: c => c.dataset.label + ': ' + fmtMoney(c.raw) } })
      },
      scales: {
        x: { grid: { display: false } },
        y: { stacked: stacked, grid: { color: '#182029' }, ticks: { callback: v => fmtCompact(v) } }
      }
    }
  });
  charts.push(incomeSplitInst);
}

function renderNetHealth(rows){
  if (!hasChart()) { noChart('netHealthBox'); return; }
  let canvas = document.getElementById('netHealthChart');
  if (!canvas) return;
  charts.push(new Chart(canvas, {
    type: 'line',
    data: {
      labels: rows.map(r => labelFor(r)),
      datasets: [
        { label: 'Coverage %', data: rows.map(r => r.network_coverage != null ? r.network_coverage * 100 : null), borderColor: MINT, yAxisID: 'y', pointRadius: 3, borderWidth: 2, tension: 0.2, spanGaps: true },
        { label: 'Out of stock', data: rows.map(r => r.network_out_of_stock), borderColor: CORAL, yAxisID: 'y1', pointRadius: 3, borderWidth: 2, tension: 0.2, spanGaps: true },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, color: '#8494A2', padding: 12 } }, tooltip: baseTooltip() },
      scales: {
        x: { grid: { display: false } },
        y: { position: 'left', grid: { color: '#182029' }, min: 0, max: 100 },
        y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { precision: 0 } }
      }
    }
  }));
}

function exportCsv(){
  if (!lastHistory?.length) return;
  const cols = ['date','game_day','net_worth','cash','bank_total','liquid_cash','income_24h','shop_count','land_count','loyalty_points','run','city_name'];
  const lines = [cols.join(',')];
  for (const r of lastHistory) {
    lines.push(cols.map(c => {
      let v = r[c];
      if (v == null) return '';
      if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) return '"' + v.replace(/"/g,'""') + '"';
      return v;
    }).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'capitalrift-growth.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

tryAutoLoad(false);
