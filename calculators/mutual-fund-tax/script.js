document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mfTaxForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultHoldingPeriod = document.getElementById('resultHoldingPeriod');
  const resultCapitalGain = document.getElementById('resultCapitalGain');
  const resultGainType = document.getElementById('resultGainType');
  const resultTaxableGain = document.getElementById('resultTaxableGain');
  const resultTaxAmount = document.getElementById('resultTaxAmount');
  const chartCanvas = document.getElementById('mfTaxChart');

  const cii = { 2020: 301, 2021: 317, 2022: 331, 2023: 348, 2024: 363, 2025: 380, 2026: 400 };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const category = document.getElementById('fundCategory').value;
    const purchaseNav = parseFloat(document.getElementById('purchaseNav').value);
    const saleNav = parseFloat(document.getElementById('saleNav').value);
    const units = parseFloat(document.getElementById('units').value);
    const purchaseYear = parseInt(document.getElementById('purchaseYear').value);
    const saleYear = parseInt(document.getElementById('saleYear').value);
    const isThirtyPercent = document.getElementById('isThirtyPercentBracket').checked;
    const ltcgExemption = parseFloat(document.getElementById('ltcgExemption').value);

    if (!purchaseNav || !saleNav || !units || purchaseNav <= 0 || saleNav <= 0 || units <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    if (saleYear <= purchaseYear) {
      alert('Sale year must be after purchase year.');
      return;
    }

    const holding = saleYear - purchaseYear;
    const gain = (saleNav - purchaseNav) * units;

    resultHoldingPeriod.textContent = holding + ' yr' + (holding > 1 ? 's' : '');

    let effectiveCategory = category;
    if (category === 'hybrid') {
      effectiveCategory = 'equity';
    }

    let gainType, taxableGain, taxAmount;

    if (effectiveCategory === 'equity') {
      if (holding < 1) {
        gainType = 'Short Term';
        taxableGain = gain;
        taxAmount = gain * 0.15;
      } else {
        gainType = 'Long Term';
        taxableGain = Math.max(0, gain - ltcgExemption);
        taxAmount = taxableGain * 0.10;
      }
    } else {
      if (holding < 3) {
        gainType = 'Short Term';
        taxableGain = gain;
        taxAmount = isThirtyPercent ? gain * 0.30 : 0;
      } else {
        gainType = 'Long Term';
        const saleValue = saleNav * units;
        const indexedCost = purchaseNav * units * cii[saleYear] / cii[purchaseYear];
        taxableGain = Math.max(0, saleValue - indexedCost);
        taxAmount = taxableGain * 0.20;
      }
    }

    resultCapitalGain.textContent = '\u20B9 ' + formatNumber(Math.round(gain));
    resultGainType.textContent = gainType;
    resultTaxableGain.textContent = '\u20B9 ' + formatNumber(Math.round(taxableGain));
    resultTaxAmount.textContent = '\u20B9 ' + formatNumber(Math.round(taxAmount));

    drawChart(taxAmount, gain - taxAmount);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(tax, netGain) {
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
    const total = tax + netGain;
    const segs = [
      { label: 'Net Gain', value: netGain, color: '#00652c' },
      { label: 'Tax', value: tax, color: '#ba1a1a' },
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
      ctx.font = '12px -apple-system, sans-serif';
      const items = segs.filter(s => s.value > 0);
      const totalW = items.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (items.length - 1) * 20;
      let lx = (displaySize - totalW) / 2;
      items.forEach(item => {
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

    let angleCursor = -Math.PI / 2;
    const regions = segs.filter(s => s.value > 0).map(seg => {
      const sliceAngle = (seg.value / total) * Math.PI * 2;
      const region = {
        type: 'arc', cx, cy, rInner: radius * 0.82, rOuter: radius,
        start: angleCursor, end: angleCursor + sliceAngle,
        label: seg.label, value: '₹ ' + formatNumber(Math.round(seg.value)), color: seg.color,
      };
      angleCursor += sliceAngle;
      return region;
    });
    ChartTooltip.bind(chartCanvas, regions);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
