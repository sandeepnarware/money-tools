document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('currencyForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultFromAmt = document.getElementById('resultFromAmt');
  const resultRate = document.getElementById('resultRate');
  const resultConverted = document.getElementById('resultConverted');
  const resultUpdated = document.getElementById('resultUpdated');
  const chartCanvas = document.getElementById('currencyChart');

  const rates = {
    INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.83, AUD: 0.018, CAD: 0.016, SGD: 0.016, AED: 0.044 },
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const amount = parseFloat(document.getElementById('convAmount').value);
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    let rate;
    if (from === 'INR') {
      rate = rates.INR[to];
      if (to === 'INR') rate = 1;
    } else if (to === 'INR') {
      rate = 1 / (rates.INR[from] || 1);
    } else {
      const inrAmount = amount / (rates.INR[from] || 1);
      const convertedAmt = inrAmount * (rates.INR[to] || 1);
      rate = convertedAmt / amount;
    }

    if (!rate || rate <= 0) {
      alert('Conversion rate not available for selected pair.');
      return;
    }

    const converted = amount * rate;

    const sym = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3', JPY: '\u00A5', AUD: 'A$', CAD: 'C$', SGD: 'S$', AED: 'AED' };

    resultFromAmt.textContent = (sym[from] || '') + ' ' + formatNumber(Math.round(amount));
    resultRate.textContent = rate.toFixed(4);
    resultConverted.textContent = (sym[to] || '') + ' ' + formatNumber(Math.round(converted));
    resultUpdated.textContent = 'Rates as of 2026';

    drawChart(0, converted, from, to);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(amt, converted, from, to) {
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
    const radius = displaySize / 2 - 30;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(to, cx, cy);

    const legendY = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(to + ' (' + formatNumber(Math.round(converted)) + ')', 26, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});