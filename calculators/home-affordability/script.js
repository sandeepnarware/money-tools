document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('homeAffordForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultMaxEMI = document.getElementById('resultMaxEMI');
  const resultMaxLoan = document.getElementById('resultMaxLoan');
  const resultHomePrice = document.getElementById('resultHomePrice');
  const resultDownPayment = document.getElementById('resultDownPayment');
  const resultTotalInterest = document.getElementById('resultTotalInterest');
  const chartCanvas = document.getElementById('homeAffordChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncome').value);
    const existingEMIs = parseFloat(document.getElementById('existingEMIs').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    const rate = parseFloat(document.getElementById('homeLoanRate').value);
    const tenure = parseFloat(document.getElementById('loanTenure').value);

    if (!income || !rate || !tenure || income <= 0 || rate <= 0 || tenure <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const maxEMI = Math.max(0, income * 0.5 - existingEMIs);
    const r = rate / 12 / 100;
    const n = tenure * 12;

    const maxLoan = maxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    const homePrice = maxLoan + downPayment;
    const totalInterest = maxEMI * n - maxLoan;

    resultMaxEMI.textContent = '\u20B9 ' + formatNumber(Math.round(maxEMI));
    resultMaxLoan.textContent = '\u20B9 ' + formatNumber(Math.round(maxLoan));
    resultHomePrice.textContent = '\u20B9 ' + formatNumber(Math.round(homePrice));
    resultDownPayment.textContent = '\u20B9 ' + formatNumber(Math.round(downPayment));
    resultTotalInterest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));

    drawChart(maxLoan, downPayment);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(loan, downPayment) {
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
    const total = loan + downPayment;

    const ang1 = (loan / total) * Math.PI * 2;
    const ang2 = (downPayment / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + ang1);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + ang1, -Math.PI / 2 + ang1 + ang2);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    const ly = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, ly - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Loan Amount', 26, ly + 2);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(120, ly - 10, 12, 12);
    ctx.fillText('Down Payment', 136, ly + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
