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

    const riskAngle = (risk / total) * Math.PI * 2;
    const rewardAngle = (reward / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + riskAngle);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + riskAngle, -Math.PI / 2 + riskAngle + rewardAngle);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Risk Amount', 26, legendY + 2);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(120, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Reward Amount', 136, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});