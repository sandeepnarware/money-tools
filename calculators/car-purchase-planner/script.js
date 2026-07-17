document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('carPlannerForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const price = parseFloat(document.getElementById('carPrice').value);
    const downPct = parseFloat(document.getElementById('downPaymentPctCar').value);
    const saved = parseFloat(document.getElementById('alreadySavedCar').value);
    const monthlyCap = parseFloat(document.getElementById('monthlyCapacityCar').value);
    const annualReturn = parseFloat(document.getElementById('expectedReturnCar').value);
    const targetYears = parseFloat(document.getElementById('targetYearsCar').value);

    if (!price || price <= 0) { alert('Please enter valid car price.'); return; }

    const downPayment = price * downPct / 100;
    const gap = downPayment - saved;
    let monthlyNeeded, reach, totalSaved;

    if (gap <= 0) {
      monthlyNeeded = 0;
      reach = 'Yes (Already saved enough!)';
      totalSaved = saved;
    } else {
      if (annualReturn > 0 && targetYears > 0) {
        const r = annualReturn / 12 / 100;
        const n = targetYears * 12;
        monthlyNeeded = gap * r / (Math.pow(1 + r, n) - 1);
        totalSaved = saved * Math.pow(1 + r, n) + monthlyCap * (Math.pow(1 + r, n) - 1) / r;
      } else {
        monthlyNeeded = gap / (targetYears * 12);
        totalSaved = saved + monthlyCap * targetYears * 12;
      }

      if (monthlyCap >= monthlyNeeded) {
        reach = 'On Track!';
      } else {
        reach = 'Need to save more';
      }
    }

    document.getElementById('resultDownCar').innerHTML = '&#8377; ' + formatNumber(Math.round(downPayment));
    document.getElementById('resultSavedCar').innerHTML = '&#8377; ' + formatNumber(Math.round(saved));
    document.getElementById('resultMonthlyCar').innerHTML = '&#8377; ' + formatNumber(Math.round(Math.max(0, monthlyNeeded)));
    document.getElementById('resultReachCar').textContent = reach;
    document.getElementById('resultTotalSavedCar').innerHTML = '&#8377; ' + formatNumber(Math.round(totalSaved));

    drawChart(saved, Math.max(0, gap));
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(saved, gap) {
    const ctx = document.getElementById('carPlannerChart').getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = ctx.canvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);
    ctx.canvas.width = displaySize * dpr;
    ctx.canvas.height = displaySize * dpr;
    ctx.canvas.style.width = displaySize + 'px';
    ctx.canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const radius = displaySize / 2 - 20;
    const segs = [
      { label: 'Saved', value: saved, color: '#16a34a' },
      { label: 'Goal', value: gap, color: '#2563eb' },
    ];
    const total = saved + gap;
    if (total === 0) return;

    ctx.clearRect(0, 0, displaySize, displaySize);
    let startAngle = -Math.PI / 2;
    segs.forEach(seg => {
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
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
