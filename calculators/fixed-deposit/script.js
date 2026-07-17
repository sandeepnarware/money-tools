document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fdForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultInvested = document.getElementById('resultInvested');
  const resultInterest = document.getElementById('resultInterest');
  const resultMaturity = document.getElementById('resultMaturity');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('fdChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('depositAmount').value);
    let rate = parseFloat(document.getElementById('interestRate').value);
    const years = parseFloat(document.getElementById('tenure').value);
    const compounding = document.getElementById('compounding').value;
    const senior = document.getElementById('seniorCitizen').checked;

    if (!P || !rate || !years || P <= 0 || rate <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    if (senior) rate += 0.5;

    let maturity, schedule;
    if (compounding === 'yearly') {
      maturity = P * Math.pow(1 + rate / 100, years);
      schedule = buildScheduleYearly(P, rate, years);
    } else if (compounding === 'quarterly') {
      maturity = P * Math.pow(1 + rate / 400, 4 * years);
      schedule = buildSchedule(P, rate, years, 4);
    } else {
      maturity = P * Math.pow(1 + rate / 1200, 12 * years);
      schedule = buildSchedule(P, rate, years, 12);
    }

    const interest = maturity - P;

    resultInvested.textContent = '\u20B9 ' + formatNumber(Math.round(P));
    resultInterest.textContent = '\u20B9 ' + formatNumber(Math.round(interest));
    resultMaturity.textContent = '\u20B9 ' + formatNumber(Math.round(maturity));

    renderSchedule(schedule);
    drawChart(P, interest);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildScheduleYearly(P, rate, years) {
    const rows = [];
    for (let y = 1; y <= years; y++) {
      const amount = P * Math.pow(1 + rate / 100, y);
      const interest = amount - P;
      rows.push({
        year: y,
        principal: Math.round(P),
        interest: Math.round(interest),
        maturity: Math.round(amount),
      });
    }
    return rows;
  }

  function buildSchedule(P, rate, years, n) {
    const rows = [];
    const rPerPeriod = rate / 100 / n;
    for (let y = 1; y <= years; y++) {
      const amount = P * Math.pow(1 + rPerPeriod, n * y);
      const interest = amount - P;
      rows.push({
        year: y,
        principal: Math.round(P),
        interest: Math.round(interest),
        maturity: Math.round(amount),
      });
    }
    return rows;
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.principal)}</td>
        <td class="text-right">${formatNumber(r.interest)}</td>
        <td class="text-right">${formatNumber(r.maturity)}</td>
      </tr>
    `).join('');
  }

  function drawChart(principal, interest) {
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
    const total = principal + interest;

    const invAngle = (principal / total) * Math.PI * 2;
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
    ctx.fillText('Principal', 26, legendY + 2);

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
