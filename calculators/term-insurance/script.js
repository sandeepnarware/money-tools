document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('termInsForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultIncomeReplace = document.getElementById('resultIncomeReplace');
  const resultDebtCoverage = document.getElementById('resultDebtCoverage');
  const resultDependentNeed = document.getElementById('resultDependentNeed');
  const resultTotalNeed = document.getElementById('resultTotalNeed');
  const resultCoverGap = document.getElementById('resultCoverGap');
  const chartCanvas = document.getElementById('termInsChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const annualIncome = parseFloat(document.getElementById('annualIncome').value);
    const yearsToReplace = parseFloat(document.getElementById('yearsToReplace').value);
    const existingInvestments = parseFloat(document.getElementById('existingInvestments').value);
    const outstandingLoans = parseFloat(document.getElementById('outstandingLoans').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const yearsToSupport = parseFloat(document.getElementById('yearsToSupport').value);
    const existingCover = parseFloat(document.getElementById('existingCover').value);

    if (!annualIncome || !yearsToReplace || !monthlyExpenses || !yearsToSupport) {
      alert('Please enter valid positive values.');
      return;
    }

    const incomeReplacement = annualIncome * yearsToReplace;
    const debtCoverage = outstandingLoans;
    const dependentNeeds = monthlyExpenses * 12 * yearsToSupport;
    const totalNeed = incomeReplacement + debtCoverage + dependentNeeds - existingInvestments;
    const gap = totalNeed - existingCover;

    resultIncomeReplace.textContent = '\u20B9 ' + formatNumber(Math.round(incomeReplacement));
    resultDebtCoverage.textContent = '\u20B9 ' + formatNumber(Math.round(debtCoverage));
    resultDependentNeed.textContent = '\u20B9 ' + formatNumber(Math.round(dependentNeeds));
    resultTotalNeed.textContent = '\u20B9 ' + formatNumber(Math.round(totalNeed));

    const gapEl = resultCoverGap;
    if (gap < 0) {
      gapEl.textContent = 'Coverage Sufficient!';
      gapEl.className = 'value success';
    } else {
      gapEl.textContent = '\u20B9 ' + formatNumber(Math.round(gap));
      gapEl.className = 'value danger';
    }

    drawChart(incomeReplacement, debtCoverage, dependentNeeds, existingCover);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(incomeRep, debtCov, depNeed, existCov) {
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
    const total = incomeReplacement + debtCoverage + dependentNeeds + existingCover;

    const segments = [
      { value: incomeReplacement, color: '#2563eb', label: 'Income Replacement' },
      { value: debtCoverage, color: '#ef4444', label: 'Debt Coverage' },
      { value: dependentNeeds, color: '#f59e0b', label: 'Dependent Expenses' },
      { value: existingCover, color: '#16a34a', label: 'Existing Cover' },
    ];

    ctx.clearRect(0, 0, displaySize, displaySize);
    let startAngle = -Math.PI / 2;

    segments.forEach(seg => {
      if (seg.value <= 0) return;
      const angle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += angle;
    });

    const legendY = displaySize - 6;
    let legendX = 10;
    segments.forEach(seg => {
      ctx.fillStyle = seg.color;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText(seg.label, legendX + 16, legendY + 2);
      legendX += ctx.measureText(seg.label).width + 32;
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});