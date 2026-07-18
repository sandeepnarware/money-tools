const CII = { 2001:100, 2002:105, 2003:109, 2004:113, 2005:117, 2006:122, 2007:129, 2008:137, 2009:148, 2010:167, 2011:184, 2012:200, 2013:220, 2014:240, 2015:254, 2016:264, 2017:272, 2018:280, 2019:289, 2020:301, 2021:317, 2022:331, 2023:348, 2024:363, 2025:380, 2026:400 };

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('capitalGainsForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultHoldingPeriod = document.getElementById('resultHoldingPeriod');
  const resultGainType = document.getElementById('resultGainType');
  const resultTotalGain = document.getElementById('resultTotalGain');
  const resultTaxableGain = document.getElementById('resultTaxableGain');
  const resultTaxAmount = document.getElementById('resultTaxAmount');
  const chartCanvas = document.getElementById('capitalGainsChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const assetType = document.getElementById('assetType').value;
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const salePrice = parseFloat(document.getElementById('salePrice').value);
    const purchaseYear = parseInt(document.getElementById('purchaseYear').value);
    const saleYear = parseInt(document.getElementById('saleYear').value);
    const exemptionLimit = parseFloat(document.getElementById('exemptionLimit').value);
    const highTaxBracket = document.getElementById('highTaxBracket').checked;

    if (!purchasePrice || !salePrice || !purchaseYear || !saleYear || purchasePrice <= 0 || salePrice <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    if (saleYear <= purchaseYear) {
      alert('Sale year must be after purchase year.');
      return;
    }

    const holdingPeriod = saleYear - purchaseYear;
    const simpleGain = salePrice - purchasePrice;

    let gainType, totalGain, taxableGain, taxAmount;

    if (assetType === 'equity') {
      if (holdingPeriod < 1) {
        gainType = 'Short Term';
        totalGain = simpleGain;
        taxableGain = simpleGain;
        taxAmount = taxableGain * 0.15;
      } else {
        gainType = 'Long Term';
        totalGain = simpleGain;
        taxableGain = simpleGain > exemptionLimit ? simpleGain - exemptionLimit : 0;
        taxAmount = taxableGain * 0.10;
      }
    } else if (assetType === 'debt') {
      if (holdingPeriod < 3) {
        gainType = 'Short Term';
        totalGain = simpleGain;
        taxableGain = simpleGain;
        const slabRate = highTaxBracket ? 30 : 20;
        taxAmount = taxableGain * (slabRate / 100);
      } else {
        gainType = 'Long Term';
        totalGain = simpleGain;
        const ciiPurchase = CII[purchaseYear];
        const ciiSale = CII[saleYear];
        if (ciiPurchase && ciiSale) {
          const indexedCost = purchasePrice * ciiSale / ciiPurchase;
          const indexedGain = salePrice - indexedCost;
          taxableGain = Math.max(0, indexedGain);
          taxAmount = taxableGain * 0.20;
        } else {
          taxableGain = Math.max(0, simpleGain);
          taxAmount = taxableGain * 0.20;
        }
      }
    } else if (assetType === 'realestate') {
      if (holdingPeriod < 2) {
        gainType = 'Short Term';
        totalGain = simpleGain;
        taxableGain = simpleGain;
        const slabRate = highTaxBracket ? 30 : 20;
        taxAmount = taxableGain * (slabRate / 100);
      } else {
        gainType = 'Long Term';
        totalGain = simpleGain;
        const ciiPurchase = CII[purchaseYear];
        const ciiSale = CII[saleYear];
        if (ciiPurchase && ciiSale) {
          const indexedCost = purchasePrice * ciiSale / ciiPurchase;
          const indexedGain = salePrice - indexedCost;
          taxableGain = Math.max(0, indexedGain);
          taxAmount = taxableGain * 0.20;
        } else {
          taxableGain = Math.max(0, simpleGain);
          taxAmount = taxableGain * 0.20;
        }
      }
    }

    resultHoldingPeriod.textContent = holdingPeriod + ' years';
    resultGainType.textContent = gainType;
    resultTotalGain.textContent = '\u20B9 ' + formatNumber(Math.round(totalGain));
    resultTaxableGain.textContent = '\u20B9 ' + formatNumber(Math.round(taxableGain));
    resultTaxAmount.textContent = '\u20B9 ' + formatNumber(Math.round(taxAmount));

    drawChart(taxAmount, totalGain - taxAmount);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(taxAmount, netGain) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displaySize = Math.min(300, containerWidth);
    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const radius = displaySize / 2 - 20;
    const total = taxAmount + netGain;

    if (total <= 0) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      return;
    }

    const segs = [
      { label: 'Tax Amount', value: taxAmount, color: '#ef4444' },
      { label: 'Net Gain', value: netGain, color: '#16a34a' },
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
      ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      const legendY = displaySize - 6;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Tax Amount', 26, legendY + 2);

      ctx.fillStyle = '#16a34a';
      ctx.fillRect(120, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Net Gain', 136, legendY + 2);
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
