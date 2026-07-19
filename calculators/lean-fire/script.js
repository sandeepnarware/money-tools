document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('leanFireForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultFireCorpus = document.getElementById('resultFireCorpus');
  const resultCurrentSavings = document.getElementById('resultCurrentSavings');
  const resultMonthlySavings = document.getElementById('resultMonthlySavings');
  const resultYearsToFire = document.getElementById('resultYearsToFire');
  const resultAgeAtFire = document.getElementById('resultAgeAtFire');
  const resultCorpusAtFire = document.getElementById('resultCorpusAtFire');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('leanFireChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const monthlySavings = parseFloat(document.getElementById('monthlySavings').value);
    const expenses = parseFloat(document.getElementById('currentExpenses').value);
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
    const withdrawalRate = parseFloat(document.getElementById('withdrawalRate').value);
    const inflation = parseFloat(document.getElementById('inflation').value);

    if (!currentAge || !currentSavings || !monthlySavings || !expenses || !expectedReturn || !withdrawalRate || !inflation) {
      alert('Please enter valid values.');
      return;
    }

    const r = expectedReturn / 100;
    const wr = withdrawalRate / 100;
    const fireNum = expenses / wr;
    const annualSavings = monthlySavings * 12;
    const s = annualSavings;
    const C = currentSavings;
    const F = fireNum;

    let yearsToFire;
    if (F * r + s <= C * r + s) {
      yearsToFire = 0;
    } else {
      yearsToFire = Math.log((F * r + s) / (C * r + s)) / Math.log(1 + r);
    }

    const yearsRounded = Math.ceil(yearsToFire);
    const ageAtFire = currentAge + yearsRounded;

    let corpusAtFire = currentSavings;
    let totalSavings = currentSavings;
    let totalReturns = 0;

    const schedule = [];
    for (let y = 1; y <= yearsRounded; y++) {
      const annualSave = monthlySavings * 12;
      totalSavings += annualSave;
      const returns = (corpusAtFire + annualSave / 2) * r;
      totalReturns += returns;
      corpusAtFire = corpusAtFire + annualSave + returns;

      schedule.push({
        year: y,
        age: currentAge + y,
        opening: y === 1 ? Math.round(currentSavings) : Math.round(schedule[y - 2].closing),
        savings: Math.round(annualSave),
        returns: Math.round(returns),
        closing: Math.round(corpusAtFire),
      });
    }

    resultFireCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(fireNum));
    resultCurrentSavings.textContent = '\u20B9 ' + formatNumber(Math.round(currentSavings));
    resultMonthlySavings.textContent = '\u20B9 ' + formatNumber(Math.round(monthlySavings));
    resultYearsToFire.textContent = yearsRounded + ' yrs';
    resultAgeAtFire.textContent = ageAtFire + ' yrs';
    resultCorpusAtFire.textContent = '\u20B9 ' + formatNumber(Math.round(corpusAtFire));

    renderSchedule(schedule);
    drawChart(schedule, fireNum, currentAge);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${r.age}</td>
        <td class="text-right">${formatNumber(r.opening)}</td>
        <td class="text-right">${formatNumber(r.savings)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.closing)}</td>
      </tr>
    `).join('');
  }

  function drawChart(schedule, fireNum, startAge) {
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

    const values = schedule.map(r => r.closing);
    const maxVal = Math.max(fireNum, ...values) * 1.1;

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    ctx.strokeStyle = '#ba1a1a';
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    const fireY = pad.top + chartH - (fireNum / maxVal) * chartH;
    ctx.moveTo(pad.left, fireY);
    ctx.lineTo(pad.left + chartW, fireY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ba1a1a';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('FIRE Target', pad.left + chartW - 80, fireY - 4);

    ctx.strokeStyle = '#005c8e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = pad.left + (i / (values.length - 1 || 1)) * chartW;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#191c1e';
    ctx.font = '12px -apple-system, sans-serif';
    for (let i = 0; i < values.length; i += Math.max(1, Math.floor(values.length / 6))) {
      const x = pad.left + (i / (values.length - 1 || 1)) * chartW;
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
    ctx.fillText('Portfolio Growth', 26, 16);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
