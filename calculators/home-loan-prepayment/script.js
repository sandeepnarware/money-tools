document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('prepaymentForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultOriginalEmi = document.getElementById('resultOriginalEmi');
  const resultOrigInterest = document.getElementById('resultOrigInterest');
  const resultOrigPayment = document.getElementById('resultOrigPayment');
  const resultNewInterest = document.getElementById('resultNewInterest');
  const resultInterestSaved = document.getElementById('resultInterestSaved');
  const resultTenureReduction = document.getElementById('resultTenureReduction');
  const chartCanvas = document.getElementById('prepaymentChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('loanAmount').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const tenureYears = parseFloat(document.getElementById('loanTenure').value);
    const prepayAmount = parseFloat(document.getElementById('prepayAmount').value);
    const prepayAfter = parseFloat(document.getElementById('prepayAfter').value);
    const prepayFreq = document.getElementById('prepayFreq').value;

    if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate <= 0 || isNaN(tenureYears) || tenureYears <= 0 || isNaN(prepayAmount) || prepayAmount <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r = annualRate / 12 / 100;
    const n = tenureYears * 12;

    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPaymentOriginal = emi * n;
    const totalInterestOriginal = totalPaymentOriginal - P;

    let newTotalInterest, newTotalPayment, tenureReductionMonths;

    if (prepayFreq === 'One Time') {
      const prepayMonths = Math.min(Math.round(prepayAfter * 12), n - 1);
      const remainingBalance = P * (Math.pow(1 + r, n) - Math.pow(1 + r, prepayMonths)) / (Math.pow(1 + r, n) - 1);
      const newBalance = Math.max(0, remainingBalance - prepayAmount);

      if (newBalance <= 0) {
        newTotalPayment = emi * prepayMonths + prepayAmount;
        newTotalInterest = newTotalPayment - P;
        tenureReductionMonths = n - prepayMonths;
      } else {
        const newTenureMonths = Math.ceil(Math.log(1 - newBalance * r / emi) / Math.log(1 + r) + 0.0001);
        newTotalPayment = emi * prepayMonths + emi * newTenureMonths;
        newTotalInterest = newTotalPayment - P;
        tenureReductionMonths = n - prepayMonths - newTenureMonths;
      }
    } else {
      const newEmi = emi + prepayAmount;
      const newTenureMonths = Math.ceil(Math.log(1 - P * r / newEmi) / Math.log(1 + r) + 0.0001);
      newTotalPayment = newEmi * newTenureMonths;
      newTotalInterest = newTotalPayment - P;
      tenureReductionMonths = n - newTenureMonths;
    }

    const interestSaved = Math.max(0, totalInterestOriginal - newTotalInterest);
    const absReduction = Math.abs(tenureReductionMonths);
    const tenureYearsRed = Math.floor(absReduction / 12);
    const tenureMonthsRed = Math.round(absReduction % 12);
    const tenureText = tenureReductionMonths >= 0
      ? tenureYearsRed + ' Yrs ' + tenureMonthsRed + ' Mo'
      : '0 Yrs 0 Mo';

    resultOriginalEmi.textContent = '\u20B9 ' + formatNumber(Math.round(emi));
    resultOrigInterest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterestOriginal));
    resultOrigPayment.textContent = '\u20B9 ' + formatNumber(Math.round(totalPaymentOriginal));
    resultNewInterest.textContent = '\u20B9 ' + formatNumber(Math.round(newTotalInterest));
    resultInterestSaved.textContent = '\u20B9 ' + formatNumber(Math.round(interestSaved));
    resultTenureReduction.textContent = tenureText;

    drawChart(interestSaved, newTotalInterest);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(interestSaved, interestPaid) {
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
    const total = interestSaved + interestPaid;

    ctx.clearRect(0, 0, displaySize, displaySize);

    if (total === 0) return;

    const segs = [
      { label: 'Interest Saved', value: interestSaved, color: '#00652c' },
      { label: 'Interest Paid', value: interestPaid, color: '#005c8e' },
    ];

    let startTime, animId;

    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);

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
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, currentStart, end);
          ctx.closePath();
          ctx.fillStyle = seg.color;
          ctx.fill();
          ctx.stroke();
        }

        currentStart = segEnd;
      });

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      const legendY = displaySize - 6;
      ctx.fillStyle = '#00652c';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Interest Saved', 26, legendY + 2);

      ctx.fillStyle = '#005c8e';
      ctx.fillRect(140, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.fillText('Interest Paid', 156, legendY + 2);
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
