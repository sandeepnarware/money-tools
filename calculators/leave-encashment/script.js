document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('leaveEncashForm');
  const resultsSection = document.getElementById('resultsSection');
  const resultPerDaySalary = document.getElementById('resultPerDaySalary');
  const resultEncashmentAmount = document.getElementById('resultEncashmentAmount');
  const resultMaxDaysAllowed = document.getElementById('resultMaxDaysAllowed');
  const resultTaxableAmount = document.getElementById('resultTaxableAmount');
  const chartCanvas = document.getElementById('leaveEncashChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const basicDa = parseFloat(document.getElementById('basicDa').value);
    const leaveDays = parseFloat(document.getElementById('leaveDays').value);
    const maxDays = parseFloat(document.getElementById('maxDaysEncashable').value);
    const isRetiring = document.getElementById('isRetiring').value === 'yes';

    if (!basicDa || basicDa <= 0) {
      alert('Please enter a valid salary.');
      return;
    }

    const perDaySalary = (basicDa * 12) / 365;
    const daysEncashable = Math.min(leaveDays, maxDays);
    const encashmentAmount = perDaySalary * daysEncashable;

    let taxable;
    if (isRetiring) {
      const exempt = Math.min(encashmentAmount, 300000, perDaySalary * 10 * 30);
      taxable = Math.max(0, encashmentAmount - exempt);
    } else {
      taxable = encashmentAmount;
    }

    resultPerDaySalary.textContent = '\u20B9 ' + formatNumber(Math.round(perDaySalary));
    resultEncashmentAmount.textContent = '\u20B9 ' + formatNumber(Math.round(encashmentAmount));
    resultMaxDaysAllowed.textContent = formatNumber(maxDays);
    resultTaxableAmount.textContent = '\u20B9 ' + formatNumber(Math.round(taxable));

    drawChart(encashmentAmount, taxable, isRetiring);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(total, taxable, isRetiring) {
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
    const exempt = Math.max(0, total - taxable);
    const segs = [
      { label: 'Exempt', value: exempt, color: '#00652c' },
      { label: 'Taxable', value: taxable, color: '#ba1a1a' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) return;
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
      ctx.fillStyle = '#00652c';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Exempt', 26, legendY + 2);
      ctx.fillStyle = '#ba1a1a';
      ctx.fillRect(90, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.fillText('Taxable', 106, legendY + 2);
    }
    function animate(time) {
      if (!startTime) startTime = time;
      const p = Math.min(1, (time - startTime) / 600);
      draw(p);
      if (p < 1) animId = requestAnimationFrame(animate);
    }
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(animate);

    let angleCursor = -Math.PI / 2;
    const regions = segs.filter(s => s.value > 0).map(seg => {
      const sliceAngle = (seg.value / total) * Math.PI * 2;
      const region = {
        type: 'arc', cx, cy, rInner: radius * 0.82, rOuter: radius,
        start: angleCursor, end: angleCursor + sliceAngle,
        label: seg.label, value: '₹ ' + formatNumber(Math.round(seg.value)), color: seg.color,
      };
      angleCursor += sliceAngle;
      return region;
    });
    ChartTooltip.bind(chartCanvas, regions);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
