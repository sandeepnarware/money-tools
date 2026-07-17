document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('portAllocForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotal = document.getElementById('resultTotal');
  const resultEquity = document.getElementById('resultEquity');
  const resultDebt = document.getElementById('resultDebt');
  const resultGold = document.getElementById('resultGold');
  const resultRealEstate = document.getElementById('resultRealEstate');
  const resultCash = document.getElementById('resultCash');
  const allocBody = document.getElementById('allocBody');
  const chartCanvas = document.getElementById('portAllocChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const equity = parseFloat(document.getElementById('allocEquity').value) || 0;
    const debt = parseFloat(document.getElementById('allocDebt').value) || 0;
    const gold = parseFloat(document.getElementById('allocGold').value) || 0;
    const realEstate = parseFloat(document.getElementById('allocRealEstate').value) || 0;
    const cash = parseFloat(document.getElementById('allocCash').value) || 0;

    if (equity + debt + gold + realEstate + cash <= 0) {
      alert('Please enter at least one positive value.');
      return;
    }

    const total = equity + debt + gold + realEstate + cash;
    const ePct = (equity / total) * 100;
    const dPct = (debt / total) * 100;
    const gPct = (gold / total) * 100;
    const rPct = (realEstate / total) * 100;
    const cPct = (cash / total) * 100;

    resultTotal.textContent = '\u20B9 ' + formatNumber(Math.round(total));
    resultEquity.textContent = ePct.toFixed(1) + '%';
    resultDebt.textContent = dPct.toFixed(1) + '%';
    resultGold.textContent = gPct.toFixed(1) + '%';
    resultRealEstate.textContent = rPct.toFixed(1) + '%';
    resultCash.textContent = cPct.toFixed(1) + '%';

    const assets = [
      { name: 'Equity', amount: equity, pct: ePct, color: '#2563eb' },
      { name: 'Debt', amount: debt, pct: dPct, color: '#16a34a' },
      { name: 'Gold', amount: gold, pct: gPct, color: '#f59e0b' },
      { name: 'Real Estate', amount: realEstate, pct: rPct, color: '#ef4444' },
      { name: 'Cash', amount: cash, pct: cPct, color: '#8b5cf6' },
    ];

    allocBody.innerHTML = assets.map(a => `
      <tr>
        <td>${a.name}</td>
        <td class="text-right">${formatNumber(Math.round(a.amount))}</td>
        <td class="text-right">${a.pct.toFixed(1)}%</td>
        <td class="text-right">-</td>
      </tr>
    `).join('');

    drawChart(assets);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(data) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 400;
    const displaySize = Math.min(400, containerWidth);
    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const radius = displaySize / 2 - 40;
    const total = data.reduce((s, d) => s + d.amount, 0);

    ctx.clearRect(0, 0, displaySize, displaySize);

    let startAngle = -Math.PI / 2;
    data.forEach(d => {
      const sliceAngle = (d.amount / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    const legendY = displaySize - 8;
    let legendX = 10;
    data.forEach(d => {
      ctx.fillStyle = d.color;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(d.name, legendX + 16, legendY + 2);
      legendX += ctx.measureText(d.name).width + 30;
      if (legendX > displaySize - 40) { legendX = 10; }
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});