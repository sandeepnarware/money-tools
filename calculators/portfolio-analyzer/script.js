document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('portfolioForm');
  const resultsSection = document.getElementById('resultsSection');
  const chartCanvas = document.getElementById('portfolioChart');

  const resultTotal = document.getElementById('resultPortfolioTotal');
  const resultInvested = document.getElementById('resultInvested');
  const resultReturns = document.getElementById('resultReturns');
  const resultWeightedRet = document.getElementById('resultWeightedRet');
  const resultEquityPct = document.getElementById('resultEquityPct');
  const resultDebtPct = document.getElementById('resultDebtPct');
  const resultOtherPct = document.getElementById('resultOtherPct');
  const assetBody = document.getElementById('assetBody');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const equityAmt = parseFloat(document.getElementById('equityAmt').value) || 0;
    const equityRet = parseFloat(document.getElementById('equityRet').value) || 0;
    const debtAmt = parseFloat(document.getElementById('debtAmt').value) || 0;
    const debtRet = parseFloat(document.getElementById('debtRet').value) || 0;
    const goldAmt = parseFloat(document.getElementById('goldAmt').value) || 0;
    const goldRet = parseFloat(document.getElementById('goldRet').value) || 0;
    const reAmt = parseFloat(document.getElementById('reAmt').value) || 0;
    const reRet = parseFloat(document.getElementById('reRet').value) || 0;
    const cashAmt = parseFloat(document.getElementById('cashAmt').value) || 0;
    const cashRet = parseFloat(document.getElementById('cashRet').value) || 0;

    if (equityAmt + debtAmt + goldAmt + reAmt + cashAmt === 0) {
      alert('Please enter at least one investment amount.');
      return;
    }

    const assets = [
      { name: 'Equity', invested: equityAmt, retRate: equityRet, color: '#2563eb' },
      { name: 'Debt', invested: debtAmt, retRate: debtRet, color: '#16a34a' },
      { name: 'Gold', invested: goldAmt, retRate: goldRet, color: '#f59e0b' },
      { name: 'Real Estate', invested: reAmt, retRate: reRet, color: '#ef4444' },
      { name: 'Cash / FD', invested: cashAmt, retRate: cashRet, color: '#8b5cf6' },
    ];

    const computed = assets.map(a => {
      const returns = a.invested * a.retRate / 100;
      const total = a.invested + returns;
      return { ...a, returns, total };
    });

    const totalInvested = computed.reduce((s, a) => s + a.invested, 0);
    const totalPortfolio = computed.reduce((s, a) => s + a.total, 0);
    const totalReturns = totalPortfolio - totalInvested;
    const weightedAvgRet = computed.reduce((s, a) => s + a.invested * a.retRate, 0) / totalInvested;

    const equityPct = (equityAmt / totalInvested) * 100;
    const debtPct = (debtAmt / totalInvested) * 100;
    const otherPct = ((goldAmt + reAmt + cashAmt) / totalInvested) * 100;

    resultTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalPortfolio));
    resultInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvested));
    resultReturns.textContent = '\u20B9 ' + formatNumber(Math.round(totalReturns));
    resultWeightedRet.textContent = weightedAvgRet.toFixed(2) + '%';
    resultEquityPct.textContent = equityPct.toFixed(1) + '%';
    resultDebtPct.textContent = debtPct.toFixed(1) + '%';
    resultOtherPct.textContent = otherPct.toFixed(1) + '%';

    drawDonut(computed.map(a => ({ label: a.name, value: a.invested, color: a.color })));

    assetBody.innerHTML = computed.map(a => `
      <tr>
        <td>${a.name}</td>
        <td class="text-right">${formatNumber(Math.round(a.invested))}</td>
        <td class="text-right">${formatNumber(Math.round(a.returns))}</td>
        <td class="text-right">${formatNumber(Math.round(a.total))}</td>
        <td class="text-right">${a.retRate}%</td>
        <td class="text-right">${(a.invested / totalInvested * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawDonut(data) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);

    const cols = data.length > 8 ? 3 : 2;
    const legendRows = Math.ceil(data.length / cols);
    const legendSpace = legendRows * 16 + 10;

    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = (displaySize - legendSpace) / 2 + 10;
    const radius = Math.min(displaySize / 2 - 20, cy - 20);
    const innerRadius = radius * 0.7;

    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath();
          ctx.arc(cx, cy, radius, currentStart, end);
          ctx.arc(cx, cy, innerRadius, end, currentStart, true);
          ctx.closePath();
          ctx.fillStyle = d.color;
          ctx.fill();
        }
        currentStart = segEnd;
      });

      const colW = displaySize / cols;
      data.forEach((d, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * colW + 6;
        const y = displaySize - (legendRows - row) * 16 + 4;
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y - 7, 8, 8);
        ctx.fillStyle = '#1e293b';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillText(d.label, x + 12, y + 1);
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
