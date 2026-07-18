document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('readinessForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultScore = document.getElementById('resultScore');
  const resultCorpusRequired = document.getElementById('resultCorpusRequired');
  const resultProjected = document.getElementById('resultProjected');
  const resultMonthlyIncome = document.getElementById('resultMonthlyIncome');
  const resultMonthlyRequired = document.getElementById('resultMonthlyRequired');
  const resultStatus = document.getElementById('resultStatus');
  const chartCanvas = document.getElementById('readinessChart');

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

    const score = Math.min(100, (projected / corpusRequired) * 100);
    const monthlyIncome = (projected * 0.04) / 12;

    let statusText, statusClass;
    if (score >= 90) {
      statusText = 'On Track';
      statusClass = 'success';
    } else if (score >= 60) {
      statusText = 'Needs Improvement';
      statusClass = '';
    } else {
      statusText = 'Critical';
      statusClass = 'danger';
    }

    resultScore.textContent = Math.round(score) + '%';
    resultScore.className = 'value primary';
    resultCorpusRequired.textContent = '\u20B9 ' + formatNumber(Math.round(corpusRequired));
    resultProjected.textContent = '\u20B9 ' + formatNumber(Math.round(projected));
    resultMonthlyIncome.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyIncome));
    resultMonthlyRequired.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyExpenseAtRetirement));

    resultStatus.textContent = statusText;
    resultStatus.className = 'value ' + statusClass;

    drawChart(score);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(score) {
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
    const lineWidth = 20;

    let color;
    if (score >= 90) {
      color = '#16a34a';
    } else if (score >= 60) {
      color = '#f59e0b';
    } else {
      color = '#ef4444';
    }

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);

      ctx.beginPath();
      ctx.arc(cx, cy, radius - lineWidth / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      const angle = (score / 100) * Math.PI * 2 * p;

      ctx.beginPath();
      ctx.arc(cx, cy, radius - lineWidth / 2, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(score) + '%', cx, cy);

      const legendY = displaySize - 6;
      ctx.fillStyle = color;
      ctx.fillRect(cx - 50, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Readiness Score', cx - 34, legendY + 2);
    }
    function animate(time) {
      if (!startTime) startTime = time;
      const p = Math.min(1, (time - startTime) / 600);
      draw(p);
      if (p < 1) animId = requestAnimationFrame(animate);
    }
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(animate);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
