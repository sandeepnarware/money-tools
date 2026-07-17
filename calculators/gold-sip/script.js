document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goldSipForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultInvested = document.getElementById('resultGoldInvested');
  const resultGrams = document.getElementById('resultGoldGrams');
  const resultFinal = document.getElementById('resultGoldFinal');
  const resultReturns = document.getElementById('resultGoldReturns');
  const scheduleBody = document.getElementById('goldScheduleBody');
  const chartCanvas = document.getElementById('goldSipChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('goldMonthly').value);
    const goldPrice = parseFloat(document.getElementById('goldPrice').value);
    const annualRate = parseFloat(document.getElementById('goldReturn').value);
    const years = parseFloat(document.getElementById('goldPeriod').value);

    if (!P || !goldPrice || !annualRate || !years || P <= 0 || goldPrice <= 0 || annualRate <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const n = years * 12;
    const r = annualRate / 12 / 100;

    const fv = P * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const totalInvestment = P * n;
    const estimatedReturns = fv - totalInvestment;
    const totalGrams = totalInvestment / goldPrice;

    resultInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvestment));
    resultGrams.textContent = formatNumber(Math.round(totalGrams * 100) / 100) + ' g';
    resultFinal.textContent = '\u20B9 ' + formatNumber(Math.round(fv));
    resultReturns.textContent = '\u20B9 ' + formatNumber(Math.round(estimatedReturns));

    const schedule = buildSchedule(P, r, years, goldPrice);
    renderSchedule(schedule);
    drawChart(totalInvestment, estimatedReturns);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildSchedule(monthlyInv, monthlyRate, years, goldPrice) {
    const rows = [];
    for (let year = 1; year <= years; year++) {
      const months = year * 12;
      const totalInv = monthlyInv * months;
      const corpus = monthlyInv * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
      const grams = totalInv / goldPrice;
      rows.push({
        year,
        investment: Math.round(totalInv),
        grams: Math.round(grams * 100) / 100,
        value: Math.round(corpus),
      });
    }
    return rows;
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.investment)}</td>
        <td class="text-right">${formatNumber(r.grams)} g</td>
        <td class="text-right">${formatNumber(r.value)}</td>
      </tr>
    `).join('');
  }

  function drawChart(invested, returns) {
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
    const total = invested + returns;

    const invAngle = (invested / total) * Math.PI * 2;
    const retAngle = (returns / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + invAngle);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + invAngle, -Math.PI / 2 + invAngle + retAngle);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Invested', 26, legendY + 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(100, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Returns', 116, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});