document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goldTaxForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultHoldingPeriod = document.getElementById('resultHoldingPeriod');
  const resultCapitalGain = document.getElementById('resultCapitalGain');
  const resultGainType = document.getElementById('resultGainType');
  const resultTaxableGain = document.getElementById('resultTaxableGain');
  const resultTaxAmount = document.getElementById('resultTaxAmount');
  const chartCanvas = document.getElementById('goldTaxChart');

  const purchaseYear = document.getElementById('goldPurchaseYear');
  const saleYear = document.getElementById('goldSaleYear');

  const CII = {
    2001: 100, 2002: 104, 2003: 109, 2004: 113, 2005: 117,
    2006: 122, 2007: 127, 2008: 133, 2009: 140, 2010: 148,
    2011: 156, 2012: 164, 2013: 173, 2014: 183, 2015: 194,
    2016: 205, 2017: 218, 2018: 232, 2019: 247, 2020: 263,
    2021: 280, 2022: 298, 2023: 317, 2024: 337, 2025: 358,
    2026: 400
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

  populateYears(purchaseYear, 2001, 2026, 2020);
  populateYears(saleYear, 2002, 2026, 2026);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const cost = parseFloat(document.getElementById('goldPurchasePrice').value);
    const sale = parseFloat(document.getElementById('goldSalePrice').value);
    const pYear = parseInt(purchaseYear.value);
    const sYear = parseInt(saleYear.value);
    const type = document.getElementById('goldType').value;
    const in30Bracket = document.getElementById('gold30Bracket').checked;

    if (!cost || !sale || cost <= 0 || sale <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    if (sYear <= pYear) {
      alert('Sale year must be after purchase year.');
      return;
    }

    const holding = sYear - pYear;
    const rawGain = sale - cost;
    resultHoldingPeriod.textContent = holding + ' years';

    let gainType, taxableGain, tax;

    if (type === 'SGB') {
      gainType = 'Exempt (SGB)';
      taxableGain = 0;
      tax = 0;
      resultCapitalGain.textContent = '\u20B9 ' + formatNumber(Math.round(rawGain));
    } else if (holding < 3) {
      gainType = 'STCG';
      taxableGain = rawGain;
      tax = in30Bracket ? rawGain * 0.30 : rawGain * 0.30;
      resultCapitalGain.textContent = '\u20B9 ' + formatNumber(Math.round(rawGain));
    } else {
      gainType = 'LTCG (with indexation)';
      const indexedCost = cost * (CII[sYear] || 400) / (CII[pYear] || 100);
      const indexedGain = sale - indexedCost;
      taxableGain = Math.max(0, indexedGain);
      tax = taxableGain * 0.20;
      resultCapitalGain.textContent = '\u20B9 ' + formatNumber(Math.round(rawGain));
    }

    resultGainType.textContent = gainType;
    resultTaxableGain.textContent = '\u20B9 ' + formatNumber(Math.round(taxableGain));
    resultTaxAmount.textContent = '\u20B9 ' + formatNumber(Math.round(tax));

    drawChart(taxableGain, tax);
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

    const ang1 = (gain / total) * Math.PI * 2;
    const ang2 = (tax / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + ang1);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + ang1, -Math.PI / 2 + ang1 + ang2);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

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

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
