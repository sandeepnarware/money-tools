document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goalSipForm');
  const resultsSection = document.getElementById('resultsSection');
  const resultMonthlySIP = document.getElementById('resultMonthlySIP');
  const resultGoalAmount = document.getElementById('resultGoalAmount');
  const resultCurrentSavings = document.getElementById('resultCurrentSavings');
  const resultFvSavings = document.getElementById('resultFvSavings');
  const chartCanvas = document.getElementById('goalSipChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const goal = parseFloat(document.getElementById('goalAmount').value);
    const savings = parseFloat(document.getElementById('currentSavings').value);
    const years = parseFloat(document.getElementById('timeHorizon').value);
    const annualRate = parseFloat(document.getElementById('expectedReturn').value);

    if (!goal || !years || !annualRate || goal <= 0 || years <= 0 || annualRate <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r = annualRate / 12 / 100;
    const n = years * 12;
    const fvSavings = savings * Math.pow(1 + annualRate / 100, years);
    const remaining = goal - fvSavings;

    let monthlySIP = 0;
    let goalAchievable = false;
    if (remaining <= 0) {
      goalAchievable = true;
    } else {
      monthlySIP = remaining / ((Math.pow(1 + r, n) - 1) / r * (1 + r));
    }

    resultGoalAmount.textContent = '\u20B9 ' + formatNumber(Math.round(goal));
    resultCurrentSavings.textContent = '\u20B9 ' + formatNumber(Math.round(savings));
    resultFvSavings.textContent = '\u20B9 ' + formatNumber(Math.round(fvSavings));

    if (goalAchievable) {
      resultMonthlySIP.textContent = 'Goal already achievable!';
      resultMonthlySIP.style.fontSize = '0.9rem';
    } else {
      resultMonthlySIP.textContent = '\u20B9 ' + formatNumber(Math.round(monthlySIP));
      resultMonthlySIP.style.fontSize = '';
    }

    drawChart(goal, fvSavings, monthlySIP, n, r);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(goal, fvSavings, monthlySIP, n, r) {
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
    const fvSip = monthlySIP * ((Math.pow(1 + r, n) - 1) / r * (1 + r));
    const filled = fvSavings + fvSip;
    const filledRatio = Math.min(filled / goal, 1);
    const unfilled = goal - filled;

    ctx.clearRect(0, 0, displaySize, displaySize);

    const savingsAngle = (fvSavings / goal) * Math.PI * 2;
    const sipAngle = (fvSip / goal) * Math.PI * 2;
    const unfilledAngle = filled < goal ? (unfilled / goal) * Math.PI * 2 : 0;

    if (fvSavings > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + savingsAngle);
      ctx.closePath();
      ctx.fillStyle = '#1e40af';
      ctx.fill();
    }

    if (fvSip > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, -Math.PI / 2 + savingsAngle, -Math.PI / 2 + savingsAngle + sipAngle);
      ctx.closePath();
      ctx.fillStyle = '#16a34a';
      ctx.fill();
    }

    if (unfilledAngle > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, -Math.PI / 2 + savingsAngle + sipAngle, -Math.PI / 2 + savingsAngle + sipAngle + unfilledAngle);
      ctx.closePath();
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();
    }

    const legendY = displaySize - 6;
    let legendX = 10;
    if (fvSavings > 0) {
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Current Savings', legendX + 16, legendY + 2);
      legendX += ctx.measureText('Current Savings').width + 28;
    }
    if (fvSip > 0) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Future SIP', legendX + 16, legendY + 2);
      legendX += ctx.measureText('Future SIP').width + 28;
    }
    if (unfilledAngle > 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Remaining', legendX + 16, legendY + 2);
    }
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
