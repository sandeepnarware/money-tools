document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('divYieldForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultYield = document.getElementById('resultYield');
  const resultIncome = document.getElementById('resultIncome');
  const resultInvestment = document.getElementById('resultInvestment');
  const resultYieldCost = document.getElementById('resultYieldCost');
  const chartCanvas = document.getElementById('divYieldChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const stockPrice = parseFloat(document.getElementById('stockPrice').value);
    const annualDividend = parseFloat(document.getElementById('annualDividend').value);
    const shares = parseFloat(document.getElementById('shares').value);
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);

    if (!stockPrice || !annualDividend || !shares || stockPrice <= 0 || annualDividend <= 0 || shares <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const divYield = (annualDividend / stockPrice) * 100;
    const annualIncome = annualDividend * shares;
    const totalInvestment = stockPrice * shares;
    const yieldOnCost = purchasePrice > 0 ? (annualDividend / purchasePrice) * 100 : 0;

    resultYield.textContent = divYield.toFixed(2) + '%';
    resultIncome.textContent = '\u20B9 ' + formatNumber(Math.round(annualIncome));
    resultInvestment.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvestment));
    resultYieldCost.textContent = yieldOnCost > 0 ? yieldOnCost.toFixed(2) + '%' : '-';

    drawChart(annualIncome, totalInvestment - annualIncome);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(income, appreciation) {
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
    const radius = displaySize / 2 - 20;
    const total = income + appreciation;

    const incAngle = (income / total) * Math.PI * 2;
    const appAngle = (appreciation / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + incAngle);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + incAngle, -Math.PI / 2 + incAngle + appAngle);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Dividend Income', 26, legendY + 2);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(140, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Price Appreciation', 156, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});