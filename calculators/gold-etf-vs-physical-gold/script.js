document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goldVsPhysicalForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultGvEtfVal = document.getElementById('resultGvEtfVal');
  const resultGvPhysicalVal = document.getElementById('resultGvPhysicalVal');
  const resultGvDiff = document.getElementById('resultGvDiff');
  const resultGvEtfRet = document.getElementById('resultGvEtfRet');
  const resultGvPhysicalRet = document.getElementById('resultGvPhysicalRet');
  const resultGvBetter = document.getElementById('resultGvBetter');
  const chartCanvas = document.getElementById('goldVsPhysicalChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('gvAmount').value);
    const years = parseFloat(document.getElementById('gvPeriod').value);
    const ret = parseFloat(document.getElementById('gvReturn').value);
    const expense = parseFloat(document.getElementById('gvExpense').value);
    const making = parseFloat(document.getElementById('gvMaking').value);
    const selling = parseFloat(document.getElementById('gvSelling').value);

    if (isNaN(P) || P <= 0 || isNaN(years) || years <= 0 || isNaN(ret) || ret <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const etfFinal = P * Math.pow(1 + (ret - expense) / 100, years);
    const buyCost = P * (1 + making / 100);
    const finalVal = buyCost * Math.pow(1 + ret / 100, years);
    const physicalFinal = finalVal * (1 - selling / 100);
    const diff = etfFinal - physicalFinal;
    const etfRet = etfFinal - P;
    const physicalRet = physicalFinal - P;
    const better = etfFinal >= physicalFinal ? 'Gold ETF' : 'Physical Gold';

    resultGvEtfVal.textContent = '\u20B9 ' + formatNumber(Math.round(etfFinal));
    resultGvPhysicalVal.textContent = '\u20B9 ' + formatNumber(Math.round(physicalFinal));
    resultGvDiff.textContent = (diff >= 0 ? '\u20B9 ' : '-\u20B9 ') + formatNumber(Math.round(Math.abs(diff)));
    resultGvEtfRet.textContent = '\u20B9 ' + formatNumber(Math.round(etfRet));
    resultGvPhysicalRet.textContent = '\u20B9 ' + formatNumber(Math.round(physicalRet));
    resultGvBetter.textContent = better;

    drawChart('Gold ETF', etfFinal, 'Physical Gold', physicalFinal, '#d97706', '#b45309');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(label1, val1, label2, val2, color1, color2) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayWidth = Math.min(500, containerWidth);
    const displayHeight = 260;
    chartCanvas.width = displayWidth * dpr;
    chartCanvas.height = displayHeight * dpr;
    chartCanvas.style.width = displayWidth + 'px';
    chartCanvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const maxVal = Math.max(val1, val2);
    const barWidth = displayWidth * 0.25;
    const gap = displayWidth * 0.1;
    const startX = (displayWidth - barWidth * 2 - gap) / 2;
    const bottomY = displayHeight - 40;
    const chartH = bottomY - 40;

    const h1 = maxVal > 0 ? (val1 / maxVal) * chartH : 0;
    const h2 = maxVal > 0 ? (val2 / maxVal) * chartH : 0;

    ctx.fillStyle = color1;
    ctx.fillRect(startX, bottomY - h1, barWidth, h1);
    ctx.fillStyle = color2;
    ctx.fillRect(startX + barWidth + gap, bottomY - h2, barWidth, h2);

    ctx.fillStyle = '#191c1e';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formatNumber(Math.round(val1)), startX + barWidth / 2, bottomY - h1 - 8);
    ctx.fillText(formatNumber(Math.round(val2)), startX + barWidth + gap + barWidth / 2, bottomY - h2 - 8);

    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(label1, startX + barWidth / 2, bottomY + 18);
    ctx.fillText(label2, startX + barWidth + gap + barWidth / 2, bottomY + 18);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});