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
    const total = incomeRep + debtCov + depNeed + existCov;

    const segs = [
      { label: 'Income Replacement', value: incomeRep, color: '#005c8e' },
      { label: 'Debt Coverage', value: debtCov, color: '#ba1a1a' },
      { label: 'Dependent Expenses', value: depNeed, color: '#d97706' },
      { label: 'Existing Cover', value: existCov, color: '#00652c' },
    ];

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
          ctx.stroke();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();

      const legendY = displaySize - 6;
      const legendItems = segs.filter(s => s.value > 0);
      ctx.font = '12px -apple-system, sans-serif';
      const totalW = legendItems.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (legendItems.length - 1) * 20;
      let legendX = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, legendX + 16, legendY + 2);
        legendX += 16 + ctx.measureText(item.label).width + 20;
      });
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