document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stockTaxForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultHoldingPeriod = document.getElementById('resultSHoldingPeriod');
  const resultGain = document.getElementById('resultSGain');
  const resultGainType = document.getElementById('resultSGainType');
  const resultTaxableGain = document.getElementById('resultSTaxableGain');
  const resultTaxAmount = document.getElementById('resultSTaxAmount');
  const chartCanvas = document.getElementById('stockTaxChart');

  const purchaseYear = document.getElementById('stockPurchaseYear');
  const saleYear = document.getElementById('stockSaleYear');

  const CII = {
    2020: 263, 2021: 280, 2022: 298, 2023: 317, 2024: 337,
    2025: 358, 2026: 400
  };

  function populateYears(sel, start, end, defaultVal) {
    for (let y = end; y >= start; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      if (y === defaultVal) opt.selected = true;
      sel.appendChild(opt);
    }
  }

  populateYears(purchaseYear, 2020, 2026, 2024);
  populateYears(saleYear, 2021, 2026, 2026);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const category = document.getElementById('stockCategory').value;
    const buyPrice = parseFloat(document.getElementById('purchasePrice').value);
    const sellPrice = parseFloat(document.getElementById('salePrice').value);
    const shares = parseFloat(document.getElementById('numShares').value);
    const pYear = parseInt(purchaseYear.value);
    const sYear = parseInt(saleYear.value);
    const in30Bracket = document.getElementById('stock30Bracket').checked;

    if (!buyPrice || !sellPrice || !shares || buyPrice <= 0 || sellPrice <= 0 || shares <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    if (sYear <= pYear) {
      alert('Sale year must be after purchase year.');
      return;
    }

    const holding = sYear - pYear;
    const totalGain = (sellPrice - buyPrice) * shares;
    resultHoldingPeriod.textContent = holding + ' years';
    resultGain.textContent = '\u20B9 ' + formatNumber(Math.round(totalGain));

    let gainType, taxableGain, tax;

    if (category === 'Listed') {
      if (holding < 1) {
        gainType = 'STCG (Listed)';
        taxableGain = totalGain;
        tax = taxableGain * 0.15;
      } else {
        gainType = 'LTCG (Listed)';
        taxableGain = Math.max(0, totalGain - 100000);
        tax = taxableGain * 0.10;
      }
    } else {
      if (holding < 2) {
        gainType = 'STCG (Unlisted)';
        taxableGain = totalGain;
        tax = in30Bracket ? taxableGain * 0.30 : taxableGain * 0.30;
      } else {
        gainType = 'LTCG (Unlisted with indexation)';
        const indexedCost = buyPrice * shares * (CII[sYear] || 400) / (CII[pYear] || 263);
        const indexedGain = (sellPrice * shares) - indexedCost;
        taxableGain = Math.max(0, indexedGain);
        tax = taxableGain * 0.20;
      }
    }

    resultGainType.textContent = gainType;
    resultTaxableGain.textContent = '\u20B9 ' + formatNumber(Math.round(taxableGain));
    resultTaxAmount.textContent = '\u20B9 ' + formatNumber(Math.round(tax));

    drawChart(totalGain, tax);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(gain, tax) {
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
    const total = gain + tax;
    const segs = [
      { label: 'Gain', value: gain, color: '#16a34a' },
      { label: 'Tax', value: tax, color: '#ef4444' },
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
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(10, ly - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Gain', 26, ly + 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(80, ly - 10, 12, 12);
      ctx.fillText('Tax', 96, ly + 2);
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
