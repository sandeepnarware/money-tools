document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ppvsfdForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultPpfMaturity = document.getElementById('resultPpfMaturity');
  const resultFdMaturity = document.getElementById('resultFdMaturity');
  const resultPpfDiff = document.getElementById('resultPpfDiff');
  const resultPpfReturns = document.getElementById('resultPpfReturns');
  const resultFdReturns = document.getElementById('resultFdReturns');
  const resultBetterPpf = document.getElementById('resultBetterPpf');
  const chartCanvas = document.getElementById('ppvsfdChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('ppfAnnual').value);
    const ppfRate = parseFloat(document.getElementById('ppfRate').value);
    const fdRate = parseFloat(document.getElementById('fdRate').value);
    const years = parseFloat(document.getElementById('ppfPeriod').value);

    if (isNaN(P) || P <= 0 || isNaN(ppfRate) || ppfRate <= 0 || isNaN(fdRate) || fdRate <= 0 || isNaN(years) || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r_ppf = ppfRate / 100;
    const r_fd = fdRate / 100;

    const ppfMaturity = P * (Math.pow(1 + r_ppf, years) - 1) / r_ppf * (1 + r_ppf);
    const fdMaturity = P * (Math.pow(1 + r_fd, years) - 1) / r_fd * (1 + r_fd);
    const totalInvestment = P * years;
    const ppfReturns = ppfMaturity - totalInvestment;
    const fdReturns = fdMaturity - totalInvestment;
    const diff = ppfMaturity - fdMaturity;
    const better = ppfMaturity >= fdMaturity ? 'PPF' : 'FD';

    resultPpfMaturity.textContent = '\u20B9 ' + formatNumber(Math.round(ppfMaturity));
    resultFdMaturity.textContent = '\u20B9 ' + formatNumber(Math.round(fdMaturity));
    resultPpfDiff.textContent = (diff >= 0 ? '\u20B9 ' : '-\u20B9 ') + formatNumber(Math.round(Math.abs(diff)));
    resultPpfReturns.textContent = '\u20B9 ' + formatNumber(Math.round(ppfReturns));
    resultFdReturns.textContent = '\u20B9 ' + formatNumber(Math.round(fdReturns));
    resultBetterPpf.textContent = better;

    drawChart('PPF', ppfMaturity, 'FD', fdMaturity, '#005c8e', '#00652c');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(label1, val1, label2, val2, color1, color2) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayWidth = Math.min(500, containerWidth);
    const displayHeight = 260;
    chartCanvas.width = displayWidth * dpr;
    chartCanvas.height = displayHeight * dpr;
    chartCanvas.style.width = displayWidth + 'px';
    chartCanvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const maxVal = Math.max(val1, val2);
    const barWidth = displayWidth * 0.25;
    const gap = displayWidth * 0.1;
    const startX = (displayWidth - barWidth * 2 - gap) / 2;
    const bottomY = displayHeight - 40;
    const chartH = bottomY - 40;

    const h1 = maxVal > 0 ? (val1 / maxVal) * chartH : 0;
    const h2 = maxVal > 0 ? (val2 / maxVal) * chartH : 0;

    ctx.fillStyle = color1;
    ctx.fillRect(startX, bottomY - h1, barWidth, h1);
    ctx.fillStyle = color2;
    ctx.fillRect(startX + barWidth + gap, bottomY - h2, barWidth, h2);

    ctx.fillStyle = '#191c1e';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formatNumber(Math.round(val1)), startX + barWidth / 2, bottomY - h1 - 8);
    ctx.fillText(formatNumber(Math.round(val2)), startX + barWidth + gap + barWidth / 2, bottomY - h2 - 8);

    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(label1, startX + barWidth / 2, bottomY + 18);
    ctx.fillText(label2, startX + barWidth + gap + barWidth / 2, bottomY + 18);

    const regions = [
      { type: 'rect', x: startX, y: bottomY - h1, w: barWidth, h: h1,
        label: label1, value: '₹ ' + formatNumber(Math.round(val1)), color: color1 },
      { type: 'rect', x: startX + barWidth + gap, y: bottomY - h2, w: barWidth, h: h2,
        label: label2, value: '₹ ' + formatNumber(Math.round(val2)), color: color2 },
    ];
    ChartTooltip.bind(chartCanvas, regions);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});