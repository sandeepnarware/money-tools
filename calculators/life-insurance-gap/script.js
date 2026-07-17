document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lifeInsGapForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultIncomeNeed = document.getElementById('resultIncomeNeed');
  const resultOtherNeed = document.getElementById('resultOtherNeed');
  const resultTotalNeed = document.getElementById('resultTotalNeed');
  const resultExisting = document.getElementById('resultExisting');
  const resultGap = document.getElementById('resultGap');
  const chartCanvas = document.getElementById('lifeInsGapChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('annualIncome').value);
    const years = parseFloat(document.getElementById('incomeYears').value);
    const loans = parseFloat(document.getElementById('outstandingLoans').value);
    const education = parseFloat(document.getElementById('educationCost').value);
    const otherGoals = parseFloat(document.getElementById('otherGoals').value);
    const existingSavings = parseFloat(document.getElementById('existingSavings').value);
    const existingCover = parseFloat(document.getElementById('existingCover').value);

    if (!income || !years || income <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const incomeNeed = income * years;
    const otherNeed = loans + education + otherGoals;
    const totalNeed = incomeNeed + otherNeed;
    const existing = existingCover + existingSavings;
    const gap = Math.max(0, totalNeed - existing);

    resultIncomeNeed.textContent = '\u20B9 ' + formatNumber(Math.round(incomeNeed));
    resultOtherNeed.textContent = '\u20B9 ' + formatNumber(Math.round(otherNeed));
    resultTotalNeed.textContent = '\u20B9 ' + formatNumber(Math.round(totalNeed));
    resultExisting.textContent = '\u20B9 ' + formatNumber(Math.round(existing));
    resultGap.textContent = '\u20B9 ' + formatNumber(Math.round(gap));

    drawChart(existing, gap);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(covered, gap) {
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
    const total = covered + gap;

    const ang1 = (covered / total) * Math.PI * 2;
    const ang2 = (gap / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + ang1);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + ang1, -Math.PI / 2 + ang1 + ang2);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    const ly = displaySize - 6;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(10, ly - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Covered', 26, ly + 2);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(100, ly - 10, 12, 12);
    ctx.fillText('Gap', 116, ly + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
