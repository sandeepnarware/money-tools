document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('emergencyForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultMonthlyExpenses = document.getElementById('resultMonthlyExpenses');
  const resultFund3 = document.getElementById('resultFund3');
  const resultFund6 = document.getElementById('resultFund6');
  const resultFund12 = document.getElementById('resultFund12');
  const resultCurrentSavings = document.getElementById('resultCurrentSavings');
  const resultGap = document.getElementById('resultGap');
  const resultMonthsCovered = document.getElementById('resultMonthsCovered');
  const resultSavingsRate = document.getElementById('resultSavingsRate');
  const resultTimeToBuild = document.getElementById('resultTimeToBuild');
  const chartCanvas = document.getElementById('emergencyChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const expenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const savings = parseFloat(document.getElementById('currentSavings').value) || 0;
    const income = parseFloat(document.getElementById('monthlyIncome').value);

    if (!expenses || !income || expenses <= 0 || income <= 0) {
      alert('Please enter valid positive values for Monthly Expenses and Income.');
      return;
    }

    const fund3 = expenses * 3;
    const fund6 = expenses * 6;
    const fund12 = expenses * 12;
    const gap = Math.max(0, fund6 - savings);
    const monthsCovered = savings / expenses;
    const surplus = income - expenses;
    const savingsRate = (surplus / income) * 100;
    const timeToBuild = surplus > 0 ? Math.ceil(gap / surplus) : Infinity;
    const timeToBuildText = timeToBuild === Infinity ? 'N/A' : timeToBuild + ' mo';

    resultMonthlyExpenses.textContent = '\u20B9 ' + formatNumber(Math.round(expenses));
    resultFund3.textContent = '\u20B9 ' + formatNumber(Math.round(fund3));
    resultFund6.textContent = '\u20B9 ' + formatNumber(Math.round(fund6));
    resultFund12.textContent = '\u20B9 ' + formatNumber(Math.round(fund12));
    resultCurrentSavings.textContent = '\u20B9 ' + formatNumber(Math.round(savings));

    const gapValue = resultGap;
    gapValue.textContent = '\u20B9 ' + formatNumber(Math.round(gap));
    gapValue.className = 'value';
    if (gap === 0) gapValue.classList.add('success');

    resultMonthsCovered.textContent = monthsCovered.toFixed(1) + ' mo';
    resultSavingsRate.textContent = savingsRate.toFixed(1) + '%';
    resultTimeToBuild.textContent = timeToBuildText;

    drawChart(expenses, savings, fund3, fund6, fund12);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(expenses, savings, fund3, fund6, fund12) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayWidth = Math.min(500, containerWidth);
    const displayHeight = 300;
    chartCanvas.width = displayWidth * dpr;
    chartCanvas.height = displayHeight * dpr;
    chartCanvas.style.width = displayWidth + 'px';
    chartCanvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const maxVal = Math.max(fund12, savings) * 1.2;
    const barWidth = Math.min(60, (displayWidth - 100) / 5);
    const gapSize = 16;
    const chartBottom = displayHeight - 40;
    const chartHeight = chartBottom - 10;

    const bars = [
      { label: '3-Mo', value: fund3, color: '#93c5fd' },
      { label: '6-Mo', value: fund6, color: '#2563eb' },
      { label: '12-Mo', value: fund12, color: '#1e40af' },
      { label: 'Current', value: savings, color: '#16a34a' },
    ];

    const totalWidth = bars.length * barWidth + (bars.length - 1) * gapSize;
    const startX = (displayWidth - totalWidth) / 2;

    bars.forEach((bar) => {
      const i = bars.indexOf(bar);
      const x = startX + i * (barWidth + gapSize);
      const barHeight = Math.max(0, (bar.value / maxVal) * chartHeight);
      const y = chartBottom - barHeight;

      ctx.fillStyle = bar.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bar.label, x + barWidth / 2, chartBottom + 18);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.fillText('\u20B9' + formatNumber(Math.round(bar.value / 1000)) + 'K', x + barWidth / 2, y - 6);
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
