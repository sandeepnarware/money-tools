document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pensionForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultCorpusAtRetire = document.getElementById('resultCorpusAtRetire');
  const resultMonthlyPension = document.getElementById('resultMonthlyPension');
  const resultInflAdjPension = document.getElementById('resultInflAdjPension');
  const resultTotalSavings = document.getElementById('resultTotalSavings');
  const resultReturnsEarned = document.getElementById('resultReturnsEarned');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('pensionChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const retireAge = parseFloat(document.getElementById('retireAge').value);
    const lifeExp = parseFloat(document.getElementById('lifeExpectancy').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const monthlySavings = parseFloat(document.getElementById('monthlySavings').value);
    const annualReturn = parseFloat(document.getElementById('expectedReturn').value);
    const inflation = parseFloat(document.getElementById('inflationRate').value);

    if (!currentAge || !retireAge || !lifeExp || !annualReturn || !inflation || currentAge <= 0 || retireAge <= 0 || lifeExp <= 0 || annualReturn <= 0 || inflation <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    if (retireAge <= currentAge) {
      alert('Retirement age must be greater than current age.');
      return;
    }

    const yearsToRetire = retireAge - currentAge;
    const r = annualReturn / 12 / 100;
    const n = yearsToRetire * 12;

    const fvCurrent = currentSavings * Math.pow(1 + annualReturn / 100, yearsToRetire);
    const fvMonthly = monthlySavings * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const corpus = fvCurrent + fvMonthly;

    const monthlyPension = corpus * 0.04 / 12;
    const inflAdjPension = monthlyPension / Math.pow(1 + inflation / 100, yearsToRetire);

    const totalSavingsAmt = currentSavings + monthlySavings * n;
    const returnsEarned = corpus - totalSavingsAmt;

    resultCorpusAtRetire.textContent = '\u20B9 ' + formatNumber(Math.round(corpus));
    resultMonthlyPension.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyPension));
    resultInflAdjPension.textContent = '\u20B9 ' + formatNumber(Math.round(inflAdjPension));
    resultTotalSavings.textContent = '\u20B9 ' + formatNumber(Math.round(totalSavingsAmt));
    resultReturnsEarned.textContent = '\u20B9 ' + formatNumber(Math.round(returnsEarned));

    const schedule = buildYearlySchedule(currentSavings, monthlySavings, annualReturn, yearsToRetire);
    renderSchedule(schedule);
    drawChart(totalSavingsAmt, returnsEarned);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildYearlySchedule(currentSavings, monthlySavings, annualReturn, yearsToRetire) {
    const rows = [];
    const annualRate = annualReturn / 100;
    let opening = currentSavings;
    let totalSavingsAccum = currentSavings;

    for (let year = 1; year <= yearsToRetire; year++) {
      const annualSave = monthlySavings * 12;
      totalSavingsAccum += annualSave;
      const returns = (opening + annualSave / 2) * annualRate;
      const closing = opening + annualSave + returns;

      rows.push({
        year: year,
        opening: Math.round(opening),
        savings: Math.round(annualSave),
        returns: Math.round(returns),
        closing: Math.round(closing),
      });

      opening = closing;
    }

    return rows;
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.opening)}</td>
        <td class="text-right">${formatNumber(r.savings)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.closing)}</td>
      </tr>
    `).join('');
  }

  function drawChart(savings, returns) {
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
    const total = savings + returns;

    const savAngle = (savings / total) * Math.PI * 2;
    const retAngle = (returns / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + savAngle);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + savAngle, -Math.PI / 2 + savAngle + retAngle);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Savings', 26, legendY + 2);

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
