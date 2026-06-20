document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inflationForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultDuration = document.getElementById('resultDuration');
  const resultPastPrice = document.getElementById('resultPastPrice');
  const resultCurrentPrice = document.getElementById('resultCurrentPrice');
  const resultInflationRate = document.getElementById('resultInflationRate');
  const chartCanvas = document.getElementById('inflationChart');

  document.getElementById('currentYear').value = new Date().getFullYear();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const pastYear = parseInt(document.getElementById('pastYear').value);
    const currentYear = parseInt(document.getElementById('currentYear').value);
    const pastPrice = parseFloat(document.getElementById('pastPrice').value);
    const currentPrice = parseFloat(document.getElementById('currentPrice').value);

    if (!pastYear || !currentYear || !pastPrice || !currentPrice ||
        pastPrice <= 0 || currentPrice <= 0 || pastYear >= currentYear) {
      alert('Please enter valid values. Past year must be before current year, and prices must be positive.');
      return;
    }

    const years = currentYear - pastYear;
    const priceIncrease = currentPrice - pastPrice;
    const priceIncreasePct = (priceIncrease / pastPrice) * 100;
    const inflationRate = (Math.pow(currentPrice / pastPrice, 1 / years) - 1) * 100;

    resultDuration.textContent = pastYear + ' \u2013 ' + currentYear + ' (' + years + ' yrs)';
    resultPastPrice.textContent = '\u20B9 ' + formatNumber(Math.round(pastPrice * 100) / 100);
    resultCurrentPrice.textContent = '\u20B9 ' + formatNumber(Math.round(currentPrice * 100) / 100);
    resultInflationRate.textContent = inflationRate.toFixed(2) + '%';

    drawChart(pastPrice, currentPrice, years, inflationRate);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(pastPrice, currentPrice, years, inflationRate) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = Math.round(displayW * 0.55);
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const padding = { top: 24, right: 20, bottom: 50, left: 64 };
    const chartW = displayW - padding.left - padding.right;
    const chartH = displayH - padding.top - padding.bottom;

    const maxVal = Math.max(pastPrice, currentPrice) * 1.2;
    const barWidth = chartW * 0.25;
    const gap = (chartW - barWidth * 2) / 3;

    function getY(val) {
      return padding.top + chartH - (val / maxVal) * chartH;
    }

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const ySteps = 5;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px -apple-system, sans-serif';
    for (let i = 0; i <= ySteps; i++) {
      const val = (maxVal / ySteps) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText('\u20B9 ' + formatNumber(Math.round(val)), padding.left - 8, y + 4);
    }

    // Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    // Past Price bar
    const x1 = padding.left + gap + barWidth * 0;
    const h1 = (pastPrice / maxVal) * chartH;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x1, getY(pastPrice), barWidth, h1);

    // Current Price bar
    const x2 = padding.left + gap * 2 + barWidth;
    const h2 = (currentPrice / maxVal) * chartH;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x2, getY(currentPrice), barWidth, h2);

    // Value labels on top of bars
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillText('\u20B9 ' + formatNumber(Math.round(pastPrice)), x1 + barWidth / 2, getY(pastPrice) - 8);
    ctx.fillText('\u20B9 ' + formatNumber(Math.round(currentPrice)), x2 + barWidth / 2, getY(currentPrice) - 8);

    // X-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText('Past Price', x1 + barWidth / 2, padding.top + chartH + 16);
    ctx.fillText('Current Price', x2 + barWidth / 2, padding.top + chartH + 16);

    // Info text below labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillText(years + ' years ago', x1 + barWidth / 2, padding.top + chartH + 30);
    ctx.fillText('Today', x2 + barWidth / 2, padding.top + chartH + 30);

    // CAGR label
    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 14px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CAGR Inflation: ' + inflationRate.toFixed(2) + '%', padding.left, 16);
  }

  function formatNumber(num) {
    if (Number.isInteger(num)) return num.toLocaleString('en-IN');
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  calculate();
});
