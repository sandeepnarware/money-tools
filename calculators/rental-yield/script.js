document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rentalForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultAnnualRent = document.getElementById('resultAnnualRent');
  const resultAnnualExpenses = document.getElementById('resultAnnualExpenses');
  const resultGrossYield = document.getElementById('resultGrossYield');
  const resultNetYield = document.getElementById('resultNetYield');
  const chartCanvas = document.getElementById('rentalChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const price = parseFloat(document.getElementById('propertyPrice').value);
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
    const vacancy = parseFloat(document.getElementById('vacancyMonths').value);
    const propTax = parseFloat(document.getElementById('propertyTax').value);
    const maintenance = parseFloat(document.getElementById('maintenance').value);
    const insurance = parseFloat(document.getElementById('insurance').value);
    const mgmtFee = parseFloat(document.getElementById('mgmtFee').value);

    if (!price || !monthlyRent || price <= 0 || monthlyRent <= 0) {
      alert('Please enter valid positive values for property price and monthly rent.');
      return;
    }

    const annualRent = monthlyRent * (12 - vacancy);
    const annualExpenses = propTax + maintenance + insurance + mgmtFee;
    const netAnnualIncome = annualRent - annualExpenses;

    const grossYield = (annualRent / price) * 100;
    const netYield = (netAnnualIncome / price) * 100;

    resultAnnualRent.textContent = '\u20B9 ' + formatNumber(Math.round(annualRent));
    resultAnnualExpenses.textContent = '\u20B9 ' + formatNumber(Math.round(annualExpenses));
    resultGrossYield.textContent = grossYield.toFixed(2) + '%';
    resultNetYield.textContent = netYield.toFixed(2) + '%';

    drawChart(grossYield, netYield);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(gross, net) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);
    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displaySize, displaySize);

    const padding = { top: 30, right: 20, bottom: 50, left: 60 };
    const chartW = displaySize - padding.left - padding.right;
    const chartH = displaySize - padding.top - padding.bottom;

    const items = [
      { label: 'Gross Yield', value: gross, color: '#2563eb' },
      { label: 'Net Yield', value: net, color: '#16a34a' },
    ];

    const maxVal = Math.max(gross, net, 4) * 1.4;
    const barWidth = chartW * 0.25;
    const gap = (chartW - barWidth * items.length) / (items.length + 1);

    function getY(val) { return padding.top + chartH - (val / maxVal) * chartH; }

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
      ctx.fillText(val.toFixed(1) + '%', padding.left - 8, y + 4);
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    items.forEach((item, i) => {
      const x = padding.left + gap + i * (gap + barWidth);
      const h = (item.value / maxVal) * chartH;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, getY(item.value), barWidth, h);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px -apple-system, sans-serif';
      ctx.fillText(item.value.toFixed(2) + '%', x + barWidth / 2, getY(item.value) - 8);

      ctx.fillStyle = '#64748b';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, padding.top + chartH + 16);
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
