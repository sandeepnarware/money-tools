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

    if (isNaN(goal) || goal <= 0 || isNaN(years) || years <= 0 || isNaN(annualRate) || annualRate <= 0) {
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
    const unfilled = Math.max(0, goal - fvSavings - fvSip);
    const segs = [
      { label: 'Current Savings', value: fvSavings, color: '#004b74' },
      { label: 'Future SIP', value: fvSip, color: '#00652c' },
      { label: 'Remaining', value: unfilled, color: '#c4ccce' },
    ];
    let angleCursor = -Math.PI / 2;
    const regions = segs.filter(s => s.value > 0).map(seg => {
      const sliceAngle = (seg.value / goal) * Math.PI * 2;
      const region = {
        type: 'arc', cx, cy, rInner: radius * 0.82, rOuter: radius,
        start: angleCursor, end: angleCursor + sliceAngle,
        label: seg.label, value: '₹ ' + formatNumber(Math.round(seg.value)), color: seg.color,
      };
      angleCursor += sliceAngle;
      return region;
    });
    ChartTooltip.bind(chartCanvas, regions);
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (goal <= 0) return;
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / goal) * Math.PI * 2;
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
      ctx.font = '12px -apple-system, sans-serif';
      const items = [];
      if (fvSavings > 0) items.push({ label: 'Current Savings', color: '#004b74' });
      if (fvSip > 0) items.push({ label: 'Future SIP', color: '#00652c' });
      if (unfilled > 0) items.push({ label: 'Remaining', color: '#c4ccce' });
      const totalW = items.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (items.length - 1) * 20;
      let legendX = (displaySize - totalW) / 2;
      items.forEach(item => {
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
