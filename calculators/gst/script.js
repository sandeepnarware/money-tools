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

    const segs = [
      { label: 'Base', value: base, color: '#2563eb' },
      { label: 'GST', value: gst, color: '#f59e0b' },
    ];

    let startTime, animId;

    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);

      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;

      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;

        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, currentStart, end);
          ctx.closePath();
          ctx.fillStyle = seg.color;
          ctx.fill();
        }

        currentStart = segEnd;
      });

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
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
