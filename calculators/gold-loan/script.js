document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goldLoanForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultGoldValue = document.getElementById('resultGoldValue');
  const resultLoanAmt = document.getElementById('resultLoanAmt');
  const resultLoanEmi = document.getElementById('resultLoanEmi');
  const resultLoanInterest = document.getElementById('resultLoanInterest');
  const resultLoanPayment = document.getElementById('resultLoanPayment');
  const chartCanvas = document.getElementById('goldLoanChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const weight = parseFloat(document.getElementById('goldWeight').value);
    const rate = parseFloat(document.getElementById('goldRate').value);
    const ltv = parseFloat(document.getElementById('loanLtv').value);
    const annualRate = parseFloat(document.getElementById('loanInterest').value);
    const months = parseFloat(document.getElementById('loanTenure').value);

    if (!weight || !rate || !ltv || !annualRate || !months || weight <= 0 || rate <= 0 || ltv <= 0 || annualRate <= 0 || months <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const goldValue = weight * rate;
    const loanAmt = goldValue * (ltv / 100);
    const r = annualRate / 12 / 100;
    const emi = loanAmt * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmt;

    resultGoldValue.textContent = '\u20B9 ' + formatNumber(Math.round(goldValue));
    resultLoanAmt.textContent = '\u20B9 ' + formatNumber(Math.round(loanAmt));
    resultLoanEmi.textContent = '\u20B9 ' + formatNumber(Math.round(emi));
    resultLoanInterest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));
    resultLoanPayment.textContent = '\u20B9 ' + formatNumber(Math.round(totalPayment));

    drawChart(loanAmt, totalInterest);
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

    const segs = [
      { label: 'Principal', value: principal, color: '#2563eb' },
      { label: 'Interest', value: interest, color: '#f59e0b' },
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
      ctx.fillText('Principal', 26, legendY + 2);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(110, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Interest', 126, legendY + 2);
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