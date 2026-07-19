document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('expenseRatioForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultCorpusA = document.getElementById('resultCorpusA');
  const resultCorpusB = document.getElementById('resultCorpusB');
  const resultDifference = document.getElementById('resultDifference');
  const resultCostA = document.getElementById('resultCostA');
  const resultCostB = document.getElementById('resultCostB');
  const resultExtraCost = document.getElementById('resultExtraCost');
  const chartCanvas = document.getElementById('expenseRatioChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('investmentAmount').value);
    const marketReturn = parseFloat(document.getElementById('marketReturn').value);
    const years = parseFloat(document.getElementById('investmentPeriod').value);
    const expenseA = parseFloat(document.getElementById('expenseA').value);
    const expenseB = parseFloat(document.getElementById('expenseB').value);
    const investmentType = document.getElementById('investmentType').value;

    if (isNaN(P) || P <= 0 || isNaN(marketReturn) || marketReturn <= 0 || isNaN(years) || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    let corpusA, corpusB, corpusNoFee, totalInvested;

    if (investmentType === 'sip') {
      const n = years * 12;
      const rMarket = marketReturn / 12 / 100;
      const rA = (marketReturn - expenseA) / 12 / 100;
      const rB = (marketReturn - expenseB) / 12 / 100;

      corpusA = P * (Math.pow(1 + rA, n) - 1) / rA * (1 + rA);
      corpusB = P * (Math.pow(1 + rB, n) - 1) / rB * (1 + rB);
      corpusNoFee = P * (Math.pow(1 + rMarket, n) - 1) / rMarket * (1 + rMarket);
      totalInvested = P * n;
    } else {
      const rA = (marketReturn - expenseA) / 100;
      const rB = (marketReturn - expenseB) / 100;
      const rMarket = marketReturn / 100;

      corpusA = P * Math.pow(1 + rA, years);
      corpusB = P * Math.pow(1 + rB, years);
      corpusNoFee = P * Math.pow(1 + rMarket, years);
      totalInvested = P;
    }

    const costA = corpusNoFee - corpusA;
    const costB = corpusNoFee - corpusB;
    const difference = corpusA - corpusB;
    const extraCost = costB - costA;

    resultCorpusA.textContent = '\u20B9 ' + formatNumber(Math.round(corpusA));
    resultCorpusB.textContent = '\u20B9 ' + formatNumber(Math.round(corpusB));
    resultDifference.textContent = '\u20B9 ' + formatNumber(Math.round(difference));
    resultCostA.textContent = '\u20B9 ' + formatNumber(Math.round(costA));
    resultCostB.textContent = '\u20B9 ' + formatNumber(Math.round(costB));
    resultExtraCost.textContent = '\u20B9 ' + formatNumber(Math.round(extraCost));

    drawChart(corpusNoFee, corpusA, corpusB);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(corpusNoFee, corpusA, corpusB) {
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

    const padding = { top: 24, right: 24, bottom: 50, left: 64 };
    const chartW = displayW - padding.left - padding.right;
    const chartH = displayH - padding.top - padding.bottom;

    const items = [
      { label: 'No-Fee Corpus', value: corpusNoFee, color: '#00652c' },
      { label: 'Fund A (Low ER)', value: corpusA, color: '#005c8e' },
      { label: 'Fund B (High ER)', value: corpusB, color: '#d97706' },
    ];

    const maxVal = Math.max(...items.map(i => i.value)) * 1.25;
    const barWidth = chartW * 0.18;
    const gap = (chartW - barWidth * items.length) / (items.length + 1);

    function getY(val) { return padding.top + chartH - (val / maxVal) * chartH; }

    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = 1;
    const ySteps = 5;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#545f73';
    ctx.font = '10px -apple-system, sans-serif';
    for (let i = 0; i <= ySteps; i++) {
      const val = (maxVal / ySteps) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(abbreviateNumber(val), padding.left - 8, y + 4);
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    const regions = [];
    items.forEach((item, i) => {
      const x = padding.left + gap + i * (gap + barWidth);
      const h = (item.value / maxVal) * chartH;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, getY(item.value), barWidth, h);

      regions.push({ type: 'rect', x: x, y: getY(item.value), w: barWidth, h: h,
        label: item.label, value: '\u20B9 ' + formatNumber(Math.round(item.value)), color: item.color });

      ctx.textAlign = 'center';
      ctx.fillStyle = '#191c1e';
      ctx.font = 'bold 10px -apple-system, sans-serif';
      ctx.fillText('\u20B9 ' + abbreviateNumber(item.value), x + barWidth / 2, getY(item.value) - 8);

      ctx.fillStyle = '#545f73';
      ctx.font = '9px -apple-system, sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, padding.top + chartH + 14);
    });
    ChartTooltip.bind(chartCanvas, regions);
  }

  function abbreviateNumber(num) {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
