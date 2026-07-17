document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ad44Form');
  const resultsSection = document.getElementById('resultsSection');

  const resultBusinessIncome = document.getElementById('resultBusinessIncome');
  const resultTotalIncome = document.getElementById('resultTotalIncome');
  const resultEstimatedTax = document.getElementById('resultEstimatedTax');
  const resultPaid = document.getElementById('resultPaid');
  const resultPayable = document.getElementById('resultPayable');
  const chartCanvas = document.getElementById('ad44Chart');

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
    const turnover = parseFloat(document.getElementById('grossTurnover').value);
    const rate = parseFloat(document.getElementById('presumptiveRate').value);
    const otherIncome = parseFloat(document.getElementById('otherIncome44').value);
    const tds = parseFloat(document.getElementById('tdsDeducted').value);
    const advance = parseFloat(document.getElementById('advanceTax').value);

    if (!turnover || turnover <= 0 || rate <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const businessIncome = turnover * (rate / 100);
    const totalIncome = businessIncome + otherIncome;
    const tax = calcTax(totalIncome);
    const cess = tax * 0.04;
    const estimatedTax = tax + cess;
    const paid = tds + advance;
    const payable = Math.max(0, estimatedTax - paid);

    resultBusinessIncome.textContent = '\u20B9 ' + formatNumber(Math.round(businessIncome));
    resultTotalIncome.textContent = '\u20B9 ' + formatNumber(Math.round(totalIncome));
    resultEstimatedTax.textContent = '\u20B9 ' + formatNumber(Math.round(estimatedTax));
    resultPaid.textContent = '\u20B9 ' + formatNumber(Math.round(paid));
    resultPayable.textContent = '\u20B9 ' + formatNumber(Math.round(payable));

    drawChart(estimatedTax, payable);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(taxTotal, payable) {
    const paid = taxTotal - payable;
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
    const total = paid + payable;

    const ang1 = (paid / total) * Math.PI * 2;
    const ang2 = (payable / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + ang1);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + ang1, -Math.PI / 2 + ang1 + ang2);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    const ly = displaySize - 6;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(10, ly - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Tax Paid', 26, ly + 2);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(100, ly - 10, 12, 12);
    ctx.fillText('Payable', 116, ly + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
