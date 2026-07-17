document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stepUpSipForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultInvested = document.getElementById('resultInvested');
  const resultReturns = document.getElementById('resultReturns');
  const resultTotal = document.getElementById('resultTotal');
  const resultFinalSip = document.getElementById('resultFinalSip');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('stepUpSipChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('monthlyInvestment').value);
    const stepUp = parseFloat(document.getElementById('stepUpRate').value);
    const annualRate = parseFloat(document.getElementById('expectedReturn').value);
    const years = parseFloat(document.getElementById('investmentPeriod').value);

    if (!P || !stepUp || !annualRate || !years || P <= 0 || annualRate <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r = annualRate / 100;
    let totalInvestment = 0;
    let totalCorpus = 0;
    const schedule = [];

    for (let i = 0; i < years; i++) {
      const monthlyContrib = P * Math.pow(1 + stepUp / 100, i);
      const yearlyContrib = monthlyContrib * 12;
      const remainingYears = years - i;
      const fv = yearlyContrib * Math.pow(1 + r, remainingYears);
      totalInvestment += yearlyContrib;
      totalCorpus += fv;

      schedule.push({
        year: i + 1,
        monthlySip: Math.round(monthlyContrib),
        investment: Math.round(totalInvestment),
        returns: Math.round(totalCorpus - totalInvestment),
        corpus: Math.round(totalCorpus),
      });
    }

    const estimatedReturns = totalCorpus - totalInvestment;
    const finalMonthlySip = P * Math.pow(1 + stepUp / 100, years - 1);

    resultInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvestment));
    resultReturns.textContent = '\u20B9 ' + formatNumber(Math.round(estimatedReturns));
    resultTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalCorpus));
    resultFinalSip.textContent = '\u20B9 ' + formatNumber(Math.round(finalMonthlySip));

    renderSchedule(schedule);
    drawChart(totalInvestment, estimatedReturns);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.monthlySip)}</td>
        <td class="text-right">${formatNumber(r.investment)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.corpus)}</td>
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
