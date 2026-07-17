document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inflCountriesForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const amount = parseFloat(document.getElementById('currentAmount').value);
    const indiaInfl = parseFloat(document.getElementById('indiaInflation').value);
    const usaInfl = parseFloat(document.getElementById('usaInflation').value);
    const ukInfl = parseFloat(document.getElementById('ukInflation').value);
    const years = parseFloat(document.getElementById('periodYears').value);

    if (!amount || amount <= 0) { alert('Please enter valid amount.'); return; }
    if (!years || years <= 0) { alert('Please enter valid period.'); return; }

    const fvIndia = amount / Math.pow(1 + indiaInfl / 100, years);
    const fvUSA = amount / Math.pow(1 + usaInfl / 100, years);
    const fvUK = amount / Math.pow(1 + ukInfl / 100, years);

    const lossIndia = amount - fvIndia;
    const lossUSA = amount - fvUSA;
    const lossUK = amount - fvUK;

    document.getElementById('resultFVIndia').innerHTML = '&#8377; ' + formatNumber(Math.round(fvIndia));
    document.getElementById('resultFVUSA').innerHTML = '&#8377; ' + formatNumber(Math.round(fvUSA));
    document.getElementById('resultFVUK').innerHTML = '&#8377; ' + formatNumber(Math.round(fvUK));
    document.getElementById('resultLossIndia').textContent = '₹' + formatNumber(Math.round(lossIndia)) + ' (' + ((lossIndia / amount) * 100).toFixed(1) + '%)';
    document.getElementById('resultLossUSA').textContent = '₹' + formatNumber(Math.round(lossUSA)) + ' (' + ((lossUSA / amount) * 100).toFixed(1) + '%)';
    document.getElementById('resultLossUK').textContent = '₹' + formatNumber(Math.round(lossUK)) + ' (' + ((lossUK / amount) * 100).toFixed(1) + '%)';

    drawChart(fvIndia, fvUSA, fvUK);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(india, usa, uk) {
    const ctx = document.getElementById('inflCountriesChart').getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = ctx.canvas.parentElement.clientWidth || 500;
    const displaySize = Math.min(300, containerWidth);
    ctx.canvas.width = displaySize * dpr;
    ctx.canvas.height = displaySize * dpr;
    ctx.canvas.style.width = displaySize + 'px';
    ctx.canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const bars = [
      { label: 'India', value: india, color: '#2563eb' },
      { label: 'USA', value: usa, color: '#16a34a' },
      { label: 'UK', value: uk, color: '#f59e0b' },
    ];
    const padding = { top: 20, bottom: 40, left: 50, right: 20 };
    const chartW = displaySize - padding.left - padding.right;
    const chartH = displaySize - padding.top - padding.bottom;
    const maxVal = Math.max(...bars.map(b => b.value), 1);

    ctx.clearRect(0, 0, displaySize, displaySize);
    const barW = chartW / bars.length * 0.6;
    const gap = chartW / bars.length * 0.4;

    bars.forEach((bar, i) => {
      const x = padding.left + i * (barW + gap) + gap / 2;
      const barH = (bar.value / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      ctx.fillStyle = bar.color;
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = '#1e293b';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bar.label, x + barW / 2, displaySize - padding.bottom + 14);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px -apple-system, sans-serif';
      ctx.fillText('₹' + formatNumber(Math.round(bar.value)), x + barW / 2, y - 4);
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
