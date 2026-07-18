document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('hufForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTaxWithout = document.getElementById('resultTaxWithout');
  const resultIndivWith = document.getElementById('resultIndivWith');
  const resultHufTax = document.getElementById('resultHufTax');
  const resultTotalWith = document.getElementById('resultTotalWith');
  const resultSaved = document.getElementById('resultSaved');
  const chartCanvas = document.getElementById('hufChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calcTax(income) {
    let tax = 0;
    if (income > 1000000) {
      tax += (income - 1000000) * 0.30;
      income = 1000000;
    }
    if (income > 500000) {
      tax += (income - 500000) * 0.20;
      income = 500000;
    }
    if (income > 250000) {
      tax += (income - 250000) * 0.05;
    }
    return tax;
  }

  function calculate() {
    const hufIncome = parseFloat(document.getElementById('hufIncome').value);
    const individualIncome = parseFloat(document.getElementById('individualIncome').value);
    const hufDed = parseFloat(document.getElementById('hufDeductions').value);
    const indivDed = parseFloat(document.getElementById('individualDeductions').value);

    if (individualIncome < 0 || hufIncome < 0) {
      alert('Please enter valid values.');
      return;
    }

    const indivAfterDed = Math.max(0, individualIncome - indivDed);
    const hufAfterDed = Math.max(0, hufIncome - hufDed);

    const taxWithout = calcTax(indivAfterDed + hufAfterDed);
    const taxIndivWith = calcTax(indivAfterDed);
    const taxHuf = calcTax(hufAfterDed);
    const taxTotalWith = taxIndivWith + taxHuf;
    const saved = Math.max(0, taxWithout - taxTotalWith);

    resultTaxWithout.textContent = '\u20B9 ' + formatNumber(Math.round(taxWithout));
    resultIndivWith.textContent = '\u20B9 ' + formatNumber(Math.round(taxIndivWith));
    resultHufTax.textContent = '\u20B9 ' + formatNumber(Math.round(taxHuf));
    resultTotalWith.textContent = '\u20B9 ' + formatNumber(Math.round(taxTotalWith));
    resultSaved.textContent = '\u20B9 ' + formatNumber(Math.round(saved));

    drawChart(taxWithout, taxTotalWith);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(without, withHUF) {
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
    const total = without + withHUF;
    const segs = [
      { label: 'Tax Without HUF', value: without, color: '#ef4444' },
      { label: 'Tax With HUF', value: withHUF, color: '#16a34a' },
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
      ctx.fillText('Tax Without HUF', 26, ly + 2);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(140, ly - 10, 12, 12);
      ctx.fillText('Tax With HUF', 156, ly + 2);
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
