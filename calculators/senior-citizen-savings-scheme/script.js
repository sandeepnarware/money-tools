document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('scssForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalDeposit = document.getElementById('resultTotalDeposit');
  const resultQuarterlyPayout = document.getElementById('resultQuarterlyPayout');
  const resultAnnualIncome = document.getElementById('resultAnnualIncome');
  const resultTotalInterest = document.getElementById('resultTotalInterest');
  const resultMaturityAmount = document.getElementById('resultMaturityAmount');
  const chartCanvas = document.getElementById('scssChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const deposit = parseFloat(document.getElementById('depositAmount').value);
    const scssRate = parseFloat(document.getElementById('scssRate').value);
    const age = parseFloat(document.getElementById('seniorAge').value);

    if (!deposit || !scssRate || !age || deposit <= 0 || scssRate <= 0 || age < 60) {
      alert('Please enter valid positive values. Age must be 60 or above.');
      return;
    }

    const quarterlyPayout = deposit * scssRate / 100 / 4;
    const annualIncome = quarterlyPayout * 4;
    const totalInterest = annualIncome * 5;
    const maturityAmount = deposit;

    resultTotalDeposit.textContent = '\u20B9 ' + formatNumber(Math.round(deposit));
    resultQuarterlyPayout.textContent = '\u20B9 ' + formatNumber(Math.round(quarterlyPayout));
    resultAnnualIncome.textContent = '\u20B9 ' + formatNumber(Math.round(annualIncome));
    resultTotalInterest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));
    resultMaturityAmount.textContent = '\u20B9 ' + formatNumber(Math.round(maturityAmount));

    drawChart(deposit, totalInterest);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(principal, interest) {
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
    const total = principal + interest;

    const segs = [
      { label: 'Principal', value: principal, color: '#2563eb' },
      { label: 'Interest', value: interest, color: '#16a34a' },
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
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Principal', 26, legendY + 2);

      ctx.fillStyle = '#16a34a';
      ctx.fillRect(110, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Interest', 126, legendY + 2);
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
