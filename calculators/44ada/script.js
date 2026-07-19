document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adaForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultPresumptiveIncome = document.getElementById('resultPresumptiveIncome');
  const resultTotalIncome = document.getElementById('resultTotalIncome');
  const resultTaxLiability = document.getElementById('resultTaxLiability');
  const resultAlreadyPaid = document.getElementById('resultAlreadyPaid');
  const resultPayableLabel = document.getElementById('resultPayableLabel');
  const resultPayable = document.getElementById('resultPayable');
  const chartCanvas = document.getElementById('adaChart');

  document.getElementById('presumptiveRate').addEventListener('change', function() {
    document.getElementById('specialRateGroup').style.display = this.value === 'special' ? 'block' : 'none';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const gross = parseFloat(document.getElementById('grossReceipts').value);
    const rateType = document.getElementById('presumptiveRate').value;
    const specialRate = rateType === 'special' ? parseFloat(document.getElementById('specialRate').value) : 50;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value);
    const advanceTax = parseFloat(document.getElementById('advanceTax').value);
    const tdsDeducted = parseFloat(document.getElementById('tdsDeducted').value);

    if (!gross || gross <= 0) {
      alert('Please enter valid gross receipts.');
      return;
    }

    const presumptiveIncome = gross * (rateType === 'special' ? specialRate : 50) / 100;
    const totalIncome = presumptiveIncome + otherIncome;

    let tax = 0;
    if (totalIncome > 250000) {
      const slab1 = Math.min(totalIncome, 500000) - 250000;
      const slab2 = Math.min(totalIncome, 1000000) - 500000;
      const slab3 = totalIncome - 1000000;

      if (slab1 > 0) tax += slab1 * 0.05;
      if (slab2 > 0) tax += slab2 * 0.20;
      if (slab3 > 0) tax += slab3 * 0.30;
    }

    const cess = tax * 0.04;
    const taxLiability = tax + cess;

    const alreadyPaid = advanceTax + tdsDeducted;
    const netPayable = Math.max(0, taxLiability - alreadyPaid);
    const refund = Math.max(0, alreadyPaid - taxLiability);

    resultPresumptiveIncome.textContent = '\u20B9 ' + formatNumber(Math.round(presumptiveIncome));
    resultTotalIncome.textContent = '\u20B9 ' + formatNumber(Math.round(totalIncome));
    resultTaxLiability.textContent = '\u20B9 ' + formatNumber(Math.round(taxLiability));

    const paidDisplay = alreadyPaid;
    resultAlreadyPaid.textContent = '\u20B9 ' + formatNumber(Math.round(paidDisplay));

    if (refund > 0) {
      resultPayableLabel.textContent = 'Refund';
      resultPayable.className = 'value danger';
      resultPayable.textContent = '\u20B9 ' + formatNumber(Math.round(refund));
    } else {
      resultPayableLabel.textContent = 'Tax Payable';
      resultPayable.className = 'value success';
      resultPayable.textContent = '\u20B9 ' + formatNumber(Math.round(netPayable));
    }

    drawChart(taxLiability, alreadyPaid);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(taxLiability, alreadyPaid) {
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
    const total = taxLiability + alreadyPaid;
    const segs = [
      { label: 'Tax Due', value: taxLiability, color: '#ba1a1a' },
      { label: 'Paid', value: alreadyPaid, color: '#00652c' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.closePath(); ctx.fillStyle = '#94a3b8'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
        return;
      }
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
      const legendY = displaySize - 6;
      const legendItems = [
        { color: '#ba1a1a', label: 'Tax Due' },
        { color: '#00652c', label: 'Paid' },
      ];
      ctx.font = '12px -apple-system, sans-serif';
      const totalW = legendItems.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (legendItems.length - 1) * 20;
      let lx = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, lx + 16, legendY + 2);
        lx += 16 + ctx.measureText(item.label).width + 20;
      });
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
