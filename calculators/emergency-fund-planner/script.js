document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('efPlannerForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const expenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const current = parseFloat(document.getElementById('currentSavings').value);
    const monthlySave = parseFloat(document.getElementById('monthlySave').value);
    const targetMonths = parseInt(document.getElementById('targetMonths').value);

    if (!expenses || expenses <= 0) { alert('Please enter valid expenses.'); return; }

    const target = expenses * targetMonths;
    const gap = target - current;
    let monthsToTarget, progress;

    if (gap <= 0) {
      monthsToTarget = 0;
      progress = 100;
    } else {
      monthsToTarget = Math.ceil(gap / monthlySave);
      progress = (current / target) * 100;
    }

    document.getElementById('resultTarget').innerHTML = '&#8377; ' + formatNumber(Math.round(target));
    document.getElementById('resultCurrentEF').innerHTML = '&#8377; ' + formatNumber(Math.round(current));
    document.getElementById('resultMonthlyNeeded').innerHTML = gap <= 0 ? 'Already have enough!' : '&#8377; ' + formatNumber(Math.round(monthlySave));
    document.getElementById('resultTimeEF').textContent = gap <= 0 ? '0 (Already funded!)' : formatNumber(monthsToTarget) + ' months';
    document.getElementById('resultProgress').textContent = progress.toFixed(1) + '%';

    drawChart(current, gap > 0 ? gap : 0, target);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(current, gap, target) {
    const ctx = document.getElementById('efPlannerChart').getContext('2d');
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
    const total = current + gap;
    if (total === 0) return;

    ctx.clearRect(0, 0, displaySize, displaySize);

    const segs = [
      { label: 'Saved', value: current, color: '#16a34a' },
      { label: 'Needed', value: gap, color: '#2563eb' },
    ];
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
