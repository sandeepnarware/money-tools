document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('regDirForm');
  const resultsSection = document.getElementById('resultsSection');
  const resultDirectCorpus = document.getElementById('resultDirectCorpus');
  const resultRegularCorpus = document.getElementById('resultRegularCorpus');
  const resultExtraCost = document.getElementById('resultExtraCost');
  const resultSavings = document.getElementById('resultSavings');
  const resultTotalInvestment = document.getElementById('resultTotalInvestment');
  const resultPercentDiff = document.getElementById('resultPercentDiff');
  const labelDirectCorpus = document.getElementById('labelDirectCorpus');
  const labelRegularCorpus = document.getElementById('labelRegularCorpus');
  const labelExtraCost = document.getElementById('labelExtraCost');
  const chartCanvas = document.getElementById('regDirChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const invType = document.getElementById('investmentType').value;
    const P = parseFloat(document.getElementById('investmentAmount').value);
    const years = parseFloat(document.getElementById('investmentPeriod').value);
    const marketReturn = parseFloat(document.getElementById('marketReturn').value);
    const regExp = parseFloat(document.getElementById('regularExpense').value);
    const dirExp = parseFloat(document.getElementById('directExpense').value);

    if (isNaN(P) || P <= 0 || isNaN(years) || years <= 0 || isNaN(marketReturn) || marketReturn <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    let directFV, regularFV, totalInvested;

    if (invType === 'sip') {
      const n = years * 12;
      const rDir = (marketReturn - dirExp) / 12 / 100;
      const rReg = (marketReturn - regExp) / 12 / 100;
      directFV = P * (Math.pow(1 + rDir, n) - 1) / rDir * (1 + rDir);
      regularFV = P * (Math.pow(1 + rReg, n) - 1) / rReg * (1 + rReg);
      totalInvested = P * n;
      labelDirectCorpus.textContent = 'Direct Fund Corpus (SIP)';
      labelRegularCorpus.textContent = 'Regular Fund Corpus (SIP)';
      labelExtraCost.textContent = 'Extra Cost Paid in Regular';
    } else {
      const rDir = (marketReturn - dirExp) / 100;
      const rReg = (marketReturn - regExp) / 100;
      directFV = P * Math.pow(1 + rDir, years);
      regularFV = P * Math.pow(1 + rReg, years);
      totalInvested = P;
      labelDirectCorpus.textContent = 'Direct Fund Corpus (Lumpsum)';
      labelRegularCorpus.textContent = 'Regular Fund Corpus (Lumpsum)';
      labelExtraCost.textContent = 'Extra Cost Paid in Regular';
    }

    const costDiff = regularFV - directFV;
    const savings = directFV - regularFV;
    const percentDiff = regularFV > 0 ? ((directFV - regularFV) / regularFV) * 100 : 0;

    resultDirectCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(directFV));
    resultRegularCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(regularFV));
    resultExtraCost.textContent = '\u20B9 ' + formatNumber(Math.round(Math.abs(costDiff)));
    resultSavings.textContent = '\u20B9 ' + formatNumber(Math.round(savings));
    resultTotalInvestment.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvested));
    resultPercentDiff.textContent = percentDiff.toFixed(2) + '%';

    if (invType === 'lumpsum') {
      drawChart(regularFV, directFV);
    } else {
      drawChart(regularFV, directFV);
    }
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

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yVal = (maxVal / 4) * i;
      const y = pad.top + chartH - (yVal / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(abbreviate(yVal), pad.left - 8, y + 4);
    }

    const vals = [val1, val2];
    const labels = ['Regular Fund', 'Direct Fund'];
    const colors = ['#2563eb', '#16a34a'];

    vals.forEach((v, i) => {
      const x = pad.left + gap + i * (gap + barW);
      const barH = (v / maxVal) * chartH;
      ctx.fillStyle = colors[i];
      ctx.fillRect(x, pad.top + chartH - barH, barW, barH);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u20B9 ' + formatNumber(Math.round(v)), x + barW / 2, pad.top + chartH - barH - 6);

      ctx.fillStyle = '#64748b';
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
