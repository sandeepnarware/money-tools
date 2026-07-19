document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('colForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('incomeIndia').value);
    const rentInd = parseFloat(document.getElementById('rentIndia').value);
    const grocInd = parseFloat(document.getElementById('groceriesIndia').value);
    const transpInd = parseFloat(document.getElementById('transportIndia').value);
    const rentTgt = parseFloat(document.getElementById('rentTarget').value);
    const grocTgt = parseFloat(document.getElementById('groceriesTarget').value);
    const transpTgt = parseFloat(document.getElementById('transportTarget').value);

    if (!income || income <= 0) { alert('Please enter valid income.'); return; }

    const indiaCost = rentInd + grocInd + transpInd;
    const targetCost = rentTgt + grocTgt + transpTgt;
    const index = indiaCost > 0 ? targetCost / indiaCost : 0;
    const incomeNeeded = income * index;
    const surplus = income - incomeNeeded;

    document.getElementById('resultCostIndia').innerHTML = '&#8377; ' + formatNumber(Math.round(indiaCost));
    document.getElementById('resultCostTarget').innerHTML = '&#8377; ' + formatNumber(Math.round(targetCost));
    document.getElementById('resultCOLI').textContent = index.toFixed(2) + 'x';
    document.getElementById('resultIncomeNeeded').innerHTML = '&#8377; ' + formatNumber(Math.round(incomeNeeded));
    const surplusEl = document.getElementById('resultSurplus');
    surplusEl.innerHTML = '&#8377; ' + formatNumber(Math.round(Math.abs(surplus)));
    surplusEl.className = 'value';
    if (surplus >= 0) {
      surplusEl.textContent = 'Surplus of ' + surplusEl.textContent;
    } else {
      surplusEl.textContent = 'Deficit of ' + surplusEl.textContent;
      surplusEl.className = 'value danger';
    }

    drawChart(indiaCost, targetCost);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(india, target) {
    const ctx = document.getElementById('colChart').getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = ctx.canvas.parentElement.clientWidth || 500;
    const displaySize = Math.min(300, containerWidth);
    ctx.canvas.width = displaySize * dpr;
    ctx.canvas.height = displaySize * dpr;
    ctx.canvas.style.width = displaySize + 'px';
    ctx.canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const bars = [
      { label: 'India', value: india, color: '#005c8e' },
      { label: 'Target', value: target, color: '#d97706' },
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

      ctx.fillStyle = '#191c1e';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bar.label, x + barW / 2, displaySize - padding.bottom + 14);

      ctx.fillStyle = '#191c1e';
      ctx.font = 'bold 10px -apple-system, sans-serif';
      ctx.fillText('₹' + formatNumber(Math.round(bar.value)), x + barW / 2, y - 4);
    });

    const regions = bars.map((bar, i) => {
      const x = padding.left + i * (barW + gap) + gap / 2;
      const barH = (bar.value / maxVal) * chartH;
      const y = padding.top + chartH - barH;
      return {
        type: 'rect', x, y, w: barW, h: barH,
        label: bar.label, value: '₹ ' + formatNumber(Math.round(bar.value)), color: bar.color,
      };
    });
    ChartTooltip.bind(ctx.canvas, regions);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
