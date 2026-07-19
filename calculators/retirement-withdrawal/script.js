document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('retireWithdrawForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultYearsLasts = document.getElementById('resultYearsLasts');
  const resultDepleteAge = document.getElementById('resultDepleteAge');
  const resultTotalWithdrawn = document.getElementById('resultTotalWithdrawn');
  const resultTotalReturns = document.getElementById('resultTotalReturns');
  const resultSuccessRate = document.getElementById('resultSuccessRate');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('retireWithdrawChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const corpus = parseFloat(document.getElementById('retireCorpus').value);
    let withdrawal = parseFloat(document.getElementById('annualWithdrawal').value);
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
    const inflation = parseFloat(document.getElementById('inflation').value);
    const lifeExp = parseFloat(document.getElementById('lifeExpectancy').value);
    const retireAge = parseFloat(document.getElementById('retireAge').value);

    if (!corpus || !withdrawal || !expectedReturn || !inflation || !lifeExp || !retireAge || corpus <= 0 || withdrawal <= 0 || expectedReturn <= 0 || inflation < 0 || lifeExp <= 0 || retireAge <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r = expectedReturn / 100;
    const infl = inflation / 100;

    let balance = corpus;
    let totalWithdrawn = 0;
    let totalReturns = 0;
    let years = 0;
    const schedule = [];

    for (let age = retireAge; age <= lifeExp; age++) {
      years++;
      const startBalance = balance;
      const withdrawAmt = withdrawal * Math.pow(1 + infl, years - 1);
      const returns = (balance - withdrawAmt) * r;
      if (returns < 0) {
        schedule.push({
          year: years, age, start: Math.round(startBalance),
          withdrawal: Math.round(Math.min(withdrawAmt, balance)),
          returns: 0, end: 0,
        });
        totalWithdrawn += Math.min(withdrawAmt, balance);
        balance = 0;
        break;
      }
      balance = (balance - withdrawAmt) * (1 + r);
      totalWithdrawn += withdrawAmt;
      totalReturns += returns;

      schedule.push({
        year: years, age, start: Math.round(startBalance),
        withdrawal: Math.round(withdrawAmt),
        returns: Math.round(returns),
        end: Math.round(Math.max(0, balance)),
      });

      if (balance <= 0) break;
    }

    if (balance > 0) {
      years = lifeExp - retireAge + 1;
    }

    const depleteAge = retireAge + years - 1;
    const successRate = (withdrawal * 25 <= corpus) ? 100 : Math.round((corpus / (withdrawal * 25)) * 100);

    resultYearsLasts.textContent = years + ' yrs';
    resultDepleteAge.textContent = Math.min(depleteAge, lifeExp) + ' yrs';
    resultTotalWithdrawn.textContent = '\u20B9 ' + formatNumber(Math.round(totalWithdrawn));
    resultTotalReturns.textContent = '\u20B9 ' + formatNumber(Math.round(totalReturns));
    resultSuccessRate.textContent = successRate + '%';

    renderSchedule(schedule);
    drawChart(schedule, retireAge);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${r.age}</td>
        <td class="text-right">${formatNumber(r.start)}</td>
        <td class="text-right">${formatNumber(r.withdrawal)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.end)}</td>
      </tr>
    `).join('');
  }

  function drawChart(schedule, startAge) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 600;
    const displayWidth = Math.min(600, containerWidth);
    const displayHeight = 300;
    chartCanvas.width = displayWidth * dpr;
    chartCanvas.height = displayHeight * dpr;
    chartCanvas.style.width = displayWidth + 'px';
    chartCanvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);

    const pad = { top: 20, bottom: 40, left: 60, right: 20 };
    const chartW = displayWidth - pad.left - pad.right;
    const chartH = displayHeight - pad.top - pad.bottom;

    const balances = schedule.map(r => r.end);
    const maxVal = Math.max(schedule[0]?.start || 0, ...balances) * 1.1;

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    ctx.strokeStyle = '#005c8e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const regions = [];
    balances.forEach((v, i) => {
      const x = pad.left + (i / (balances.length - 1 || 1)) * chartW;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      regions.push({
        type: 'point', x, y, r: 10,
        label: 'Age ' + (startAge + i),
        value: '₹ ' + formatNumber(Math.round(v)), color: '#005c8e',
      });
    });
    ctx.stroke();
    ChartTooltip.bind(chartCanvas, regions);

    ctx.fillStyle = '#191c1e';
    ctx.font = '12px -apple-system, sans-serif';
    for (let i = 0; i < balances.length; i += Math.max(1, Math.floor(balances.length / 6))) {
      const x = pad.left + (i / (balances.length - 1 || 1)) * chartW;
      ctx.fillText(startAge + i, x - 10, displayHeight - 8);
    }

    for (let v = 0; v <= maxVal; v += maxVal / 5) {
      const y = pad.top + chartH - (v / maxVal) * chartH;
      ctx.fillText('\u20B9' + formatNumber(Math.round(v)), 2, y + 4);
      ctx.strokeStyle = '#dce1e4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#005c8e';
    ctx.fillRect(10, 6, 12, 12);
    ctx.fillStyle = '#191c1e';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Remaining Corpus', 26, 16);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
