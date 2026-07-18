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
    const segs = [
      { label: 'Covered', value: covered, color: '#16a34a' },
      { label: 'Gap', value: gap, color: '#ef4444' },
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
