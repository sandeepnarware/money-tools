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

    if (isNaN(P) || P <= 0 || isNaN(currRate) || currRate <= 0 || isNaN(newRate) || newRate <= 0 || isNaN(n) || n <= 0) {
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
    const segs = [
      { label: 'Current Interest', value: interestCurr, color: '#ef4444' },
      { label: 'New Interest', value: interestNew, color: '#16a34a' },
      { label: 'Fees', value: fee, color: '#f59e0b' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) return;
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
      const ly = displaySize - 6;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, ly - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Current Interest', 26, ly + 2);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(150, ly - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('New Interest', 166, ly + 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(260, ly - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Fees', 276, ly + 2);
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
