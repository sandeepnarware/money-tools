document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('retirementCorpusForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultMonthlyExpense = document.getElementById('resultMonthlyExpense');
  const resultAnnualExpense = document.getElementById('resultAnnualExpense');
  const resultCorpusRequired = document.getElementById('resultCorpusRequired');
  const resultProjected = document.getElementById('resultProjected');
  const resultGap = document.getElementById('resultGap');
  const resultGapLabel = document.getElementById('resultGapLabel');
  const resultPension = document.getElementById('resultPension');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('retirementChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const retirementAge = parseFloat(document.getElementById('retirementAge').value);
    const currentExpenses = parseFloat(document.getElementById('currentExpenses').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const monthlySavings = parseFloat(document.getElementById('monthlySavings').value);
    const ret = parseFloat(document.getElementById('expectedReturn').value);
    const infl = parseFloat(document.getElementById('inflationRate').value);
    const lifeExpectancy = parseFloat(document.getElementById('lifeExpectancy').value);

    if (!currentAge || !retirementAge || !currentExpenses || !ret || !infl || !lifeExpectancy) {
      alert('Please enter valid values.');
      return;
    }

    const yearsToRetire = retirementAge - currentAge;
    if (yearsToRetire <= 0) {
      alert('Retirement age must be greater than current age.');
      return;
    }

    const monthlyExpenseAtRetirement = currentExpenses * Math.pow(1 + infl / 100, yearsToRetire);
    const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;
    const corpusRequired = annualExpenseAtRetirement / 0.04;

    const fvCurrent = currentSavings * Math.pow(1 + ret / 100, yearsToRetire);
    const r = ret / 12 / 100;
    const n = yearsToRetire * 12;
    const fvMonthly = monthlySavings * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const projected = fvCurrent + fvMonthly;

    const gap = corpusRequired - projected;
    const gapAbs = Math.abs(gap);

    resultMonthlyExpense.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyExpenseAtRetirement));
    resultAnnualExpense.textContent = '\u20B9 ' + formatNumber(Math.round(annualExpenseAtRetirement));
    resultCorpusRequired.textContent = '\u20B9 ' + formatNumber(Math.round(corpusRequired));
    resultProjected.textContent = '\u20B9 ' + formatNumber(Math.round(projected));

    if (gap > 0) {
      resultGapLabel.textContent = 'Shortfall';
      resultGap.className = 'value danger';
    } else {
      resultGapLabel.textContent = 'Surplus';
      resultGap.className = 'value success';
    }
    resultGap.textContent = '\u20B9 ' + formatNumber(Math.round(gapAbs));

    const pensionMonthly = (projected * 0.04) / 12;
    resultPension.textContent = '\u20B9 ' + formatNumber(Math.round(pensionMonthly));

    const schedule = buildYearlySchedule(currentAge, retirementAge, currentSavings, monthlySavings, ret);
    renderSchedule(schedule);
    drawChart(projected, gap > 0 ? gap : 0);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildYearlySchedule(startAge, retireAge, currSavings, monthlySavings, ret) {
    const rows = [];
    const years = retireAge - startAge;
    const monthlyRate = ret / 12 / 100;

    for (let year = 1; year <= years; year++) {
      const months = year * 12;
      const fvC = currSavings * Math.pow(1 + ret / 100, year);
      const fvM = monthlySavings * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
      const corpus = fvC + fvM;
      const annualSavings = monthlySavings * 12;
      const prevCorpus = year > 1 ? rows[year - 2].corpus : 0;
      const growth = corpus - prevCorpus - annualSavings;

      rows.push({
        year,
        age: startAge + year,
        growth: Math.round(growth),
        annualSavings: Math.round(annualSavings),
        corpus: Math.round(corpus),
      });
    }

    return rows;
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td>${r.age}</td>
        <td class="text-right">${formatNumber(r.growth)}</td>
        <td class="text-right">${formatNumber(r.annualSavings)}</td>
        <td class="text-right">${formatNumber(r.corpus)}</td>
      </tr>
    `).join('');
  }

  function drawChart(projected, shortfall) {
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
    const total = projected + shortfall;

    ctx.clearRect(0, 0, displaySize, displaySize);

    if (shortfall > 0) {
      const shortAngle = (shortfall / total) * Math.PI * 2;
      const projAngle = (projected / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + projAngle);
      ctx.closePath();
      ctx.fillStyle = '#16a34a';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, -Math.PI / 2 + projAngle, -Math.PI / 2 + projAngle + shortAngle);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = '#16a34a';
      ctx.fill();
    }

    const legendY = displaySize - 6;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Projected Corpus', 26, legendY + 2);

    if (shortfall > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(140, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Shortfall', 156, legendY + 2);
    }
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
