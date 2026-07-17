document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('btForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultCurrEMI = document.getElementById('resultCurrEMI');
  const resultNewEMI = document.getElementById('resultNewEMI');
  const resultMonthlySavings = document.getElementById('resultMonthlySavings');
  const resultTotalSavings = document.getElementById('resultTotalSavings');
  const resultNetSavings = document.getElementById('resultNetSavings');
  const chartCanvas = document.getElementById('btChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('currentBalance').value);
    const currRate = parseFloat(document.getElementById('currentRate').value);
    const newRate = parseFloat(document.getElementById('newRate').value);
    const n = parseFloat(document.getElementById('remainingTenure').value);
    const fee = parseFloat(document.getElementById('processingFee').value);

    if (!P || !currRate || !newRate || !n || P <= 0 || currRate <= 0 || newRate <= 0 || n <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r1 = currRate / 12 / 100;
    const r2 = newRate / 12 / 100;

    const emi1 = P * r1 * Math.pow(1 + r1, n) / (Math.pow(1 + r1, n) - 1);
    const emi2 = P * r2 * Math.pow(1 + r2, n) / (Math.pow(1 + r2, n) - 1);

    const totalInterest1 = emi1 * n - P;
    const totalInterest2 = emi2 * n - P;
    const savings = totalInterest1 - totalInterest2;
    const net = savings - fee;

    resultCurrEMI.textContent = '\u20B9 ' + formatNumber(Math.round(emi1));
    resultNewEMI.textContent = '\u20B9 ' + formatNumber(Math.round(emi2));
    resultMonthlySavings.textContent = '\u20B9 ' + formatNumber(Math.round(emi1 - emi2));
    resultTotalSavings.textContent = '\u20B9 ' + formatNumber(Math.round(savings));
    resultNetSavings.textContent = '\u20B9 ' + formatNumber(Math.round(net));

    drawChart(totalInterest1, totalInterest2, fee);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(interestCurr, interestNew, fee) {
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
    const total = interestCurr + interestNew + fee;

    const ang1 = (interestCurr / total) * Math.PI * 2;
    const ang2 = (interestNew / total) * Math.PI * 2;
    const ang3 = (fee / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + ang1);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + ang1, -Math.PI / 2 + ang1 + ang2);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + ang1 + ang2, -Math.PI / 2 + ang1 + ang2 + ang3);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    const ly = displaySize - 6;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(10, ly - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Current Interest', 26, ly + 2);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(150, ly - 10, 12, 12);
    ctx.fillText('New Interest', 166, ly + 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(260, ly - 10, 12, 12);
    ctx.fillText('Fees', 276, ly + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
