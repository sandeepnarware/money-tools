document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inflRetireForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultYear1Expenses = document.getElementById('resultYear1Expenses');
  const resultFinalYearExpenses = document.getElementById('resultFinalYearExpenses');
  const resultTotalExpenses = document.getElementById('resultTotalExpenses');
  const resultCorpusVsExpenses = document.getElementById('resultCorpusVsExpenses');
  const resultGapSurplus = document.getElementById('resultGapSurplus');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('inflRetireChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const corpus = parseFloat(document.getElementById('retireCorpus').value);
    const monthlyExp = parseFloat(document.getElementById('monthlyExpenses').value);
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
    const inflation = parseFloat(document.getElementById('inflationRate').value);
    const years = parseFloat(document.getElementById('yearsInRetire').value);

    if (!corpus || !monthlyExp || !expectedReturn || !inflation || !years || corpus <= 0 || monthlyExp <= 0 || expectedReturn <= 0 || inflation < 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r = expectedReturn / 100;
    const infl = inflation / 100;

    let balance = corpus;
    let totalExpenses = 0;
    let totalReturns = 0;
    let currentExpense = monthlyExp * 12;
    const schedule = [];

    for (let year = 1; year <= years; year++) {
      const startBalance = balance;
      const expense = currentExpense;
      totalExpenses += expense;
      const returns = (balance - expense) * r;
      totalReturns += returns;
      balance = (balance - expense) * (1 + r);

      schedule.push({
        year,
        age: 60 + year - 1,
        start: Math.round(startBalance),
        expense: Math.round(expense),
        returns: Math.round(returns),
        end: Math.round(Math.max(0, balance)),
      });

      currentExpense *= (1 + infl);

      if (balance <= 0) break;
    }

    const year1Expense = monthlyExp * 12;
    const finalExpense = monthlyExp * 12 * Math.pow(1 + infl, years - 1);
    const gap = corpus - totalExpenses;

    resultYear1Expenses.textContent = '\u20B9 ' + formatNumber(Math.round(year1Expense));
    resultFinalYearExpenses.textContent = '\u20B9 ' + formatNumber(Math.round(finalExpense));
    resultTotalExpenses.textContent = '\u20B9 ' + formatNumber(Math.round(totalExpenses));
    resultCorpusVsExpenses.textContent = '\u20B9 ' + formatNumber(Math.round(corpus)) + ' vs \u20B9 ' + formatNumber(Math.round(totalExpenses));
    resultGapSurplus.textContent = '\u20B9 ' + formatNumber(Math.round(gap));

    renderSchedule(schedule);
    drawChart(schedule, corpus);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${r.age}</td>
        <td class="text-right">${formatNumber(r.start)}</td>
        <td class="text-right">${formatNumber(r.expense)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.end)}</td>
      </tr>
    `).join('');
  }

  function drawChart(schedule, initialCorpus) {
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

    const expenses = schedule.map(r => r.expense);
    const balances = schedule.map(r => r.end);
    const maxVal = Math.max(initialCorpus, ...expenses, ...balances) * 1.1;

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    ctx.strokeStyle = '#ba1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    expenses.forEach((v, i) => {
      const x = pad.left + (i / (expenses.length - 1 || 1)) * chartW;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = '#005c8e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    balances.forEach((v, i) => {
      const x = pad.left + (i / (balances.length - 1 || 1)) * chartW;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#191c1e';
    ctx.font = '12px -apple-system, sans-serif';
    for (let i = 0; i < Math.max(expenses.length, balances.length); i += Math.max(1, Math.floor(Math.max(expenses.length, balances.length) / 6))) {
      const x = pad.left + (i / (Math.max(expenses.length, balances.length) - 1 || 1)) * chartW;
      ctx.fillText('Yr ' + (i + 1), x - 10, displayHeight - 8);
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
    ctx.fillStyle = '#ba1a1a';
    ctx.fillRect(140, 6, 12, 12);
    ctx.fillStyle = '#191c1e';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Corpus', 26, 16);
    ctx.fillText('Expenses', 156, 16);

    const regions = [];
    expenses.forEach((v, i) => {
      const x = pad.left + (i / (expenses.length - 1 || 1)) * chartW;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      regions.push({ type: 'point', x: x, y: y, r: 10,
        label: 'Expenses · Yr ' + (i + 1), value: '₹' + formatNumber(Math.round(v)), color: '#ba1a1a' });
    });
    balances.forEach((v, i) => {
      const x = pad.left + (i / (balances.length - 1 || 1)) * chartW;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      regions.push({ type: 'point', x: x, y: y, r: 10,
        label: 'Corpus · Yr ' + (i + 1), value: '₹' + formatNumber(Math.round(v)), color: '#005c8e' });
    });
    ChartTooltip.bind(chartCanvas, regions);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
