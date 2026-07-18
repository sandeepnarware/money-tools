document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('savingsRateForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultMonthlySavings = document.getElementById('resultMonthlySavings');
  const resultSavingsRate = document.getElementById('resultSavingsRate');
  const resultAnnualSavings = document.getElementById('resultAnnualSavings');
  const resultYearsToFi = document.getElementById('resultYearsToFi');
  const resultFiNumber = document.getElementById('resultFiNumber');
  const chartCanvas = document.getElementById('savingsRateChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncome').value);
    const expenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);

    if (!income || !expenses || !currentSavings || !expectedReturn || income <= 0 || expenses < 0 || currentSavings < 0 || expectedReturn <= 0) {
      alert('Please enter valid values.');
      return;
    }
    if (expenses > income) {
      alert('Expenses cannot exceed income.');
      return;
    }

    const monthlySavings = income - expenses;
    const savingsRate = (monthlySavings / income) * 100;
    const annualSavings = monthlySavings * 12;
    const annualExpenses = expenses * 12;
    const fiNumber = annualExpenses * 25;
    const r = expectedReturn / 100;

    let yearsToFi;
    const C = currentSavings;
    const s = annualSavings;
    const F = fiNumber;

    if (F * r + s <= C * r + s) {
      yearsToFi = 0;
    } else {
      yearsToFi = Math.log((F * r + s) / (C * r + s)) / Math.log(1 + r);
    }

    resultMonthlySavings.textContent = '\u20B9 ' + formatNumber(Math.round(monthlySavings));
    resultSavingsRate.textContent = savingsRate.toFixed(1) + '%';
    resultAnnualSavings.textContent = '\u20B9 ' + formatNumber(Math.round(annualSavings));
    resultYearsToFi.textContent = Math.ceil(yearsToFi) + ' yrs';
    resultFiNumber.textContent = '\u20B9 ' + formatNumber(Math.round(fiNumber));

    drawChart(expenses, monthlySavings);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(expenses, savings) {
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
    const total = expenses + savings;
    const segs = [
      { label: 'Expenses', value: expenses, color: '#ef4444' },
      { label: 'Savings', value: savings, color: '#16a34a' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) return;
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      const legendY = displaySize - 6;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Expenses', 26, legendY + 2);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(100, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Savings', 116, legendY + 2);
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
