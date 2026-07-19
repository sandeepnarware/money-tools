document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sipDelayForm');
  const resultsSection = document.getElementById('resultsSection');
  const resultInvestedNoDelay = document.getElementById('resultInvestedNoDelay');
  const resultInvestedWithDelay = document.getElementById('resultInvestedWithDelay');
  const resultCorpusNoDelay = document.getElementById('resultCorpusNoDelay');
  const resultCorpusWithDelay = document.getElementById('resultCorpusWithDelay');
  const resultCostOfDelay = document.getElementById('resultCostOfDelay');
  const resultMonthsLost = document.getElementById('resultMonthsLost');
  const chartCanvas = document.getElementById('sipDelayChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('monthlySIP').value);
    const annualRate = parseFloat(document.getElementById('expectedReturn').value);
    const years = parseFloat(document.getElementById('investmentPeriod').value);
    const delay = parseFloat(document.getElementById('delayYears').value);

    if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate <= 0 || isNaN(years) || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r = annualRate / 12 / 100;
    const n = years * 12;
    const nDelayed = Math.max(0, (years - delay)) * 12;

    const fvNoDelay = P * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const investedNoDelay = P * n;

    let fvDelayed = 0;
    let investedDelayed = 0;
    if (nDelayed > 0) {
      fvDelayed = P * (Math.pow(1 + r, nDelayed) - 1) / r * (1 + r);
      investedDelayed = P * nDelayed;
    }

    const costOfDelay = fvNoDelay - fvDelayed;
    const monthsLost = delay * 12;

    resultInvestedNoDelay.textContent = '\u20B9 ' + formatNumber(Math.round(investedNoDelay));
    resultInvestedWithDelay.textContent = '\u20B9 ' + formatNumber(Math.round(investedDelayed));
    resultCorpusNoDelay.textContent = '\u20B9 ' + formatNumber(Math.round(fvNoDelay));
    resultCorpusWithDelay.textContent = '\u20B9 ' + formatNumber(Math.round(fvDelayed));
    resultCostOfDelay.textContent = '\u20B9 ' + formatNumber(Math.round(costOfDelay));
    resultMonthsLost.textContent = formatNumber(monthsLost);

    drawChart(fvNoDelay, fvDelayed);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(val1, val2) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = 300;
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const pad = { top: 30, bottom: 50, left: 70, right: 30 };
    const chartW = displayW - pad.left - pad.right;
    const chartH = displayH - pad.top - pad.bottom;
    const maxVal = Math.max(val1, val2) * 1.3;
    const barW = Math.min(80, chartW * 0.3);
    const gap = (chartW - barW * 2) / 3;

    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yVal = (maxVal / 4) * i;
      const y = pad.top + chartH - (yVal / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#545f73';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(abbreviate(yVal), pad.left - 8, y + 4);
    }

    const vals = [val1, val2];
    const labels = ['Without Delay', 'With Delay'];
    const colors = ['#005c8e', '#ea580c'];

    vals.forEach((v, i) => {
      const x = pad.left + gap + i * (gap + barW);
      const barH = (v / maxVal) * chartH;
      ctx.fillStyle = colors[i];
      ctx.fillRect(x, pad.top + chartH - barH, barW, barH);

      ctx.fillStyle = '#191c1e';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u20B9 ' + formatNumber(Math.round(v)), x + barW / 2, pad.top + chartH - barH - 6);

      ctx.fillStyle = '#545f73';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(labels[i], x + barW / 2, pad.top + chartH + 18);
    });
  }

  function abbreviate(num) {
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
