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

    const segs = [
      { label: 'Loan Amount', value: loan, color: '#2563eb' },
      { label: 'Down Payment', value: downPayment, color: '#16a34a' },
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
