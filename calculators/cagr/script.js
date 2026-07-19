document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cagrForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultInitial = document.getElementById('resultInitial');
  const resultFinal = document.getElementById('resultFinal');
  const resultTotalReturn = document.getElementById('resultTotalReturn');
  const resultCagr = document.getElementById('resultCagr');
  const growthBody = document.getElementById('growthBody');
  const chartCanvas = document.getElementById('cagrChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const initial = parseFloat(document.getElementById('initialValue').value);
    const final = parseFloat(document.getElementById('finalValue').value);
    const years = parseFloat(document.getElementById('timePeriod').value);

    if (!initial || !final || !years || initial <= 0 || final <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    if (final <= initial) {
      alert('Final value must be greater than initial value.');
      return;
    }

    const cagr = Math.pow(final / initial, 1 / years) - 1;
    const totalReturn = (final - initial) / initial;
    const cagrPct = cagr * 100;
    const totalReturnPct = totalReturn * 100;

    resultInitial.textContent = '\u20B9 ' + formatNumber(Math.round(initial));
    resultFinal.textContent = '\u20B9 ' + formatNumber(Math.round(final));
    resultTotalReturn.textContent = totalReturnPct.toFixed(2) + '%';
    resultCagr.textContent = cagrPct.toFixed(2) + '%';

    const schedule = buildYearlySchedule(initial, cagr, years);
    renderSchedule(schedule);
    drawChart(schedule);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildYearlySchedule(initial, cagr, years) {
    const rows = [];
    const fullYears = Math.ceil(years);
    for (let y = 0; y <= fullYears; y++) {
      const t = Math.min(y, years);
      const value = initial * Math.pow(1 + cagr, t);
      const cumulativeReturn = (value - initial) / initial * 100;
      const annualReturn = y === 0 ? 0 : ((value / (initial * Math.pow(1 + cagr, y - 1))) - 1) * 100;
      rows.push({
        year: y,
        value: Math.round(value),
        annualReturn: annualReturn.toFixed(2),
        cumulativeReturn: cumulativeReturn.toFixed(2),
      });
    }
    return rows;
  }

  function renderSchedule(schedule) {
    growthBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year === 0 ? 'Start' : r.year}</td>
        <td class="text-right">${formatNumber(r.value)}</td>
        <td class="text-right">${r.year === 0 ? '—' : r.annualReturn + '%'}</td>
        <td class="text-right">${r.year === 0 ? '—' : r.cumulativeReturn + '%'}</td>
      </tr>
    `).join('');
  }

  function drawChart(schedule) {
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

    const padding = { top: 24, right: 20, bottom: 50, left: 64 };
    const chartW = displaySize - padding.left - padding.right;
    const chartH = displaySize - padding.top - padding.bottom;

    const values = schedule.map(r => r.value);
    const labels = schedule.map(r => r.year === 0 ? '0' : String(r.year));
    const maxVal = Math.max(...values) * 1.15;
    const minVal = 0;

    function getY(val) { return padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH; }

    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = 1;
    const ySteps = 5;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#545f73';
    ctx.font = '10px -apple-system, sans-serif';
    for (let i = 0; i <= ySteps; i++) {
      const val = minVal + ((maxVal - minVal) / ySteps) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(abbreviateNumber(val), padding.left - 8, y + 4);
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    const barW = Math.max(4, Math.min(20, (chartW / values.length) * 0.6));
    const gap = (chartW - barW * values.length) / (values.length + 1);

    ctx.beginPath();
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, '#2075ae');
    gradient.addColorStop(1, '#94ccff');
    ctx.fillStyle = gradient;

    values.forEach((val, i) => {
      const x = padding.left + gap + i * (gap + barW);
      const h = ((val - minVal) / (maxVal - minVal)) * chartH;
      ctx.fillRect(x, getY(val), barW, h);
    });

    ctx.beginPath();
    ctx.strokeStyle = '#005c8e';
    ctx.lineWidth = 2;
    values.forEach((val, i) => {
      const x = padding.left + gap + i * (gap + barW) + barW / 2;
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#005c8e';
    values.forEach((val, i) => {
      const x = padding.left + gap + i * (gap + barW) + barW / 2;
      const y = getY(val);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#545f73';
    ctx.font = '10px -apple-system, sans-serif';
    labels.forEach((label, i) => {
      const x = padding.left + gap + i * (gap + barW) + barW / 2;
      ctx.fillText(label, x, padding.top + chartH + 16);
    });
  }

  function abbreviateNumber(num) {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
