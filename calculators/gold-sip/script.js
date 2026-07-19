document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goldReturnForm');
  const resultsSection = document.getElementById('resultsSection');
  const purchaseRows = document.getElementById('purchaseRows');
  const addPurchaseBtn = document.getElementById('addPurchaseBtn');
  const currentGoldPriceInput = document.getElementById('currentGoldPrice');
  const fetchPriceBtn = document.getElementById('fetchPriceBtn');
  const priceStatus = document.getElementById('priceStatus');

  const resultTotalInvested = document.getElementById('resultTotalInvested');
  const resultTotalCurrent = document.getElementById('resultTotalCurrent');
  const resultGainLoss = document.getElementById('resultGainLoss');
  const resultOverallReturn = document.getElementById('resultOverallReturn');
  const tableBody = document.getElementById('goldReturnBody');
  const chartCanvas = document.getElementById('goldReturnChart');

  const colors = ['#d97706', '#005c8e', '#00652c', '#ba1a1a', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  document.querySelectorAll('.remove-purchase-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.purchase-row').remove());
  });

  addPurchaseBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'form-row purchase-row';
    row.innerHTML = `
      <div class="form-group">
        <label>Purchase Date</label>
        <input type="date" class="purchase-date">
      </div>
      <div class="form-group">
        <label>Price Paid (per gram)</label>
        <div class="input-wrapper">
          <input type="number" class="purchase-price" required min="1" step="10" value="5000">
          <span class="suffix">&#8377;</span>
        </div>
      </div>
      <div class="form-group">
        <label>Weight</label>
        <div class="input-wrapper">
          <input type="number" class="purchase-weight" required min="0.1" step="1" value="10">
          <span class="suffix">g</span>
        </div>
      </div>
      <div style="display:flex; align-items:end; margin-bottom:12px;">
        <button type="button" class="btn btn-secondary remove-purchase-btn" style="font-size:0.75rem; padding:6px 10px;">&times; Remove</button>
      </div>`;
    row.querySelector('.remove-purchase-btn').addEventListener('click', () => row.remove());
    purchaseRows.appendChild(row);
  });

  function getPurchases() {
    const rows = purchaseRows.querySelectorAll('.purchase-row');
    return Array.from(rows).map(row => {
      const date = row.querySelector('.purchase-date').value;
      const price = parseFloat(row.querySelector('.purchase-price').value) || 0;
      const weight = parseFloat(row.querySelector('.purchase-weight').value) || 0;
      return { date, price, weight };
    }).filter(p => p.weight > 0 && p.price > 0);
  }

  // CSV Upload & Template
  const csvUpload = document.getElementById('csvUpload');
  const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');

  downloadTemplateBtn.addEventListener('click', () => {
    const csvContent = 'Purchase Date,Price Per Gram,Weight (g)\n2023-01-15,5000,10\n2023-06-20,5500,8\n2024-03-10,6200,5\n2024-09-05,6800,12\n2025-02-14,7200,6';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gold-purchase-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  csvUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('CSV must have a header row and at least one data row.');
        return;
      }
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < 3) continue;
        const date = cols[0];
        const price = parseFloat(cols[1].replace(/[^\d.-]/g, '')) || 0;
        const weight = parseFloat(cols[2].replace(/[^\d.-]/g, '')) || 0;
        if (price > 0 && weight > 0) {
          parsed.push({ date, price, weight });
        }
      }
      if (parsed.length === 0) {
        alert('No valid purchase data found in CSV.');
        return;
      }
      purchaseRows.innerHTML = '';
      parsed.forEach((p) => {
        const row = document.createElement('div');
        row.className = 'form-row purchase-row';
        row.innerHTML = `
          <div class="form-group">
            <label>Purchase Date</label>
            <input type="date" class="purchase-date" value="${p.date}">
          </div>
          <div class="form-group">
            <label>Price Paid (per gram)</label>
            <div class="input-wrapper">
              <input type="number" class="purchase-price" required min="1" step="10" value="${p.price}">
              <span class="suffix">&#8377;</span>
            </div>
          </div>
          <div class="form-group">
            <label>Weight</label>
            <div class="input-wrapper">
              <input type="number" class="purchase-weight" required min="0.1" step="1" value="${p.weight}">
              <span class="suffix">g</span>
            </div>
          </div>
          <div style="display:flex; align-items:end; margin-bottom:12px;">
            <button type="button" class="btn btn-secondary remove-purchase-btn" style="font-size:0.75rem; padding:6px 10px;">&times; Remove</button>
          </div>`;
        row.querySelector('.remove-purchase-btn').addEventListener('click', () => row.remove());
        purchaseRows.appendChild(row);
      });
      calculate();
    };
    reader.readAsText(file);
  });

  // Live price fetch
  fetchPriceBtn.addEventListener('click', async () => {
    priceStatus.textContent = 'Fetching live gold price...';
    priceStatus.style.color = 'var(--text-secondary)';
    try {
      const res = await fetch('https://api.metals.live/v1/spot/gold');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const usdPerOz = data.amount || data;
      const forexRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!forexRes.ok) throw new Error('Forex API error');
      const forexData = await forexRes.json();
      const inrPerUsd = forexData.rates.INR;
      // 1 troy oz = 31.1035 grams
      const inrPerGram = (usdPerOz / 31.1035) * inrPerUsd;
      currentGoldPriceInput.value = Math.round(inrPerGram);
      priceStatus.textContent = `Live price: \u20B9${Math.round(inrPerGram)}/g (1 oz = $${usdPerOz}, 1 USD = \u20B9${inrPerUsd})`;
      priceStatus.style.color = '#00652c';
    } catch {
      priceStatus.textContent = 'Could not fetch live price. Enter manually.';
      priceStatus.style.color = '#ba1a1a';
    }
  });

  function calculate() {
    const goldPriceToday = parseFloat(currentGoldPriceInput.value);
    if (!goldPriceToday || goldPriceToday <= 0) {
      alert('Please enter a valid current gold price per gram.');
      return;
    }

    const purchases = getPurchases();
    if (purchases.length === 0) {
      alert('Please add at least one gold purchase.');
      return;
    }

    const results = purchases.map(p => {
      const invested = p.price * p.weight;
      const currentValue = goldPriceToday * p.weight;
      const gain = currentValue - invested;
      const ret = invested > 0 ? (gain / invested) * 100 : 0;
      return { ...p, invested, currentValue, gain, ret };
    });

    const totalInvested = results.reduce((s, r) => s + r.invested, 0);
    const totalCurrent = results.reduce((s, r) => s + r.currentValue, 0);
    const totalGain = totalCurrent - totalInvested;
    const overallRet = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    resultTotalInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvested));
    resultTotalCurrent.textContent = '\u20B9 ' + formatNumber(Math.round(totalCurrent));
    resultGainLoss.textContent = (totalGain >= 0 ? '\u20B9 ' : '-\u20B9 ') + formatNumber(Math.round(Math.abs(totalGain)));
    resultGainLoss.className = 'value ' + (totalGain >= 0 ? 'success' : 'danger');
    resultOverallReturn.textContent = overallRet.toFixed(2) + '%';
    resultOverallReturn.className = 'value ' + (overallRet >= 0 ? 'success' : 'danger');

    tableBody.innerHTML = results.map(r => `
      <tr>
        <td>${r.date || '-'}</td>
        <td class="text-right">${formatNumber(Math.round(r.price))}</td>
        <td class="text-right">${r.weight.toFixed(2)} g</td>
        <td class="text-right">${formatNumber(Math.round(r.invested))}</td>
        <td class="text-right">${formatNumber(Math.round(r.currentValue))}</td>
        <td class="text-right" style="color:${r.ret >= 0 ? '#00652c' : '#ba1a1a'}">${r.ret.toFixed(2)}%</td>
        <td class="text-right" style="color:${r.gain >= 0 ? '#00652c' : '#ba1a1a'}">${r.gain >= 0 ? '+' : ''}${formatNumber(Math.round(r.gain))}</td>
      </tr>
    `).join('');

    drawChart(results);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(purchases) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);
    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const radius = displaySize / 2 - 40;
    const total = purchases.reduce((s, p) => s + p.currentValue, 0);

    const segs = purchases.map((p, i) => ({
      label: p.date || 'Purchase ' + (i + 1),
      value: p.currentValue,
      color: colors[i % colors.length],
    }));

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
          ctx.stroke();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();

      const legendY = displaySize - 8;
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      const legendItems = segs.filter(s => s.value > 0);
      const totalW = legendItems.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (legendItems.length - 1) * 20;
      let legendX = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, legendX + 16, legendY + 2);
        legendX += 16 + ctx.measureText(item.label).width + 20;
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

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
