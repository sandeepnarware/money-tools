document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('interestSavedForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultOrigEMI = document.getElementById('resultOrigEMI');
  const resultOrigInterest = document.getElementById('resultOrigInterest');
  const resultNewTenure = document.getElementById('resultNewTenure');
  const resultNewInterest = document.getElementById('resultNewInterest');
  const resultSaved = document.getElementById('resultSaved');
  const chartCanvas = document.getElementById('interestSavedChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('loanAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value);
    const years = parseFloat(document.getElementById('originalTenure').value);
    const extra = parseFloat(document.getElementById('extraPayment').value);

    if (isNaN(P) || P <= 0 || isNaN(rate) || rate <= 0 || isNaN(years) || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const n = years * 12;
    const r = rate / 12 / 100;

    const origEMI = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const origInterest = origEMI * n - P;

    const newEMI = origEMI + extra;
    const newTenureMonths = Math.ceil(-Math.log(1 - P * r / newEMI) / Math.log(1 + r));
    const newInterest = newEMI * newTenureMonths - P;
    const savings = Math.max(0, origInterest - newInterest);

    const newYears = Math.floor(newTenureMonths / 12);
    const newMonths = newTenureMonths % 12;

    resultOrigEMI.textContent = '\u20B9 ' + formatNumber(Math.round(origEMI));
    resultOrigInterest.textContent = '\u20B9 ' + formatNumber(Math.round(origInterest));
    resultNewTenure.textContent = newYears + ' Yrs ' + newMonths + ' Mths';
    resultNewInterest.textContent = '\u20B9 ' + formatNumber(Math.round(newInterest));
    resultSaved.textContent = '\u20B9 ' + formatNumber(Math.round(savings));

    drawChart(origInterest, savings);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(origInterest, savings) {
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
    const total = origInterest + savings;
    const segs = [
      { label: 'Interest Paid', value: origInterest, color: '#ef4444' },
      { label: 'Interest Saved', value: savings, color: '#16a34a' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) return;
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      const ly = displaySize - 6;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, ly - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Interest Paid', 26, ly + 2);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(120, ly - 10, 12, 12);
      ctx.fillText('Interest Saved', 136, ly + 2);
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
