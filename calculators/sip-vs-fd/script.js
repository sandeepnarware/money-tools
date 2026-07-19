document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sipVsFdForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalInvest = document.getElementById('resultTotalInvest');
  const resultSipCorpus = document.getElementById('resultSipCorpus');
  const resultFdMaturity = document.getElementById('resultFdMaturity');
  const resultSipReturns = document.getElementById('resultSipReturns');
  const resultFdReturns = document.getElementById('resultFdReturns');
  const resultDifference = document.getElementById('resultDifference');
  const resultWinner = document.getElementById('resultWinner');
  const chartCanvas = document.getElementById('sipVsFdChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('sipAmount').value) || 0;
    const years = parseFloat(document.getElementById('sipPeriod').value) || 0;
    const sipRate = parseFloat(document.getElementById('sipReturn').value) || 0;
    const fdRate = parseFloat(document.getElementById('fdRate').value) || 0;

    if (isNaN(P) || P <= 0 || isNaN(years) || years <= 0 || isNaN(sipRate) || sipRate <= 0 || isNaN(fdRate) || fdRate <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const n = years * 12;
    const r_sip = sipRate / 12 / 100;
    const totalInvested = P * n;
    const sipCorpus = P * (Math.pow(1 + r_sip, n) - 1) / r_sip * (1 + r_sip);
    const sipReturns = sipCorpus - totalInvested;

    const fdPrincipal = totalInvested;
    const fdMaturity = fdPrincipal * Math.pow(1 + fdRate / 100, years);
    const fdReturns = fdMaturity - fdPrincipal;

    const diff = sipCorpus - fdMaturity;
    const winner = diff > 0 ? 'SIP &#10143;' : (diff < 0 ? 'FD &#10143;' : 'Tie');

    resultTotalInvest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvested));
    resultSipCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(sipCorpus));
    resultFdMaturity.textContent = '\u20B9 ' + formatNumber(Math.round(fdMaturity));
    resultSipReturns.textContent = '\u20B9 ' + formatNumber(Math.round(sipReturns));
    resultFdReturns.textContent = '\u20B9 ' + formatNumber(Math.round(fdReturns));
    resultDifference.textContent = '\u20B9 ' + formatNumber(Math.round(Math.abs(diff)));

    const winnerEl = resultWinner;
    winnerEl.innerHTML = winner;
    if (diff > 0) {
      winnerEl.style.color = 'var(--success)';
    } else if (diff < 0) {
      winnerEl.style.color = 'var(--primary)';
    } else {
      winnerEl.style.color = 'var(--text)';
    }

    resultDifference.style.color = diff >= 0 ? 'var(--success)' : '#ba1a1a';

    drawChart(sipCorpus, fdMaturity);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(sipCorpus, fdMaturity) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayWidth = Math.min(500, containerWidth);
    const displayHeight = 300;
    chartCanvas.width = displayWidth * dpr;
    chartCanvas.height = displayHeight * dpr;
    chartCanvas.style.width = displayWidth + 'px';
    chartCanvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const maxVal = Math.max(sipCorpus, fdMaturity);
    const barWidth = Math.min(80, displayWidth * 0.2);
    const gap = 60;
    const totalBarsWidth = barWidth * 2 + gap;
    const startX = (displayWidth - totalBarsWidth) / 2;
    const chartHeight = displayHeight - 80;
    const bottomY = displayHeight - 30;

    const sipH = maxVal > 0 ? (sipCorpus / maxVal) * chartHeight : 0;
    const fdH = maxVal > 0 ? (fdMaturity / maxVal) * chartHeight : 0;

    ctx.fillStyle = '#005c8e';
    ctx.beginPath();
    ctx.roundRect(startX, bottomY - sipH, barWidth, sipH, 4);
    ctx.fill();

    ctx.fillStyle = '#00652c';
    ctx.beginPath();
    ctx.roundRect(startX + barWidth + gap, bottomY - fdH, barWidth, fdH, 4);
    ctx.fill();

    ctx.fillStyle = '#191c1e';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';

    const sipLabel = '\u20B9 ' + formatNumber(Math.round(sipCorpus / 100000)) + 'L';
    const fdLabel = '\u20B9 ' + formatNumber(Math.round(fdMaturity / 100000)) + 'L';
    ctx.fillText(sipLabel, startX + barWidth / 2, bottomY - sipH - 8);
    ctx.fillText(fdLabel, startX + barWidth + gap + barWidth / 2, bottomY - fdH - 8);

    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#545f73';
    ctx.fillText('SIP Corpus', startX + barWidth / 2, bottomY + 16);
    ctx.fillText('FD Maturity', startX + barWidth + gap + barWidth / 2, bottomY + 16);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
