document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('riskRewardForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultRiskShare = document.getElementById('resultRiskShare');
  const resultRewardShare = document.getElementById('resultRewardShare');
  const resultRatio = document.getElementById('resultRatio');
  const resultTotalRisk = document.getElementById('resultTotalRisk');
  const resultTotalReward = document.getElementById('resultTotalReward');
  const chartCanvas = document.getElementById('riskRewardChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const entry = parseFloat(document.getElementById('entryPrice').value);
    const stopLoss = parseFloat(document.getElementById('stopLoss').value);
    const target = parseFloat(document.getElementById('targetPrice').value);
    const qty = parseFloat(document.getElementById('riskQty').value);

    if (!entry || !stopLoss || !target || isNaN(qty) || entry <= 0 || stopLoss <= 0 || target <= 0 || qty <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const riskPerShare = entry - stopLoss;
    const rewardPerShare = target - entry;
    const ratio = rewardPerShare / riskPerShare;
    const totalRisk = riskPerShare * qty;
    const totalReward = rewardPerShare * qty;

    resultRiskShare.textContent = '\u20B9 ' + formatNumber(Math.round(riskPerShare));
    resultRewardShare.textContent = '\u20B9 ' + formatNumber(Math.round(rewardPerShare));
    resultRatio.textContent = '1:' + ratio.toFixed(2);
    resultTotalRisk.textContent = '\u20B9 ' + formatNumber(Math.round(totalRisk));
    resultTotalReward.textContent = '\u20B9 ' + formatNumber(Math.round(totalReward));

    drawChart(totalRisk, totalReward);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(risk, reward) {
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
    const total = risk + reward;

    const segs = [
      { label: 'Risk Amount', value: risk, color: '#ba1a1a' },
      { label: 'Reward Amount', value: reward, color: '#00652c' },
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
      ctx.font = '12px -apple-system, sans-serif';
      const items = segs.filter(s => s.value > 0);
      const totalW = items.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (items.length - 1) * 20;
      let lx = (displaySize - totalW) / 2;
      items.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, lx + 16, legendY + 2);
        lx += 16 + ctx.measureText(item.label).width + 20;
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