document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fiTrackerForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultNetWorth = document.getElementById('resultNetWorth');
  const resultFiNumber = document.getElementById('resultFiNumber');
  const resultProgress = document.getElementById('resultProgress');
  const resultMonthlyIncome = document.getElementById('resultMonthlyIncome');
  const resultYearsToFi = document.getElementById('resultYearsToFi');
  const resultProjectedNw = document.getElementById('resultProjectedNw');
  const chartCanvas = document.getElementById('fiTrackerChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const netWorth = parseFloat(document.getElementById('currentNetWorth').value);
    const monthlySavings = parseFloat(document.getElementById('monthlySavings').value);
    const expenses = parseFloat(document.getElementById('annualExpenses').value);
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
    const withdrawalRate = parseFloat(document.getElementById('withdrawalRate').value);
    const targetFiAge = parseFloat(document.getElementById('targetFiAge').value);

    if (!currentAge || !netWorth || !monthlySavings || !expenses || !expectedReturn || !withdrawalRate || currentAge <= 0 || netWorth < 0 || monthlySavings < 0 || expenses <= 0 || expectedReturn <= 0 || withdrawalRate <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const fiNumber = expenses / (withdrawalRate / 100);
    const progress = Math.min(100, (netWorth / fiNumber) * 100);
    const monthlyIncome = netWorth * (expectedReturn / 100) / 12;

    const r = expectedReturn / 100;
    const C = netWorth;
    const s = monthlySavings * 12;
    const F = fiNumber;

    let yearsToFi;
    if (F * r + s <= C * r + s) {
      yearsToFi = 0;
    } else {
      yearsToFi = Math.log((F * r + s) / (C * r + s)) / Math.log(1 + r);
    }

    let projectedNw = netWorth;
    if (targetFiAge && targetFiAge > currentAge) {
      const targetYears = targetFiAge - currentAge;
      for (let y = 1; y <= targetYears; y++) {
        const annualSave = monthlySavings * 12;
        projectedNw = (projectedNw + annualSave) * (1 + r);
      }
    } else {
      projectedNw = netWorth;
    }

    resultNetWorth.textContent = '\u20B9 ' + formatNumber(Math.round(netWorth));
    resultFiNumber.textContent = '\u20B9 ' + formatNumber(Math.round(fiNumber));
    resultProgress.textContent = progress.toFixed(1) + '%';
    resultMonthlyIncome.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyIncome));
    resultYearsToFi.textContent = Math.ceil(yearsToFi) + ' yrs';
    resultProjectedNw.textContent = '\u20B9 ' + formatNumber(Math.round(projectedNw));

    drawGauge(progress);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawGauge(progress) {
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
    const cy = displaySize / 2 + 10;
    const radius = displaySize / 2 - 20;
    const lineWidth = 24;

    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;
    const progAngle = startAngle + (progress / 100) * totalAngle;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, displaySize, displaySize);
    gradient.addColorStop(0, '#ba1a1a');
    gradient.addColorStop(0.5, '#d97706');
    gradient.addColorStop(1, '#00652c');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, progAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.fillStyle = '#191c1e';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(progress.toFixed(1) + '%', cx, cy + 8);

    ctx.fillStyle = '#545f73';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('FI Progress', cx, cy + 28);

    const legendY = displaySize - 6;
    ctx.fillStyle = '#545f73';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('0%', 10, legendY);
    ctx.textAlign = 'right';
    ctx.fillText('100%', displaySize - 10, legendY);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
