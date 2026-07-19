document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('divReinvestForm');
  const resultsSection = document.getElementById('resultsSection');
  const resultTotalInvestment = document.getElementById('resultTotalInvestment');
  const resultTotalDividends = document.getElementById('resultTotalDividends');
  const resultPortfolioWith = document.getElementById('resultPortfolioWith');
  const resultPortfolioWithout = document.getElementById('resultPortfolioWithout');
  const resultBenefit = document.getElementById('resultBenefit');
  const chartCanvas = document.getElementById('divReinvestChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const initial = parseFloat(document.getElementById('initialInvestment').value);
    const monthly = parseFloat(document.getElementById('monthlyAdditional').value);
    const divYield = parseFloat(document.getElementById('dividendYield').value);
    const appr = parseFloat(document.getElementById('priceAppreciation').value);
    const years = parseFloat(document.getElementById('investmentPeriod').value);

    if (!initial || !divYield || !appr || !years || initial < 0 || divYield < 0 || appr < 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const n = years * 12;
    const totalInvested = initial + monthly * n;

    const rAppr = appr / 12 / 100;
    const fvWithout = initial * Math.pow(1 + rAppr, n) + monthly * (Math.pow(1 + rAppr, n) - 1) / rAppr * (1 + rAppr);

    const totalReturn = appr + divYield;
    const rTotal = totalReturn / 12 / 100;
    const fvWith = initial * Math.pow(1 + rTotal, n) + monthly * (Math.pow(1 + rTotal, n) - 1) / rTotal * (1 + rTotal);

    const dividendsReinvested = fvWith - fvWithout;
    const benefit = fvWith - fvWithout;

    resultTotalInvestment.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvested));
    resultTotalDividends.textContent = '\u20B9 ' + formatNumber(Math.round(dividendsReinvested));
    resultPortfolioWith.textContent = '\u20B9 ' + formatNumber(Math.round(fvWith));
    resultPortfolioWithout.textContent = '\u20B9 ' + formatNumber(Math.round(fvWithout));
    resultBenefit.textContent = '\u20B9 ' + formatNumber(Math.round(benefit));

    drawChart(fvWithout, fvWith);
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
    const labels = ['Without Reinvestment', 'With Reinvestment'];
    const colors = ['#005c8e', '#00652c'];

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
