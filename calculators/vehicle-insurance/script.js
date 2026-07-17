document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vehicleInsForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalA = document.getElementById('resultTotalA');
  const resultTotalB = document.getElementById('resultTotalB');
  const resultCoverA = document.getElementById('resultCoverA');
  const resultCoverB = document.getElementById('resultCoverB');
  const resultDiff = document.getElementById('resultDiff');
  const resultBetter = document.getElementById('resultBetter');
  const chartCanvas = document.getElementById('vehicleInsChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const idv = parseFloat(document.getElementById('vehicleIDV').value);
    const premA = parseFloat(document.getElementById('premiumA').value);
    const addA = parseFloat(document.getElementById('addonsA').value);
    const premB = parseFloat(document.getElementById('premiumB').value);
    const addB = parseFloat(document.getElementById('addonsB').value);
    const ncb = parseFloat(document.getElementById('ncbDiscount').value);

    if (!idv || idv <= 0) {
      alert('Please enter a valid IDV.');
      return;
    }

    const totalA = (premA + addA) * (1 - ncb / 100);
    const totalB = (premB + addB) * (1 - ncb / 100);
    const coverA = (totalA / idv) * 100;
    const coverB = (totalB / idv) * 100;
    const diff = Math.abs(totalA - totalB);

    resultTotalA.textContent = '\u20B9 ' + formatNumber(Math.round(totalA));
    resultTotalB.textContent = '\u20B9 ' + formatNumber(Math.round(totalB));
    resultCoverA.textContent = coverA.toFixed(2) + '%';
    resultCoverB.textContent = coverB.toFixed(2) + '%';
    resultDiff.textContent = '\u20B9 ' + formatNumber(Math.round(diff));

    if (totalA < totalB) {
      resultBetter.textContent = 'Plan A (Lower Cost)';
    } else if (totalB < totalA) {
      resultBetter.textContent = 'Plan B (Lower Cost)';
    } else {
      resultBetter.textContent = 'Both Equal';
    }

    drawChart(totalA, totalB, premA + addA, premB + addB);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(totalA, totalB, grossA, grossB) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 400;
    const displayW = Math.min(400, containerWidth);
    const displayH = 300;
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const maxVal = Math.max(grossA, grossB, 1);
    const barWidth = (displayW - 80) / 3;
    const chartBottom = displayH - 40;

    const bar1H = (grossA / maxVal) * (chartBottom - 40);
    const bar2H = (grossB / maxVal) * (chartBottom - 40);
    const bar3H = (totalA / maxVal) * (chartBottom - 40);
    const bar4H = (totalB / maxVal) * (chartBottom - 40);

    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(30, chartBottom - bar1H, barWidth, bar1H);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(30 + barWidth + 10, chartBottom - bar2H, barWidth, bar2H);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(30, chartBottom - bar3H - bar1H - 10, barWidth, bar3H);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(30 + barWidth + 10, chartBottom - bar4H - bar2H - 10, barWidth, bar4H);

    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Plan A', 30 + barWidth / 2, displayH - 10);
    ctx.fillText('Plan B', 30 + barWidth + 10 + barWidth / 2, displayH - 10);

    const ly = 14;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(10, ly, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'left';
    ctx.fillText('Gross Premium', 26, ly + 10);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(130, ly, 12, 12);
    ctx.fillText('After NCB', 146, ly + 10);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
