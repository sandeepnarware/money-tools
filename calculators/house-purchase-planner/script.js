document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('housePlannerForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const price = parseFloat(document.getElementById('homePrice').value);
    const downPct = parseFloat(document.getElementById('downPaymentPct').value);
    const saved = parseFloat(document.getElementById('alreadySavedH').value);
    const monthlyCap = parseFloat(document.getElementById('monthlyCapacity').value);
    const annualReturn = parseFloat(document.getElementById('expectedReturnH').value);
    const targetYears = parseFloat(document.getElementById('targetYearsH').value);

    if (!price || price <= 0) { alert('Please enter valid home price.'); return; }

    const downPayment = price * downPct / 100;
    const gap = downPayment - saved;
    let monthlyNeeded, timeToSave, reach;

    if (gap <= 0) {
      monthlyNeeded = 0;
      timeToSave = 0;
      reach = 'Yes (Already have enough!)';
    } else {
      if (annualReturn > 0 && targetYears > 0) {
        const r = annualReturn / 12 / 100;
        const n = targetYears * 12;
        monthlyNeeded = gap * r / (Math.pow(1 + r, n) - 1);
      } else {
        monthlyNeeded = gap / (targetYears * 12);
      }

      if (monthlyCap >= monthlyNeeded) {
        reach = 'On Track!';
      } else {
        reach = 'Need to save more';
      }

      if (monthlyCap > 0) {
        let months = 0;
        let fv = saved;
        const mr = annualReturn / 12 / 100;
        while (fv < downPayment && months < 360) {
          fv = fv * (1 + mr) + monthlyCap;
          months++;
        }
        timeToSave = months;
      } else {
        timeToSave = Infinity;
      }
    }

    document.getElementById('resultDownPayment').innerHTML = '&#8377; ' + formatNumber(Math.round(downPayment));
    document.getElementById('resultSavedH').innerHTML = '&#8377; ' + formatNumber(Math.round(saved));
    document.getElementById('resultMonthlyNeededH').innerHTML = '&#8377; ' + formatNumber(Math.round(Math.max(0, monthlyNeeded)));
    document.getElementById('resultTimeH').textContent = timeToSave > 0 && timeToSave < 360 ? formatNumber(timeToSave) + ' months' : 'N/A';
    document.getElementById('resultReachH').textContent = reach;

    drawChart(saved, Math.max(0, gap));
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(saved, gap) {
    const ctx = document.getElementById('housePlannerChart').getContext('2d');
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
