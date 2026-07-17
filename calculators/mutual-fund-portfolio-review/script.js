document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mfReviewForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalInvested = document.getElementById('resultTotalInvested');
  const resultTotalCurrent = document.getElementById('resultTotalCurrent');
  const resultGainLoss = document.getElementById('resultGainLoss');
  const resultOverallReturn = document.getElementById('resultOverallReturn');
  const resultBestPerformer = document.getElementById('resultBestPerformer');
  const resultWorstPerformer = document.getElementById('resultWorstPerformer');
  const mfBody = document.getElementById('mfBody');
  const chartCanvas = document.getElementById('mfReviewChart');

  const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const funds = [];
    for (let i = 1; i <= 5; i++) {
      const name = document.getElementById('fundName' + i).value || 'Fund ' + i;
      const invested = parseFloat(document.getElementById('fundInvested' + i).value) || 0;
      const current = parseFloat(document.getElementById('fundCurrent' + i).value) || 0;
      funds.push({ name, invested, current });
    }

    if (funds.every(f => f.invested <= 0)) {
      alert('Please enter valid invested amounts.');
      return;
    }

    const totalInv = funds.reduce((s, f) => s + f.invested, 0);
    const totalCur = funds.reduce((s, f) => s + f.current, 0);
    const totalGain = totalCur - totalInv;
    const overallRet = totalInv > 0 ? (totalGain / totalInv) * 100 : 0;

    const fundReturns = funds.map(f => ({
      ...f,
      ret: f.invested > 0 ? ((f.current - f.invested) / f.invested) * 100 : 0,
      gain: f.current - f.invested,
    }));

    const best = fundReturns.reduce((a, b) => a.ret > b.ret ? a : b);
    const worst = fundReturns.reduce((a, b) => a.ret < b.ret ? a : b);

    resultTotalInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInv));
    resultTotalCurrent.textContent = '\u20B9 ' + formatNumber(Math.round(totalCur));
    resultGainLoss.textContent = (totalGain >= 0 ? '\u20B9 ' : '-\u20B9 ') + formatNumber(Math.round(Math.abs(totalGain)));
    resultGainLoss.className = 'value ' + (totalGain >= 0 ? 'success' : 'danger');
    resultOverallReturn.textContent = overallRet.toFixed(2) + '%';
    resultOverallReturn.className = 'value ' + (overallRet >= 0 ? 'success' : 'danger');
    resultBestPerformer.textContent = best.name + ' (' + best.ret.toFixed(2) + '%)';
    resultWorstPerformer.textContent = worst.name + ' (' + worst.ret.toFixed(2) + '%)';

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

    ctx.clearRect(0, 0, displaySize, displaySize);

    let startAngle = -Math.PI / 2;
    funds.forEach((f, i) => {
      const sliceAngle = (f.current / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += sliceAngle;
    });

    const legendY = displaySize - 8;
    let legendX = 10;
    funds.forEach((f, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(f.name, legendX + 16, legendY + 2);
      legendX += ctx.measureText(f.name).width + 28;
      if (legendX > displaySize - 30) legendX = 10;
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});