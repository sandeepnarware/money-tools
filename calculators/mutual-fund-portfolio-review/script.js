document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mfReviewForm');
  const resultsSection = document.getElementById('resultsSection');
  const fundRows = document.getElementById('fundRows');
  const addFundBtn = document.getElementById('addFundBtn');

  const resultTotalInvested = document.getElementById('resultTotalInvested');
  const resultTotalCurrent = document.getElementById('resultTotalCurrent');
  const resultGainLoss = document.getElementById('resultGainLoss');
  const resultOverallReturn = document.getElementById('resultOverallReturn');
  const resultBestPerformer = document.getElementById('resultBestPerformer');
  const resultWorstPerformer = document.getElementById('resultWorstPerformer');
  const mfBody = document.getElementById('mfBody');
  const chartCanvas = document.getElementById('mfReviewChart');

  const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  document.querySelectorAll('.remove-fund-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.fund-row').remove());
  });

  addFundBtn.addEventListener('click', () => {
    const n = fundRows.children.length + 1;
    const row = document.createElement('div');
    row.className = 'form-row fund-row';
    row.innerHTML = `
      <div class="form-group">
        <label>Fund Name</label>
        <input type="text" class="fund-name" value="Fund ${n}">
      </div>
      <div class="form-group">
        <label>Invested</label>
        <div class="input-wrapper">
          <input type="number" class="fund-invested" required min="0" step="1000" value="10000">
          <span class="suffix">&#8377;</span>
        </div>
      </div>
      <div class="form-group">
        <label>Current Value</label>
        <div class="input-wrapper">
          <input type="number" class="fund-current" required min="0" step="1000" value="10000">
          <span class="suffix">&#8377;</span>
        </div>
      </div>
      <div style="display:flex; align-items:end; margin-bottom:12px;">
        <button type="button" class="btn btn-secondary remove-fund-btn" style="font-size:0.75rem; padding:6px 10px;">&times; Remove</button>
      </div>`;
    row.querySelector('.remove-fund-btn').addEventListener('click', () => row.remove());
    fundRows.appendChild(row);
  });

  function getFunds() {
    const rows = fundRows.querySelectorAll('.fund-row');
    return Array.from(rows).map(row => {
      const name = row.querySelector('.fund-name').value || 'Fund';
      const invested = parseFloat(row.querySelector('.fund-invested').value) || 0;
      const current = parseFloat(row.querySelector('.fund-current').value) || 0;
      return { name, invested, current };
    });
  }

  // CSV Upload
  const csvUpload = document.getElementById('csvUpload');
  const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');

  downloadTemplateBtn.addEventListener('click', () => {
    const csvContent = 'Fund Name,Invested Amount,Current Value\nAxis Bluechip Fund,100000,120000\nMirae Asset Large Cap,50000,55000\nSBI Small Cap,30000,35000\nHDFC Mid-Cap,40000,38000\nICICI Prudential Value,25000,30000';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mutual-fund-portfolio-template.csv';
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
        const name = cols[0];
        const invested = parseFloat(cols[1].replace(/[^\d.-]/g, '')) || 0;
        const current = parseFloat(cols[2].replace(/[^\d.-]/g, '')) || 0;
        if (invested > 0 || current > 0) {
          parsed.push({ name, invested, current });
        }
      }
      if (parsed.length === 0) {
        alert('No valid fund data found in CSV.');
        return;
      }
      // Populate form rows
      fundRows.innerHTML = '';
      parsed.forEach((fund, i) => {
        const row = document.createElement('div');
        row.className = 'form-row fund-row';
        row.innerHTML = `
          <div class="form-group">
            <label>Fund Name</label>
            <input type="text" class="fund-name" value="${fund.name}">
          </div>
          <div class="form-group">
            <label>Invested</label>
            <div class="input-wrapper">
              <input type="number" class="fund-invested" required min="0" step="1000" value="${fund.invested}">
              <span class="suffix">&#8377;</span>
            </div>
          </div>
          <div class="form-group">
            <label>Current Value</label>
            <div class="input-wrapper">
              <input type="number" class="fund-current" required min="0" step="1000" value="${fund.current}">
              <span class="suffix">&#8377;</span>
            </div>
          </div>
          <div style="display:flex; align-items:end; margin-bottom:12px;">
            <button type="button" class="btn btn-secondary remove-fund-btn" style="font-size:0.75rem; padding:6px 10px;">&times; Remove</button>
          </div>`;
        row.querySelector('.remove-fund-btn').addEventListener('click', () => row.remove());
        fundRows.appendChild(row);
      });
      calculate();
    };
    reader.readAsText(file);
  });

  function calculate() {
    const funds = getFunds();
    const filtered = funds.filter(f => f.invested > 0 || f.current > 0);
    if (filtered.length === 0) {
      alert('Please enter at least one valid fund.');
      return;
    }

    const totalInv = filtered.reduce((s, f) => s + f.invested, 0);
    const totalCur = filtered.reduce((s, f) => s + f.current, 0);
    const totalGain = totalCur - totalInv;
    const overallRet = totalInv > 0 ? (totalGain / totalInv) * 100 : 0;

    const fundReturns = filtered.map(f => ({
      ...f,
      ret: f.invested > 0 ? ((f.current - f.invested) / f.invested) * 100 : 0,
      gain: f.current - f.invested,
    }));

    if (fundReturns.length === 0) {
      resultBestPerformer.textContent = '-';
      resultWorstPerformer.textContent = '-';
    } else {
      const best = fundReturns.reduce((a, b) => a.ret > b.ret ? a : b);
      const worst = fundReturns.reduce((a, b) => a.ret < b.ret ? a : b);
      resultBestPerformer.textContent = best.name + ' (' + best.ret.toFixed(2) + '%)';
      resultWorstPerformer.textContent = worst.name + ' (' + worst.ret.toFixed(2) + '%)';
    }

    resultTotalInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInv));
    resultTotalCurrent.textContent = '\u20B9 ' + formatNumber(Math.round(totalCur));
    resultGainLoss.textContent = (totalGain >= 0 ? '\u20B9 ' : '-\u20B9 ') + formatNumber(Math.round(Math.abs(totalGain)));
    resultGainLoss.className = 'value ' + (totalGain >= 0 ? 'success' : 'danger');
    resultOverallReturn.textContent = overallRet.toFixed(2) + '%';
    resultOverallReturn.className = 'value ' + (overallRet >= 0 ? 'success' : 'danger');

    mfBody.innerHTML = fundReturns.map((f, i) => `
      <tr>
        <td>${f.name}</td>
        <td class="text-right">${formatNumber(Math.round(f.invested))}</td>
        <td class="text-right">${formatNumber(Math.round(f.current))}</td>
        <td class="text-right" style="color:${f.ret >= 0 ? '#16a34a' : '#dc2626'}">${f.ret.toFixed(2)}%</td>
        <td class="text-right" style="color:${f.gain >= 0 ? '#16a34a' : '#dc2626'}">${f.gain >= 0 ? '+' : ''}${formatNumber(Math.round(f.gain))}</td>
      </tr>
    `).join('');

    drawChart(fundReturns);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(funds) {
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
    const total = funds.reduce((s, f) => s + f.current, 0);

    const segs = funds.map((f, i) => ({ label: f.name, value: f.current, color: colors[i % colors.length] }));

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();

      const legendY = displaySize - 8;
      let legendX = 10;
      segs.forEach((seg, i) => {
        ctx.fillStyle = seg.color;
        ctx.fillRect(legendX, legendY - 10, 12, 12);
        ctx.fillStyle = '#1e293b';
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(seg.label, legendX + 16, legendY + 2);
        legendX += ctx.measureText(seg.label).width + 28;
        if (legendX > displaySize - 30) legendX = 10;
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
