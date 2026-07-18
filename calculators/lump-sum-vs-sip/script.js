document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lumpsumVsSipForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultLsInvested = document.getElementById('resultLsInvested');
  const resultLsLumpsum = document.getElementById('resultLsLumpsum');
  const resultLsSip = document.getElementById('resultLsSip');
  const resultLsLumpsumRet = document.getElementById('resultLsLumpsumRet');
  const resultLsSipRet = document.getElementById('resultLsSipRet');
  const resultLsBetter = document.getElementById('resultLsBetter');
  const chartCanvas = document.getElementById('lumpsumVsSipChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const totalAmt = parseFloat(document.getElementById('lsTotal').value);
    const years = parseFloat(document.getElementById('lsPeriod').value);
    const ret = parseFloat(document.getElementById('lsReturn').value);

    if (isNaN(totalAmt) || totalAmt <= 0 || isNaN(years) || years <= 0 || isNaN(ret) || ret <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const monthly = totalAmt / (years * 12);
    const lumpsumFV = totalAmt * Math.pow(1 + ret / 100, years);

    const r_m = ret / 12 / 100;
    const n = years * 12;
    const sipFV = monthly * (Math.pow(1 + r_m, n) - 1) / r_m * (1 + r_m);

    const lumpsumRet = lumpsumFV - totalAmt;
    const sipRet = sipFV - totalAmt;
    const diff = lumpsumFV - sipFV;
    const better = lumpsumFV >= sipFV ? 'Lump Sum' : 'SIP';

    resultLsInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalAmt));
    resultLsLumpsum.textContent = '\u20B9 ' + formatNumber(Math.round(lumpsumFV));
    resultLsSip.textContent = '\u20B9 ' + formatNumber(Math.round(sipFV));
    resultLsLumpsumRet.textContent = '\u20B9 ' + formatNumber(Math.round(lumpsumRet));
    resultLsSipRet.textContent = '\u20B9 ' + formatNumber(Math.round(sipRet));
    resultLsBetter.textContent = better;

    drawChart('Lump Sum', lumpsumFV, 'SIP', sipFV, '#2563eb', '#16a34a');
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