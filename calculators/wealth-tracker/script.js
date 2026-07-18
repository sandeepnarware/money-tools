const STORAGE_KEY = 'wealthTrackerData';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function defaultData() {
  return {
    items: {
      assets: [
        { id: uid(), name: 'Stocks / Mutual Funds', type: 'equity' },
        { id: uid(), name: 'Fixed Deposits', type: 'debt' },
        { id: uid(), name: 'Cash in Bank', type: 'cash' },
        { id: uid(), name: 'Real Estate', type: 'realEstate' },
      ],
      liabilities: [
        { id: uid(), name: 'Home Loan' },
        { id: uid(), name: 'Car Loan' },
      ],
      receivables: [
        { id: uid(), name: 'Loans Given' },
      ],
      payables: [
        { id: uid(), name: 'Credit Card Dues' },
      ],
    },
    snapshots: [],
    projectionRate: 10,
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.items && d.snapshots) return d;
    }
  } catch (e) {}
  const def = defaultData();
  saveData(def);
  return def;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function monthStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return y + '-' + m;
}

function formatNumber(n) {
  return Math.round(n).toLocaleString('en-IN');
}

function abbreviate(n) {
  const abs = Math.abs(n);
  if (abs >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
  if (abs >= 100000) return (n / 100000).toFixed(1) + 'L';
  if (abs >= 1000) return (n / 1000).toFixed(1) + 'K';
  return Math.round(n).toString();
}

document.addEventListener('DOMContentLoaded', () => {
  let data = loadData();
  let currentMonth = monthStr(new Date());
  let activeTab = 'assets';
  let activeChart = 'donut';

  const monthPicker = document.getElementById('monthPicker');
  const saveBtn = document.getElementById('saveBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const historyBody = document.getElementById('historyBody');
  const chartCanvas = document.getElementById('wealthChart');
  const fileInput = document.getElementById('fileInput');

  function getAllMonthOptions() {
    const months = new Set();
    data.snapshots.forEach(s => months.add(s.month));
    if (!months.has(currentMonth)) months.add(currentMonth);
    return [...months].sort();
  }

  function getSnapshot(month) {
    return data.snapshots.find(s => s.month === month);
  }

  function getCategoryTotal(cat, month) {
    const snap = getSnapshot(month);
    if (!snap) return 0;
    let total = 0;
    (data.items[cat] || []).forEach(item => {
      total += snap.values[item.id] || 0;
    });
    return total;
  }

  function getNetWorth(month) {
    const assets = getCategoryTotal('assets', month);
    const liabilities = getCategoryTotal('liabilities', month);
    const receivables = getCategoryTotal('receivables', month);
    const payables = getCategoryTotal('payables', month);
    return assets + receivables - liabilities - payables;
  }

  function getCategoryDetail(cat, month) {
    const snap = getSnapshot(month);
    const result = [];
    (data.items[cat] || []).forEach(item => {
      result.push({
        id: item.id,
        name: item.name,
        type: item.type || 'other',
        value: snap ? (snap.values[item.id] || 0) : 0,
      });
    });
    return result;
  }

  function setMonth(m) {
    currentMonth = m;
    monthPicker.value = m;
    renderGrid();
  }

  const catLabels = { assets: 'Asset', liabilities: 'Liability', receivables: 'Receivable', payables: 'Payable' };

  function findPreviousMonth(month) {
    const months = getAllMonthOptions().filter(m => getSnapshot(m) && m < month).sort();
    return months.length > 0 ? months[months.length - 1] : null;
  }

  const typeOptions = [
    { value: 'equity', label: 'Equity' },
    { value: 'debt', label: 'Debt' },
    { value: 'cash', label: 'Cash' },
    { value: 'realEstate', label: 'Real Estate' },
    { value: 'other', label: 'Other' },
  ];

  function renderGrid() {
    const container = document.getElementById('catItems');
    const cat = activeTab;
    const details = getCategoryDetail(cat, currentMonth);
    container.innerHTML = details.map(d => {
      const inputId = 'val-' + d.id;
      const typeSel = cat === 'assets' ? `
        <select class="item-type" data-id="${d.id}" style="font-size:0.75rem; padding:4px 4px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); outline:none; cursor:pointer; flex-shrink:0;">
          ${typeOptions.map(t => `<option value="${t.value}"${d.type === t.value ? ' selected' : ''}>${t.label}</option>`).join('')}
        </select>
      ` : '';
      return `
        <div class="item-row">
          <input type="text" class="item-name" value="${escHtml(d.name)}" data-id="${d.id}" data-cat="${cat}" placeholder="Name">
          ${typeSel}
          <div class="item-input-wrap">
            <input type="number" class="item-value" id="${inputId}" value="${d.value}" data-id="${d.id}" data-cat="${cat}" min="0" step="1" placeholder="0">
            <button class="del-item" data-id="${d.id}" data-cat="${cat}" title="Remove">✕</button>
          </div>
        </div>
      `;
    }).join('') + `<button class="add-item-btn" data-cat="${cat}">+ Add ${catLabels[cat] || 'Item'}</button>`;

    document.querySelectorAll('.cat-tab').forEach(btn => {
      btn.style.fontWeight = btn.dataset.cat === cat ? '700' : '400';
    });

    updateTotals();
    renderHistory();
    updateChart();
  }

  function escHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function updateTotals() {
    const cats = ['assets', 'liabilities', 'receivables', 'payables'];
    const labels = ['totalAssets', 'totalLiabilities', 'totalReceivables', 'totalPayables'];
    const colors = ['#1d4ed8', '#dc2626', '#16a34a', '#a16207'];

    cats.forEach((cat, i) => {
      const total = getCategoryTotal(cat, currentMonth);
      const el = document.getElementById(labels[i]);
      el.textContent = '\u20B9 ' + formatNumber(total);
      el.style.color = colors[i];
    });

    const nw = getNetWorth(currentMonth);
    const nwEl = document.getElementById('netWorth');
    nwEl.textContent = '\u20B9 ' + formatNumber(nw);
    nwEl.style.color = nw >= 0 ? '#16a34a' : '#dc2626';
  }

  function renderHistory() {
    const months = getAllMonthOptions().filter(m => getSnapshot(m));
    months.sort().reverse();
    historyBody.innerHTML = months.map(m => {
      const assets = getCategoryTotal('assets', m);
      const liabilities = getCategoryTotal('liabilities', m);
      const receivables = getCategoryTotal('receivables', m);
      const payables = getCategoryTotal('payables', m);
      const nw = assets + receivables - liabilities - payables;
      const isActive = m === currentMonth ? ' style="font-weight:700; background:var(--surface);"' : '';
      return `
        <tr${isActive}>
          <td><a href="#" class="month-link" data-month="${m}">${m}</a></td>
          <td class="text-right">${formatNumber(assets)}</td>
          <td class="text-right">${formatNumber(liabilities)}</td>
          <td class="text-right">${formatNumber(receivables)}</td>
          <td class="text-right">${formatNumber(payables)}</td>
          <td class="text-right" style="color:${nw >= 0 ? '#16a34a' : '#dc2626'}; font-weight:600;">${formatNumber(nw)}</td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.month-link').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        setMonth(a.dataset.month);
      });
    });
  }

  function saveSnapshot() {
    const snap = getSnapshot(currentMonth) || { month: currentMonth, values: {} };
    const cats = ['assets', 'liabilities', 'receivables', 'payables'];
    cats.forEach(cat => {
      (data.items[cat] || []).forEach(item => {
        const input = document.getElementById('val-' + item.id);
        if (input) {
          snap.values[item.id] = parseFloat(input.value) || 0;
        } else {
          snap.values[item.id] = snap.values[item.id] || 0;
        }
      });
    });

    const existing = data.snapshots.findIndex(s => s.month === currentMonth);
    if (existing >= 0) {
      data.snapshots[existing] = snap;
    } else {
      data.snapshots.push(snap);
    }
    saveData(data);
    renderGrid();
  }

  function syncValuesToSnapshot() {
    const snap = getSnapshot(currentMonth);
    if (!snap) return;
    const cats = ['assets', 'liabilities', 'receivables', 'payables'];
    cats.forEach(cat => {
      (data.items[cat] || []).forEach(item => {
        const input = document.getElementById('val-' + item.id);
        if (input) {
          snap.values[item.id] = parseFloat(input.value) || 0;
        }
      });
    });
  }

  function updateChart() {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = Math.round(displayW * 0.55);
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayW, displayH);

    if (activeChart === 'donut') drawDonutChart(ctx, displayW, displayH);
    else if (activeChart === 'growth') drawGrowthChart(ctx, displayW, displayH);
    else drawProjectionChart(ctx, displayW, displayH);
  }

  function drawDonutChart(ctx, w, h) {
    const assets = getCategoryDetail('assets', currentMonth);
    const types = {};
    const typeLabels = { equity: 'Equity', debt: 'Debt', cash: 'Cash', realEstate: 'Real Estate', other: 'Other' };
    const typeColors = { equity: '#2563eb', debt: '#f59e0b', cash: '#16a34a', realEstate: '#8b5cf6', other: '#94a3b8' };

    assets.forEach(a => {
      const t = a.type || 'other';
      types[t] = (types[t] || 0) + a.value;
    });

    const entries = Object.entries(types).filter(([, v]) => v > 0);
    if (entries.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No asset data for this month', w / 2, h / 2);
      return;
    }

    const total = entries.reduce((s, [, v]) => s + v, 0);
    const cx = w * 0.35, cy = h / 2;
    const radius = Math.min(w * 0.25, h * 0.35);

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, w, h);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      entries.forEach(([type, value]) => {
        const slice = (value / total) * Math.PI * 2;
        const segEnd = currentStart + slice;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, currentStart, end);
          ctx.closePath();
          ctx.fillStyle = typeColors[type] || '#94a3b8';
          ctx.fill();
        }
        currentStart = segEnd;
      });

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u20B9 ' + abbreviate(total), cx, cy + 5);

      let lx = w * 0.6, ly = 20;
      ctx.textAlign = 'left';
      ctx.font = '11px -apple-system, sans-serif';
      entries.forEach(([type, value]) => {
        const pct = ((value / total) * 100).toFixed(1);
        ctx.fillStyle = typeColors[type] || '#94a3b8';
        ctx.fillRect(lx, ly, 12, 12);
        ctx.fillStyle = '#1e293b';
        ctx.fillText((typeLabels[type] || type) + ' ' + pct + '%', lx + 18, ly + 10);
        ly += 22;
        if (ly > h - 20) { lx += 100; ly = 20; }
      });
    }
    function animate(time) {
      if (!startTime) startTime = time;
      const p = Math.min(1, (time - startTime) / 600);
      draw(p);
      if (p < 1) animId = requestAnimationFrame(animate);
    }
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(animate);
  }

  function drawGrowthChart(ctx, w, h) {
    const months = getAllMonthOptions().filter(m => getSnapshot(m)).sort();
    if (months.length < 1) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Save monthly snapshots to see growth', w / 2, h / 2);
      return;
    }

    const values = months.map(m => getNetWorth(m));
    const maxVal = Math.max(...values) * 1.15;
    const minVal = Math.min(0, ...values);
    const range = maxVal - minVal || 1;
    const padding = { top: 20, right: 20, bottom: 40, left: 64 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    function getX(i) { return padding.left + (i / (months.length - 1 || 1)) * chartW; }
    function getY(v) { return padding.top + chartH - ((v - minVal) / range) * chartH; }

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px -apple-system, sans-serif';
    for (let i = 0; i <= 5; i++) {
      const val = minVal + (range / 5) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(abbreviate(val), padding.left - 8, y + 4);
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    values.forEach((v, i) => {
      const x = getX(i);
      const y = getY(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#2563eb';
    values.forEach((v, i) => {
      const x = getX(i);
      const y = getY(v);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '9px -apple-system, sans-serif';
    const step = Math.max(1, Math.floor(months.length / 10));
    months.forEach((m, i) => {
      if (i % step === 0 || i === months.length - 1) {
        ctx.fillText(m.slice(5), getX(i), padding.top + chartH + 16);
      }
    });
  }

  function drawProjectionChart(ctx, w, h) {
    const nw = getNetWorth(currentMonth);
    if (nw === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter asset/liability values and save to see projection', w / 2, h / 2);
      return;
    }

    const rate = data.projectionRate / 100;
    const padding = { top: 20, right: 20, bottom: 40, left: 64 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const years = 10;
    const points = [];
    for (let y = 0; y <= years; y++) {
      points.push({ year: y, value: nw * Math.pow(1 + rate, y) });
    }

    const maxVal = points[points.length - 1].value * 1.1;
    const minVal = 0;
    const range = maxVal - minVal || 1;

    function getX(i) { return padding.left + (i / years) * chartW; }
    function getY(v) { return padding.top + chartH - ((v - minVal) / range) * chartH; }

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px -apple-system, sans-serif';
    for (let i = 0; i <= 5; i++) {
      const val = minVal + (range / 5) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(abbreviate(val), padding.left - 8, y + 4);
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(22, 163, 74, 0.2)');
    gradient.addColorStop(1, 'rgba(22, 163, 74, 0.02)');

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = getX(p.year);
      const y = getY(p.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(getX(years), padding.top + chartH);
    ctx.lineTo(getX(0), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    points.forEach((p, i) => {
      const x = getX(p.year);
      const y = getY(p.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#16a34a';
    points.forEach((p, i) => {
      const x = getX(p.year);
      const y = getY(p.value);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      if (i % 2 === 0 || i === years) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 9px -apple-system, sans-serif';
        ctx.fillText('\u20B9 ' + abbreviate(p.value), x, y - 10);
      }
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '9px -apple-system, sans-serif';
    for (let i = 0; i <= years; i++) {
      ctx.fillText('Yr ' + i, getX(i), padding.top + chartH + 16);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('At ' + data.projectionRate + '% annual growth', w / 2, h - 4);
  }

  function addItem(cat) {
    syncValuesToSnapshot();
    const item = { id: uid(), name: 'New Item', type: 'other' };
    data.items[cat].push(item);
    saveData(data);
    renderGrid();
    setTimeout(() => {
      const inputs = document.querySelectorAll('#catItems .item-name');
      const last = inputs[inputs.length - 1];
      if (last) { last.focus(); last.select(); }
    }, 50);
  }

  function deleteItem(id, cat) {
    syncValuesToSnapshot();
    if (!confirm('Remove this item? All its values across months will be lost.')) return;
    data.items[cat] = data.items[cat].filter(i => i.id !== id);
    data.snapshots.forEach(s => { delete s.values[id]; });
    saveData(data);
    renderGrid();
  }

  function deleteMonth() {
    const snap = getSnapshot(currentMonth);
    if (!snap) { alert('No data for this month.'); return; }
    if (!confirm('Delete snapshot for ' + currentMonth + '?')) return;
    data.snapshots = data.snapshots.filter(s => s.month !== currentMonth);
    saveData(data);
    renderGrid();
  }

  function renameItem(id, cat, name) {
    const item = data.items[cat].find(i => i.id === id);
    if (item) item.name = name;
  }

  function setItemType(id, type) {
    const item = data.items['assets'].find(i => i.id === id);
    if (item) item.type = type;
  }

  function valueChanged(id, cat) {
    const snap = getSnapshot(currentMonth);
    if (snap) {
      const input = document.getElementById('val-' + id);
      snap.values[id] = parseFloat(input.value) || 0;
      saveData(data);
      updateTotals();
      updateChart();
      renderHistory();
    }
  }

  function exportJson() {
    syncValuesToSnapshot();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wealth-tracker-' + monthStr(new Date()) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const d = JSON.parse(e.target.result);
        if (!d.items || !d.snapshots) throw new Error('Invalid format');
        data = d;
        saveData(data);
        setMonth(currentMonth);
        renderGrid();
        alert('Data imported successfully.');
      } catch (err) {
        alert('Invalid file. Please select a valid Wealth Tracker JSON export.');
      }
    };
    reader.readAsText(file);
  }

  function escCsv(v) {
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function exportCsv() {
    syncValuesToSnapshot();
    const months = getAllMonthOptions().filter(m => getSnapshot(m)).sort();
    if (months.length === 0) { alert('No data to export.'); return; }

    const catOrder = ['assets', 'liabilities', 'receivables', 'payables'];
    const catLabels2 = { assets: 'Assets', liabilities: 'Liabilities', receivables: 'Receivables', payables: 'Payables' };
    const lines = [];

    lines.push(['Month', 'Category', 'Item', 'Value'].join(','));

    months.forEach(m => {
      catOrder.forEach(cat => {
        const items = getCategoryDetail(cat, m);
        items.forEach(d => {
          lines.push([m, catLabels2[cat], escCsv(d.name), d.value].join(','));
        });
      });
    });

    const csv = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wealth-tracker-' + monthStr(new Date()) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function initEventListeners() {
    monthPicker.addEventListener('change', () => {
      syncValuesToSnapshot();
      setMonth(monthPicker.value);
    });

    saveBtn.addEventListener('click', saveSnapshot);

    deleteBtn.addEventListener('click', deleteMonth);

    document.getElementById('copyPrevBtn').addEventListener('click', () => {
      syncValuesToSnapshot();
      const prev = findPreviousMonth(currentMonth);
      if (!prev) { alert('No previous month snapshot found to copy from.'); return; }
      const snap = getSnapshot(currentMonth) || { month: currentMonth, values: {} };
      const prevSnap = getSnapshot(prev);
      const cats = ['assets', 'liabilities', 'receivables', 'payables'];
      cats.forEach(cat => {
        (data.items[cat] || []).forEach(item => {
          if (prevSnap.values[item.id] !== undefined) {
            snap.values[item.id] = prevSnap.values[item.id];
          }
        });
      });
      const existing = data.snapshots.findIndex(s => s.month === currentMonth);
      if (existing >= 0) data.snapshots[existing] = snap;
      else data.snapshots.push(snap);
      saveData(data);
      renderGrid();
    });

    document.querySelectorAll('.cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.cat;
        renderGrid();
      });
    });

    document.getElementById('btnDonut').addEventListener('click', () => {
      activeChart = 'donut';
      document.getElementById('btnDonut').className = 'btn btn-primary';
      document.getElementById('btnGrowth').className = 'btn btn-secondary';
      document.getElementById('btnProjection').className = 'btn btn-secondary';
      updateChart();
    });

    document.getElementById('btnGrowth').addEventListener('click', () => {
      activeChart = 'growth';
      document.getElementById('btnDonut').className = 'btn btn-secondary';
      document.getElementById('btnGrowth').className = 'btn btn-primary';
      document.getElementById('btnProjection').className = 'btn btn-secondary';
      updateChart();
    });

    document.getElementById('btnProjection').addEventListener('click', () => {
      activeChart = 'projection';
      document.getElementById('btnDonut').className = 'btn btn-secondary';
      document.getElementById('btnGrowth').className = 'btn btn-secondary';
      document.getElementById('btnProjection').className = 'btn btn-primary';
      updateChart();
    });

    document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
    document.getElementById('importJsonBtn').addEventListener('click', () => fileInput.click());
    document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) { importJson(fileInput.files[0]); fileInput.value = ''; }
    });

    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('item-name')) {
        renameItem(e.target.dataset.id, e.target.dataset.cat, e.target.value);
        saveData(data);
      }
      if (e.target.classList.contains('item-value')) {
        valueChanged(e.target.dataset.id, e.target.dataset.cat);
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('item-type')) {
        setItemType(e.target.dataset.id, e.target.value);
        saveData(data);
        updateChart();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('del-item')) {
        deleteItem(e.target.dataset.id, e.target.dataset.cat);
      }
      if (e.target.classList.contains('add-item-btn')) {
        addItem(e.target.dataset.cat);
      }
    });
  }

  setMonth(currentMonth);
  initEventListeners();
});
