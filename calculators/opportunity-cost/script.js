document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ocForm');
  const resultsSection = document.getElementById('resultsSection');

  const cmpLendMaturity = document.getElementById('cmpLendMaturity');
  const cmpFdMaturity = document.getElementById('cmpFdMaturity');
  const cmpMfMaturity = document.getElementById('cmpMfMaturity');
  const cmpLendInflAdj = document.getElementById('cmpLendInflAdj');
  const cmpFdInflAdj = document.getElementById('cmpFdInflAdj');
  const cmpMfInflAdj = document.getElementById('cmpMfInflAdj');
  const cmpLendGain = document.getElementById('cmpLendGain');
  const cmpFdGain = document.getElementById('cmpFdGain');
  const cmpMfGain = document.getElementById('cmpMfGain');
  const insightText = document.getElementById('insightText');
  const chartCanvas = document.getElementById('ocChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('principal').value);
    const years = parseFloat(document.getElementById('timePeriod').value);
    const inflation = parseFloat(document.getElementById('inflationRate').value);
    const fdRate = parseFloat(document.getElementById('fdRate').value);
    const mfRate = parseFloat(document.getElementById('mfRate').value);

    if (isNaN(P) || P <= 0 || isNaN(years) || years <= 0) {
      alert('Please enter valid positive values for Principal and Time Period.');
      return;
    }

    const lendMaturity = P;
    const fdMaturity = P * Math.pow(1 + fdRate / 100, years);
    const mfMaturity = P * Math.pow(1 + mfRate / 100, years);

    const inflFactor = Math.pow(1 + inflation / 100, years);
    const lendInflAdj = lendMaturity / inflFactor;
    const fdInflAdj = fdMaturity / inflFactor;
    const mfInflAdj = mfMaturity / inflFactor;

    const lendGain = lendInflAdj - P;
    const fdGain = fdInflAdj - P;
    const mfGain = mfInflAdj - P;

    cmpLendMaturity.textContent = '\u20B9 ' + formatNumber(Math.round(lendMaturity));
    cmpFdMaturity.textContent = '\u20B9 ' + formatNumber(Math.round(fdMaturity));
    cmpMfMaturity.textContent = '\u20B9 ' + formatNumber(Math.round(mfMaturity));

    cmpLendInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(lendInflAdj));
    cmpFdInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(fdInflAdj));
    cmpMfInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(mfInflAdj));

    cmpLendGain.textContent = formatCurrency(lendGain);
    cmpFdGain.textContent = formatCurrency(fdGain);
    cmpMfGain.textContent = formatCurrency(mfGain);

    const lossAmount = P - lendInflAdj;
    insightText.innerHTML =
      'If you lend <strong>\u20B9 ' + formatNumber(Math.round(P)) + '</strong> and get it back after <strong>' + years + ' years</strong>, ' +
      'inflation will erode its value to just <strong>\u20B9 ' + formatNumber(Math.round(lendInflAdj)) + '</strong> ' +
      '&mdash; a loss of <strong style="color:#ba1a1a;">\u20B9 ' + formatNumber(Math.round(lossAmount)) + '</strong> in purchasing power.' +
      '<br><br>' +
      'Had you invested in <strong>FD</strong> at ' + fdRate + '%, the corpus would be <strong>\u20B9 ' + formatNumber(Math.round(fdMaturity)) + '</strong> ' +
      '(\u20B9 ' + formatNumber(Math.round(fdInflAdj)) + ' in today\'s value, a real gain of <strong style="color:' + (fdGain >= 0 ? '#00652c' : '#ba1a1a') + ';">' + formatCurrency(fdGain) + '</strong>).' +
      '<br><br>' +
      'With <strong>MF</strong> at ' + mfRate + '%, the corpus would be <strong>\u20B9 ' + formatNumber(Math.round(mfMaturity)) + '</strong> ' +
      '(\u20B9 ' + formatNumber(Math.round(mfInflAdj)) + ' in today\'s value, a real gain of <strong style="color:' + (mfGain >= 0 ? '#00652c' : '#ba1a1a') + ';">' + formatCurrency(mfGain) + '</strong>).';

    drawChart(P, lendMaturity, lendInflAdj, fdMaturity, fdInflAdj, mfMaturity, mfInflAdj);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(P, lendM, lendI, fdM, fdI, mfM, mfI) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = Math.round(displayW * 0.55);
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const padding = { top: 24, right: 20, bottom: 44, left: 64 };
    const chartW = displayW - padding.left - padding.right;
    const chartH = displayH - padding.top - padding.bottom;

    const values = [lendM, lendI, fdM, fdI, mfM, mfI];
    const maxVal = Math.max(...values) * 1.15;

    const groups = [
      { label: 'Just Get Back', bars: [lendM, lendI] },
      { label: 'FD', bars: [fdM, fdI] },
      { label: 'MF', bars: [mfM, mfI] },
    ];

    const groupWidth = chartW / groups.length;
    const barWidth = groupWidth * 0.3;
    const barOffset = (groupWidth - barWidth * 2) / 3;

    function getY(val) {
      return padding.top + chartH - (val / maxVal) * chartH;
    }

    function drawBar(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }

    // Grid
    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = 1;
    const ySteps = 5;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#545f73';
    ctx.font = '11px -apple-system, sans-serif';
    for (let i = 0; i <= ySteps; i++) {
      const val = (maxVal / ySteps) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(abbreviateNumber(val), padding.left - 8, y + 4);
    }

    // Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    // Bars + labels
    const regions = [];
    groups.forEach((g, gi) => {
      const gx = padding.left + gi * groupWidth;

      // Bar 1: Nominal
      const x1 = gx + barOffset;
      const h1 = (g.bars[0] / maxVal) * chartH;
      drawBar(x1, getY(g.bars[0]), barWidth, h1, '#005c8e');
      regions.push({ type: 'rect', x: x1, y: getY(g.bars[0]), w: barWidth, h: h1,
        label: g.label + ' · Nominal Value', value: '₹ ' + formatNumber(Math.round(g.bars[0])), color: '#005c8e' });

      // Bar 2: Inflation-Adj
      const x2 = gx + barOffset * 2 + barWidth;
      const h2 = (g.bars[1] / maxVal) * chartH;
      drawBar(x2, getY(g.bars[1]), barWidth, h2, '#00652c');
      regions.push({ type: 'rect', x: x2, y: getY(g.bars[1]), w: barWidth, h: h2,
        label: g.label + ' · Inflation-Adjusted', value: '₹ ' + formatNumber(Math.round(g.bars[1])), color: '#00652c' });

      // Group label
      ctx.textAlign = 'center';
      ctx.fillStyle = '#191c1e';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      const labelX = gx + groupWidth / 2;
      const labelParts = g.label.split(' ');
      labelParts.forEach((part, pi) => {
        ctx.fillText(part, labelX, padding.top + chartH + 16 + pi * 14);
      });
    });

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#005c8e';
    ctx.fillRect(10, 8, 12, 12);
    ctx.fillStyle = '#191c1e';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Nominal Value', 26, 18);

    ctx.fillStyle = '#00652c';
    ctx.fillRect(150, 8, 12, 12);
    ctx.fillStyle = '#191c1e';
    ctx.fillText('Inflation-Adjusted', 166, 18);

    ChartTooltip.bind(chartCanvas, regions);
  }

  function abbreviateNumber(num) {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  }

  function formatCurrency(num) {
    const formatted = Math.abs(Math.round(num)).toLocaleString('en-IN');
    return num < 0 ? '(\u20B9 ' + formatted + ')' : '\u20B9 ' + formatted;
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
