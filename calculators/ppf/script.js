document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ppfForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultInvested = document.getElementById('resultInvested');
  const resultInterest = document.getElementById('resultInterest');
  const resultMaturity = document.getElementById('resultMaturity');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('ppfChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const annualInvestment = parseFloat(document.getElementById('annualInvestment').value);
    const currentBalance = parseFloat(document.getElementById('currentBalance').value);
    const years = parseFloat(document.getElementById('yearsRemaining').value);
    const rate = parseFloat(document.getElementById('expectedRate').value);

    if (!annualInvestment || !years || !rate || annualInvestment <= 0 || rate <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    let opening = currentBalance;
    let totalInvested = 0;
    let totalInterest = 0;
    const schedule = [];

    for (let y = 1; y <= years; y++) {
      const contribution = Math.min(annualInvestment, 150000);
      const interest = (opening + contribution / 2) * (rate / 100);
      const closing = opening + contribution + interest;
      totalInvested += contribution;
      totalInterest += interest;

      schedule.push({
        year: y,
        opening: Math.round(opening),
        investment: Math.round(contribution),
        interest: Math.round(interest),
        closing: Math.round(closing),
      });

      opening = closing;
    }

    const maturity = schedule[schedule.length - 1].closing;

    resultInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvested));
    resultInterest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));
    resultMaturity.textContent = '\u20B9 ' + formatNumber(Math.round(maturity));

    renderSchedule(schedule);
    drawChart(totalInvested, totalInterest);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.opening)}</td>
        <td class="text-right">${formatNumber(r.investment)}</td>
        <td class="text-right">${formatNumber(r.interest)}</td>
        <td class="text-right">${formatNumber(r.closing)}</td>
      </tr>
    `).join('');
  }

  function drawChart(invested, interest) {
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
    const total = invested + interest;

    const invAngle = (invested / total) * Math.PI * 2;
    const retAngle = (interest / total) * Math.PI * 2;

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
    ctx.fillText('Interest', 116, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
