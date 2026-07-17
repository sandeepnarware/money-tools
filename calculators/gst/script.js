document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('gstForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultNetAmount = document.getElementById('resultNetAmount');
  const resultGstAmount = document.getElementById('resultGstAmount');
  const resultTotalAmount = document.getElementById('resultTotalAmount');
  const chartCanvas = document.getElementById('gstChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const amount = parseFloat(document.getElementById('gstAmount').value);
    const rate = parseFloat(document.getElementById('gstRate').value);
    const calcType = document.getElementById('calcType').value;

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    let netAmount, gstAmount, totalAmount;

    if (calcType === 'exclusive') {
      netAmount = amount;
      gstAmount = amount * rate / 100;
      totalAmount = amount + gstAmount;
    } else {
      totalAmount = amount;
      netAmount = amount / (1 + rate / 100);
      gstAmount = amount - netAmount;
    }

    resultNetAmount.textContent = '\u20B9 ' + formatNumber(Math.round(netAmount));
    resultGstAmount.textContent = '\u20B9 ' + formatNumber(Math.round(gstAmount));
    resultTotalAmount.textContent = '\u20B9 ' + formatNumber(Math.round(totalAmount));

    drawChart(netAmount, gstAmount);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(base, gst) {
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
    const total = base + gst;

    ctx.clearRect(0, 0, displaySize, displaySize);

    const baseAngle = (base / total) * Math.PI * 2;
    const gstAngle = (gst / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + baseAngle);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + baseAngle, -Math.PI / 2 + baseAngle + gstAngle);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Base', 26, legendY + 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(70, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('GST', 86, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
