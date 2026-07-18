document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('freelancerTaxForm');
  const resultsSection = document.getElementById('resultsSection');
  const resultGrossIncome = document.getElementById('resultGrossIncome');
  const resultExpenses = document.getElementById('resultExpenses');
  const resultNetTaxableIncome = document.getElementById('resultNetTaxableIncome');
  const resultEstimatedTax = document.getElementById('resultEstimatedTax');
  const resultTaxPayable = document.getElementById('resultTaxPayable');
  const labelGrossIncome = document.getElementById('labelGrossIncome');
  const labelExpenses = document.getElementById('labelExpenses');
  const chartCanvas = document.getElementById('freelancerTaxChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const gross = parseFloat(document.getElementById('grossReceipts').value);
    const expenses = parseFloat(document.getElementById('businessExpenses').value);
    const presumptive = document.getElementById('presumptiveTax').value === 'yes';
    const otherIncome = parseFloat(document.getElementById('otherIncome').value);
    const tds = parseFloat(document.getElementById('tdsDeducted').value);
    const advance = parseFloat(document.getElementById('advanceTaxPaid').value);

    if (!gross || gross <= 0) {
      alert('Please enter valid gross receipts.');
      return;
    }

    let businessIncome, expenseLabel, incomeLabel;
    if (presumptive) {
      businessIncome = gross * 0.50;
      expenseLabel = 'Presumptive Deduction (50%)';
      incomeLabel = 'Presumptive Income (50% of Gross)';
    } else {
      businessIncome = gross - expenses;
      expenseLabel = 'Business Expenses';
      incomeLabel = 'Gross Receipts';
    }

    labelGrossIncome.textContent = incomeLabel;
    labelExpenses.textContent = expenseLabel;

    const totalIncome = businessIncome + otherIncome;

    let tax = 0;
    const slabs = [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 5 },
      { min: 500000, max: 1000000, rate: 20 },
      { min: 1000000, max: Infinity, rate: 30 },
    ];

    for (const s of slabs) {
      if (totalIncome > s.min) {
        const taxableInSlab = Math.min(totalIncome, s.max) - s.min;
        tax += taxableInSlab * s.rate / 100;
      }
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;
    const netPayable = Math.max(0, totalTax - tds - advance);

    resultGrossIncome.textContent = '\u20B9 ' + formatNumber(Math.round(businessIncome));
    if (presumptive) {
      resultExpenses.textContent = '\u20B9 ' + formatNumber(Math.round(gross * 0.50));
    } else {
      resultExpenses.textContent = '\u20B9 ' + formatNumber(Math.round(expenses));
    }
    resultNetTaxableIncome.textContent = '\u20B9 ' + formatNumber(Math.round(totalIncome));
    resultEstimatedTax.textContent = '\u20B9 ' + formatNumber(Math.round(totalTax));
    resultTaxPayable.textContent = '\u20B9 ' + formatNumber(Math.round(netPayable));

    drawChart(tax, cess);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(incomeTax, cess) {
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
    const total = incomeTax + cess;

    ctx.clearRect(0, 0, displaySize, displaySize);

    if (total === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No tax liability', cx, cy + 5);
      return;
    }

    const segs = [
      { label: 'Income Tax', value: incomeTax, color: '#2563eb' },
      { label: 'Cess', value: cess, color: '#ea580c' },
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
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Income Tax', 26, legendY + 2);

      ctx.fillStyle = '#ea580c';
      ctx.fillRect(110, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Cess', 126, legendY + 2);
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
