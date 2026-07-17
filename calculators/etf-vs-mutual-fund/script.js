document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('etfvsMfForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultMfFinal = document.getElementById('resultMfFinal');
  const resultEtfFinal = document.getElementById('resultEtfFinal');
  const resultEtfDiff = document.getElementById('resultEtfDiff');
  const resultMfCost = document.getElementById('resultMfCost');
  const resultEtfCost = document.getElementById('resultEtfCost');
  const resultBetterEtf = document.getElementById('resultBetterEtf');
  const chartCanvas = document.getElementById('etfvsMfChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('etfAmount').value);
    const mfExp = parseFloat(document.getElementById('mfExpense').value);
    const etfExp = parseFloat(document.getElementById('etfExpense').value);
    const mktRet = parseFloat(document.getElementById('marketReturn').value);
    const years = parseFloat(document.getElementById('etfPeriod').value);
    const brokerage = parseFloat(document.getElementById('etfBrokerage').value);

    if (!P || !mfExp || !etfExp || !mktRet || !years || P <= 0 || mktRet <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const mfFinal = P * Math.pow(1 + (mktRet - mfExp) / 100, years);
    const etfFinal = P * Math.pow(1 + (mktRet - etfExp) / 100, years) - (brokerage || 0);
    const diff = mfFinal - etfFinal;
    const mfTotalCost = mfExp > 0 ? P * (Math.pow(1 + (mktRet) / 100, years) - mfFinal / P) : 0;
    const etfTotalCost = P * (Math.pow(1 + mktRet / 100, years) - (etfFinal + brokerage) / P) + brokerage;
    const better = mfFinal >= etfFinal ? 'Mutual Fund' : 'ETF';

    resultMfFinal.textContent = '\u20B9 ' + formatNumber(Math.round(mfFinal));
    resultEtfFinal.textContent = '\u20B9 ' + formatNumber(Math.round(etfFinal));
    resultEtfDiff.textContent = (diff >= 0 ? '\u20B9 ' : '-\u20B9 ') + formatNumber(Math.round(Math.abs(diff)));
    resultMfCost.textContent = '\u20B9 ' + formatNumber(Math.round(mfTotalCost));
    resultEtfCost.textContent = '\u20B9 ' + formatNumber(Math.round(etfTotalCost));
    resultBetterEtf.textContent = better;

    drawChart('Mutual Fund', mfFinal, 'ETF', etfFinal, '#2563eb', '#16a34a');
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

    ctx.fillStyle = '#1e293b';
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