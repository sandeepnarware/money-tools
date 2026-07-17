document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('scssForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalDeposit = document.getElementById('resultTotalDeposit');
  const resultQuarterlyPayout = document.getElementById('resultQuarterlyPayout');
  const resultAnnualIncome = document.getElementById('resultAnnualIncome');
  const resultTotalInterest = document.getElementById('resultTotalInterest');
  const resultMaturityAmount = document.getElementById('resultMaturityAmount');
  const chartCanvas = document.getElementById('scssChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const deposit = parseFloat(document.getElementById('depositAmount').value);
    const scssRate = parseFloat(document.getElementById('scssRate').value);
    const age = parseFloat(document.getElementById('seniorAge').value);

    if (!deposit || !scssRate || !age || deposit <= 0 || scssRate <= 0 || age < 60) {
      alert('Please enter valid positive values. Age must be 60 or above.');
      return;
    }

    const quarterlyPayout = deposit * scssRate / 100 / 4;
    const annualIncome = quarterlyPayout * 4;
    const totalInterest = annualIncome * 5;
    const maturityAmount = deposit;

    resultTotalDeposit.textContent = '\u20B9 ' + formatNumber(Math.round(deposit));
    resultQuarterlyPayout.textContent = '\u20B9 ' + formatNumber(Math.round(quarterlyPayout));
    resultAnnualIncome.textContent = '\u20B9 ' + formatNumber(Math.round(annualIncome));
    resultTotalInterest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));
    resultMaturityAmount.textContent = '\u20B9 ' + formatNumber(Math.round(maturityAmount));

    drawChart(deposit, totalInterest);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(principal, interest) {
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
    const total = principal + interest;

    const prinAngle = (principal / total) * Math.PI * 2;
    const intAngle = (interest / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + prinAngle);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + prinAngle, -Math.PI / 2 + prinAngle + intAngle);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Principal', 26, legendY + 2);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(110, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Interest', 126, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
