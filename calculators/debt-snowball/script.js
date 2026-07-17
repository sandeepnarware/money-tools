document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('debtSnowballForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalDebt = document.getElementById('resultTotalDebt');
  const resultMinTotal = document.getElementById('resultMinTotal');
  const resultSnowballInterest = document.getElementById('resultSnowballInterest');
  const resultPayoffTime = document.getElementById('resultPayoffTime');
  const resultMinInterest = document.getElementById('resultMinInterest');
  const resultSaved = document.getElementById('resultSaved');
  const payoffOrder = document.getElementById('payoffOrder');
  const chartCanvas = document.getElementById('debtSnowballChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function getDebts() {
    return [
      { name: document.getElementById('debt1Name').value || 'Debt 1', balance: parseFloat(document.getElementById('debt1Balance').value) || 0, rate: parseFloat(document.getElementById('debt1Rate').value) || 0, min: parseFloat(document.getElementById('debt1Min').value) || 0 },
      { name: document.getElementById('debt2Name').value || 'Debt 2', balance: parseFloat(document.getElementById('debt2Balance').value) || 0, rate: parseFloat(document.getElementById('debt2Rate').value) || 0, min: parseFloat(document.getElementById('debt2Min').value) || 0 },
      { name: document.getElementById('debt3Name').value || 'Debt 3', balance: parseFloat(document.getElementById('debt3Balance').value) || 0, rate: parseFloat(document.getElementById('debt3Rate').value) || 0, min: parseFloat(document.getElementById('debt3Min').value) || 0 },
    ];
  }

  function simulate(debts, extra, sortByRate) {
    const working = debts.map(d => ({
      name: d.name,
      balance: d.balance,
      rate: d.rate,
      min: d.min,
    }));

    if (sortByRate) {
      working.sort((a, b) => b.rate - a.rate);
    } else {
      working.sort((a, b) => a.balance - b.balance);
    }

    let totalInterest = 0;
    let months = 0;
    const maxMonths = 1200;

    for (let m = 0; m < maxMonths; m++) {
      let anyRemaining = false;
      let totalMin = 0;

      for (const d of working) {
        if (d.balance > 0) anyRemaining = true;
        totalMin += d.min;
      }

      if (!anyRemaining) break;

      let snowballPayment = extra;
      for (const d of working) {
        if (d.balance <= 0) continue;
        const interest = d.balance * (d.rate / 100 / 12);
        totalInterest += interest;
        d.balance += interest;

        const payment = Math.min(d.min, d.balance);
        d.balance -= payment;
        snowballPayment += d.min - payment;
      }

      for (const d of working) {
        if (d.balance <= 0) continue;
        const extraPay = Math.min(snowballPayment, d.balance);
        d.balance -= extraPay;
        snowballPayment -= extraPay;
        if (d.balance < 0.01) d.balance = 0;
      }

      months = m + 1;
    }

    return { totalInterest, months };
  }

  function simulateMinOnly(debts) {
    const working = debts.map(d => ({ balance: d.balance, rate: d.rate, min: d.min }));
    let totalInterest = 0;
    const maxMonths = 1200;

    for (let m = 0; m < maxMonths; m++) {
      let anyRemaining = false;
      for (const d of working) {
        if (d.balance > 0) anyRemaining = true;
      }
      if (!anyRemaining) break;

      for (const d of working) {
        if (d.balance <= 0) continue;
        const interest = d.balance * (d.rate / 100 / 12);
        totalInterest += interest;
        d.balance += interest;
        const payment = Math.min(d.min, d.balance);
        d.balance -= payment;
      }
    }

    return totalInterest;
  }

  function calculate() {
    const debts = getDebts();
    const extra = parseFloat(document.getElementById('extraMonthly').value) || 0;

    const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
    const totalMin = debts.reduce((s, d) => s + d.min, 0);

    const snowResult = simulate(debts, extra, false);
    const minInterest = simulateMinOnly(debts);
    const saved = Math.max(0, minInterest - snowResult.totalInterest);

    resultTotalDebt.textContent = '\u20B9 ' + formatNumber(Math.round(totalDebt));
    resultMinTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalMin));
    resultSnowballInterest.textContent = '\u20B9 ' + formatNumber(Math.round(snowResult.totalInterest));
    resultPayoffTime.textContent = snowResult.months + ' months';
    resultMinInterest.textContent = '\u20B9 ' + formatNumber(Math.round(minInterest));
    resultSaved.textContent = '\u20B9 ' + formatNumber(Math.round(saved));

    const sorted = [...debts].sort((a, b) => a.balance - b.balance);
    payoffOrder.innerHTML = '<strong>Payoff Order:</strong> ' + sorted.map(d => d.name + ' (\u20B9' + formatNumber(d.balance) + ')').join(' &rarr; ');

    drawChart(debts);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(debts) {
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
    const total = debts.reduce((s, d) => s + d.balance, 0);

    const colors = ['#ef4444', '#f59e0b', '#2563eb'];
    let startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    debts.forEach((d, i) => {
      const angle = (d.balance / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += angle;
    });

    let lx = 10;
    const ly = displaySize - 6;
    debts.forEach((d, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(lx, ly - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText(d.name, lx + 16, ly + 2);
      lx += ctx.measureText(d.name).width + 32;
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
