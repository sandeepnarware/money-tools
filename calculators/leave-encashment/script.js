document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('leaveEncashForm');
  const resultsSection = document.getElementById('resultsSection');
  const resultPerDaySalary = document.getElementById('resultPerDaySalary');
  const resultEncashmentAmount = document.getElementById('resultEncashmentAmount');
  const resultMaxDaysAllowed = document.getElementById('resultMaxDaysAllowed');
  const resultTaxableAmount = document.getElementById('resultTaxableAmount');
  const chartCanvas = document.getElementById('leaveEncashChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const basicDa = parseFloat(document.getElementById('basicDa').value);
    const leaveDays = parseFloat(document.getElementById('leaveDays').value);
    const maxDays = parseFloat(document.getElementById('maxDaysEncashable').value);
    const isRetiring = document.getElementById('isRetiring').value === 'yes';

    if (!basicDa || basicDa <= 0) {
      alert('Please enter a valid salary.');
      return;
    }

    const perDaySalary = (basicDa * 12) / 365;
    const daysEncashable = Math.min(leaveDays, maxDays);
    const encashmentAmount = perDaySalary * daysEncashable;

    let taxable;
    if (isRetiring) {
      const exempt = Math.min(encashmentAmount, 300000, perDaySalary * 10 * 30);
      taxable = Math.max(0, encashmentAmount - exempt);
    } else {
      taxable = encashmentAmount;
    }

    resultPerDaySalary.textContent = '\u20B9 ' + formatNumber(Math.round(perDaySalary));
    resultEncashmentAmount.textContent = '\u20B9 ' + formatNumber(Math.round(encashmentAmount));
    resultMaxDaysAllowed.textContent = formatNumber(maxDays);
    resultTaxableAmount.textContent = '\u20B9 ' + formatNumber(Math.round(taxable));

    drawChart(encashmentAmount, taxable, isRetiring);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(total, taxable, isRetiring) {
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
    const exempt = Math.max(0, total - taxable);

    ctx.clearRect(0, 0, displaySize, displaySize);

    const exemptAngle = (exempt / total) * Math.PI * 2;
    const taxableAngle = (taxable / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + exemptAngle);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + exemptAngle, -Math.PI / 2 + exemptAngle + taxableAngle);
    ctx.closePath();
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Exempt', 26, legendY + 2);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(90, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Taxable', 106, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
