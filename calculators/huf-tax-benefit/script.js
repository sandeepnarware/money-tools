document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('hufForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTaxWithout = document.getElementById('resultTaxWithout');
  const resultIndivWith = document.getElementById('resultIndivWith');
  const resultHufTax = document.getElementById('resultHufTax');
  const resultTotalWith = document.getElementById('resultTotalWith');
  const resultSaved = document.getElementById('resultSaved');
  const chartCanvas = document.getElementById('hufChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calcTax(income) {
    let tax = 0;
    if (income > 1000000) {
      tax += (income - 1000000) * 0.30;
      income = 1000000;
    }
    if (income > 500000) {
      tax += (income - 500000) * 0.20;
      income = 500000;
    }
    if (income > 250000) {
      tax += (income - 250000) * 0.05;
    }
    return tax;
  }

  function calculate() {
    const hufIncome = parseFloat(document.getElementById('hufIncome').value);
    const individualIncome = parseFloat(document.getElementById('individualIncome').value);
    const hufDed = parseFloat(document.getElementById('hufDeductions').value);
    const indivDed = parseFloat(document.getElementById('individualDeductions').value);

    if (individualIncome < 0 || hufIncome < 0) {
      alert('Please enter valid values.');
      return;
    }

    const indivAfterDed = Math.max(0, individualIncome - indivDed);
    const hufAfterDed = Math.max(0, hufIncome - hufDed);

    const taxWithout = calcTax(indivAfterDed + hufAfterDed);
    const taxIndivWith = calcTax(indivAfterDed);
    const taxHuf = calcTax(hufAfterDed);
    const taxTotalWith = taxIndivWith + taxHuf;
    const saved = Math.max(0, taxWithout - taxTotalWith);

    resultTaxWithout.textContent = '\u20B9 ' + formatNumber(Math.round(taxWithout));
    resultIndivWith.textContent = '\u20B9 ' + formatNumber(Math.round(taxIndivWith));
    resultHufTax.textContent = '\u20B9 ' + formatNumber(Math.round(taxHuf));
    resultTotalWith.textContent = '\u20B9 ' + formatNumber(Math.round(taxTotalWith));
    resultSaved.textContent = '\u20B9 ' + formatNumber(Math.round(saved));

    drawChart(taxWithout, taxTotalWith);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(without, withHUF) {
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
    const total = without + withHUF;

    const ang1 = (without / total) * Math.PI * 2;
    const ang2 = (withHUF / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + ang1);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + ang1, -Math.PI / 2 + ang1 + ang2);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    const ly = displaySize - 6;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(10, ly - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Tax Without HUF', 26, ly + 2);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(140, ly - 10, 12, 12);
    ctx.fillText('Tax With HUF', 156, ly + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
