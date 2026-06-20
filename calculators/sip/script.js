document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sipForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultInvested = document.getElementById('resultInvested');
  const resultReturns = document.getElementById('resultReturns');
  const resultTotal = document.getElementById('resultTotal');
  const resultInflAdj = document.getElementById('resultInflAdj');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('sipChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('monthlyInvestment').value);
    const annualRate = parseFloat(document.getElementById('expectedReturn').value);
    const years = parseFloat(document.getElementById('investmentPeriod').value);
    const annualInflation = parseFloat(document.getElementById('inflationRate').value);

    if (!P || !annualRate || !years || P <= 0 || annualRate <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const n = years * 12;
    const r = annualRate / 12 / 100;

    const fv = P * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const totalInvestment = P * n;
    const estimatedReturns = fv - totalInvestment;
    const inflAdj = fv / Math.pow(1 + annualInflation / 100, years);

    resultInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvestment));
    resultReturns.textContent = '\u20B9 ' + formatNumber(Math.round(estimatedReturns));
    resultTotal.textContent = '\u20B9 ' + formatNumber(Math.round(fv));
    resultInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(inflAdj));

    const schedule = buildYearlySchedule(P, r, n, annualInflation);
    renderSchedule(schedule);
    drawChart(totalInvestment, estimatedReturns);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildYearlySchedule(monthlyInv, monthlyRate, totalMonths, annualInflation) {
    const rows = [];

    for (let year = 1; year <= totalMonths / 12; year++) {
      const months = year * 12;
      const totalInvested = monthlyInv * months;
      const corpus = monthlyInv * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
      const returns = corpus - totalInvested;
      const inflAdj = corpus / Math.pow(1 + annualInflation / 100, year);

      rows.push({
        year,
        investment: Math.round(totalInvested),
        returns: Math.round(returns),
        corpus: Math.round(corpus),
        inflAdj: Math.round(inflAdj),
      });
    }

    return rows;
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.investment)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.corpus)}</td>
        <td class="text-right">${formatNumber(r.inflAdj)}</td>
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
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Invested', 26, legendY + 2);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(100, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Returns', 116, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
