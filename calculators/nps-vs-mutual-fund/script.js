document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('npsvsmfForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultNpsCorpus = document.getElementById('resultNpsCorpus');
  const resultMfCorpus = document.getElementById('resultMfCorpus');
  const resultNpsLump = document.getElementById('resultNpsLump');
  const resultNpsPension = document.getElementById('resultNpsPension');
  const resultMfWithdrawal = document.getElementById('resultMfWithdrawal');
  const resultNpsDiff = document.getElementById('resultNpsDiff');
  const resultNpsBetter = document.getElementById('resultNpsBetter');
  const chartCanvas = document.getElementById('npsvsmfChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('npsMonthly').value);
    const currAge = parseFloat(document.getElementById('npsAge').value);
    const retireAge = parseFloat(document.getElementById('npsRetireAge').value);
    const npsRet = parseFloat(document.getElementById('npsReturn').value);
    const mfRet = parseFloat(document.getElementById('npsMfReturn').value);
    const annuityPct = parseFloat(document.getElementById('npsAnnuity').value);
    const annuityRet = parseFloat(document.getElementById('annuityReturn').value);

    if (!P || !currAge || !retireAge || !npsRet || !mfRet || P <= 0 || npsRet <= 0 || mfRet <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const n = (retireAge - currAge) * 12;
    if (n <= 0) {
      alert('Retirement age must be greater than current age.');
      return;
    }

    const rNps = npsRet / 12 / 100;
    const rMf = mfRet / 12 / 100;

    const npsCorpus = P * (Math.pow(1 + rNps, n) - 1) / rNps * (1 + rNps);
    const mfCorpus = P * (Math.pow(1 + rMf, n) - 1) / rMf * (1 + rMf);
    const npsLump = npsCorpus * (1 - annuityPct / 100);
    const npsPension = (npsCorpus * (annuityPct / 100) * (annuityRet / 100)) / 12;
    const mfWithdrawal = mfCorpus * 0.04 / 12;
    const diff = npsCorpus - mfCorpus;
    const better = npsCorpus >= mfCorpus ? 'NPS' : 'Mutual Fund';

    resultNpsCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(npsCorpus));
    resultMfCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(mfCorpus));
    resultNpsLump.textContent = '\u20B9 ' + formatNumber(Math.round(npsLump));
    resultNpsPension.textContent = '\u20B9 ' + formatNumber(Math.round(npsPension));
    resultMfWithdrawal.textContent = '\u20B9 ' + formatNumber(Math.round(mfWithdrawal));
    resultNpsDiff.textContent = (diff >= 0 ? '\u20B9 ' : '-\u20B9 ') + formatNumber(Math.round(Math.abs(diff)));
    resultNpsBetter.textContent = better;

    drawChart('NPS Corpus', npsCorpus, 'MF Corpus', mfCorpus, '#2563eb', '#16a34a', npsPension);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(label1, val1, label2, val2, color1, color2, pension) {
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

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formatNumber(Math.round(val1)), startX + barWidth / 2, bottomY - h1 - 8);
    ctx.fillText(formatNumber(Math.round(val2)), startX + barWidth + gap + barWidth / 2, bottomY - h2 - 8);

    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(label1, startX + barWidth / 2, bottomY + 18);
    ctx.fillText(label2, startX + barWidth + gap + barWidth / 2, bottomY + 18);

    if (pension > 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Pension: ' + formatNumber(Math.round(pension)) + '/month', displayWidth / 2, displayHeight - 8);
    }
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});