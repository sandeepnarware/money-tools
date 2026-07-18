document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('tlhForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultCurrentGain = document.getElementById('resultCurrentGain');
  const resultTaxWithout = document.getElementById('resultTaxWithout');
  const resultAfterGain = document.getElementById('resultAfterGain');
  const resultTaxWith = document.getElementById('resultTaxWith');
  const resultTaxSaved = document.getElementById('resultTaxSaved');
  const chartCanvas = document.getElementById('tlhChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const gains = parseFloat(document.getElementById('realizedGains').value);
    const losses = parseFloat(document.getElementById('realizedLosses').value);
    const unrealized = parseFloat(document.getElementById('unrealizedLosses').value);
    const taxRate = parseFloat(document.getElementById('taxBracket').value);

    if (gains < 0 || losses < 0 || unrealized < 0 || taxRate < 0) {
      alert('Please enter non-negative values.');
      return;
    }

    const currentNet = Math.max(0, gains - losses);
    const taxWithout = gains * (taxRate / 100);
    const afterHarvesting = Math.max(0, currentNet - unrealized);
    const taxWith = afterHarvesting * (taxRate / 100);
    const saved = taxWithout - taxWith;

    resultCurrentGain.textContent = '\u20B9 ' + formatNumber(Math.round(currentNet));
    resultTaxWithout.textContent = '\u20B9 ' + formatNumber(Math.round(taxWithout));
    resultAfterGain.textContent = '\u20B9 ' + formatNumber(Math.round(afterHarvesting));
    resultTaxWith.textContent = '\u20B9 ' + formatNumber(Math.round(taxWith));
    resultTaxSaved.textContent = '\u20B9 ' + formatNumber(Math.round(saved));

    drawChart(saved, taxWith);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(saved, taxPaid) {
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
    const total = saved + taxPaid;

    const segs = [
      { label: 'Tax Saved', value: saved, color: '#16a34a' },
      { label: 'Tax Paid', value: taxPaid, color: '#ef4444' },
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
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();

      const ly = displaySize - 6;
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(10, ly - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Tax Saved', 26, ly + 2);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(110, ly - 10, 12, 12);
      ctx.fillText('Tax Paid', 126, ly + 2);
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
