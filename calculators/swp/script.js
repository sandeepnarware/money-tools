document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('swpForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultWithdrawn = document.getElementById('resultWithdrawn');
  const resultCorpus = document.getElementById('resultCorpus');
  const resultInflAdj = document.getElementById('resultInflAdj');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('swpChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function parseNum(v) {
    return parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  }

  function calculate() {
    const initialInvestment = parseNum(document.getElementById('initialInvestment').value);
    const annualReturn = parseNum(document.getElementById('expectedReturn').value);
    const years = parseNum(document.getElementById('withdrawalPeriod').value);
    const monthlyWithdrawal = parseNum(document.getElementById('monthlyWithdrawal').value);
    const annualInflation = parseNum(document.getElementById('inflationRate').value);

    if (!initialInvestment || annualReturn < 0 || !years || isNaN(monthlyWithdrawal) || annualInflation < 0 ||
        initialInvestment <= 0 || years <= 0 || monthlyWithdrawal < 0) {
      alert('Please enter valid positive values in all fields.');
      return;
    }

    const n = years * 12;
    const r = annualReturn / 12 / 100;

    const schedule = buildYearlySchedule(initialInvestment, r, monthlyWithdrawal, n, annualInflation);
    const lastYear = schedule[schedule.length - 1];

    const totalWithdrawn = monthlyWithdrawal * n;

    resultWithdrawn.textContent = '\u20B9 ' + formatNumber(Math.round(totalWithdrawn));
    resultCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(lastYear.closing));
    resultInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(lastYear.inflAdj));

    renderSchedule(schedule);
    drawChart(schedule);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildYearlySchedule(initial, monthlyRate, monthlyWithdrawal, totalMonths, annualInflation) {
    const rows = [];
    let balance = initial;
    let yearStartBalance = initial;
    let yearWithdrawals = 0;
    let yearReturns = 0;
    let year = 1;

    for (let i = 1; i <= totalMonths; i++) {
      const returnsEarned = balance * monthlyRate;
      balance = balance + returnsEarned - monthlyWithdrawal;
      if (balance < 0) balance = 0;

      yearWithdrawals += monthlyWithdrawal;
      yearReturns += returnsEarned;

      if (i % 12 === 0 || i === totalMonths) {
        const inflAdj = balance / Math.pow(1 + annualInflation / 100, year);

        rows.push({
          year,
          opening: Math.round(yearStartBalance),
          withdrawals: Math.round(yearWithdrawals),
          returns: Math.round(yearReturns),
          closing: Math.round(balance),
          inflAdj: Math.round(inflAdj),
        });

        if (balance <= 0) break;

        yearStartBalance = balance;
        yearWithdrawals = 0;
        yearReturns = 0;
        year++;
      }
    }

    return rows;
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.opening)}</td>
        <td class="text-right">${formatNumber(r.withdrawals)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.closing)}</td>
        <td class="text-right">${formatNumber(r.inflAdj)}</td>
      </tr>
    `).join('');
  }

  function drawChart(schedule) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = Math.round(displayW * 0.6);
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const maxVal = Math.max(...schedule.map(r => Math.max(r.opening, r.closing)));
    const padding = { top: 48, right: 20, bottom: 40, left: 60 };
    const chartW = displayW - padding.left - padding.right;
    const chartH = displayH - padding.top - padding.bottom;

    function getX(i) {
      return padding.left + (i / (schedule.length - 1 || 1)) * chartW;
    }

    function getY(val) {
      return padding.top + chartH - (val / maxVal) * chartH;
    }

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px -apple-system, sans-serif';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const val = (maxVal / ySteps) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(formatNumber(Math.round(val)), padding.left - 8, y + 4);
    }

    // X axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px -apple-system, sans-serif';
    const xStep = Math.max(1, Math.floor(schedule.length / 10));
    for (let i = 0; i < schedule.length; i += xStep) {
      ctx.fillText('Yr ' + schedule[i].year, getX(i), padding.top + chartH + 16);
    }

    // Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    function drawLine(data, getVal, color) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = 0; i < data.length; i++) {
        const x = getX(i);
        const y = getY(getVal(data[i]));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Dots at data points
      ctx.fillStyle = color;
      for (let i = 0; i < data.length; i++) {
        const x = getX(i);
        const y = getY(getVal(data[i]));
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawLine(schedule, d => d.closing, '#2563eb');
    drawLine(schedule, d => d.inflAdj, '#16a34a');

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, 8, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Closing Corpus', 26, 18);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(150, 8, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Inflation-Adjusted', 166, 18);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
