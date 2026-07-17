document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('creditScoreForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const current = parseFloat(document.getElementById('currentScore').value);
    const target = parseFloat(document.getElementById('targetScore').value);
    const debt = parseFloat(document.getElementById('creditCardDebt').value);
    const util = parseFloat(document.getElementById('creditUtil').value);
    const latePayments = parseFloat(document.getElementById('latePayments').value);
    const accounts = parseFloat(document.getElementById('numAccounts').value);
    const avgAge = parseFloat(document.getElementById('avgAccountAge').value);

    if (!current || !target) { alert('Please enter score values.'); return; }

    const utilizationFactor = Math.max(0, 1 - (util / 100 - 0.3));
    const latePenalty = latePayments * 20;
    const ageBenefit = Math.min(50, avgAge * 10);
    const improvement = Math.max(0, target - current);
    const monthlyGain = 15;
    const estimatedMonths = Math.ceil(improvement / monthlyGain);

    const potential12 = Math.round(current + Math.min(improvement, 12 * monthlyGain));

    let actions = [];
    if (util > 30) actions.push('Pay down credit card debt to reduce utilization below 30%');
    if (latePayments > 0) actions.push('Avoid late payments - set up auto-pay reminders');
    if (accounts < 3) actions.push('Consider opening 1-2 more credit accounts to build history');

    document.getElementById('resultCurrentScore').textContent = formatNumber(Math.round(current));
    document.getElementById('resultImprovement').textContent = formatNumber(Math.round(improvement)) + ' points';
    document.getElementById('resultPotential').textContent = formatNumber(potential12);
    document.getElementById('resultTime').textContent = estimatedMonths + ' months';
    document.getElementById('resultActions').textContent = actions.length > 0 ? actions.join('; ') : 'On track! Keep maintaining good habits.';

    drawChart(current, target);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(current, target) {
    const ctx = document.getElementById('creditScoreChart').getContext('2d');
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
    const maxScore = 900;

    ctx.clearRect(0, 0, displaySize, displaySize);

    const currentAngle = (current / maxScore) * Math.PI * 2;
    const gapAngle = ((target - current) / maxScore) * Math.PI * 2;
    const remainingAngle = ((maxScore - target) / maxScore) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + currentAngle);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + currentAngle, -Math.PI / 2 + currentAngle + gapAngle);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + currentAngle + gapAngle, -Math.PI / 2 + currentAngle + gapAngle + remainingAngle);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(10, displaySize - 6, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Current (' + Math.round(current) + ')', 26, displaySize + 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(140, displaySize - 6, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Gap (' + Math.round(target - current) + ')', 156, displaySize + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
