document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bankStmtForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncomeB').value);
    const credits = parseFloat(document.getElementById('totalCredits').value);
    const debits = parseFloat(document.getElementById('totalDebits').value);
    const transactions = parseFloat(document.getElementById('numTransactions').value);
    const atmWithdrawals = parseFloat(document.getElementById('atmWithdrawals').value);
    const balance = parseFloat(document.getElementById('bankBalance').value);
    const minBalance = parseFloat(document.getElementById('minBalance').value);

    if (!income || income <= 0) { alert('Please enter valid income.'); return; }

    const netFlow = credits - debits;
    const avgTx = transactions > 0 ? debits / transactions : 0;
    const atmValue = atmWithdrawals * 3000;
    const atmPct = debits > 0 ? (atmValue / debits) * 100 : 0;
    const savingsPotential = Math.max(0, income - (debits - atmValue));

    let health;
    if (balance > 3 * minBalance && netFlow > 0) {
      health = 'Good';
    } else if (balance > minBalance) {
      health = 'Average';
    } else {
      health = 'Poor';
    }

    document.getElementById('resultNetFlow').innerHTML = '&#8377; ' + formatNumber(Math.round(netFlow));
    document.getElementById('resultAvgTx').innerHTML = '&#8377; ' + formatNumber(Math.round(avgTx));
    document.getElementById('resultATMPct').textContent = atmPct.toFixed(1) + '%';
    document.getElementById('resultBalanceStatus').textContent = formatNumber(Math.round(balance)) + ' vs min ' + formatNumber(Math.round(minBalance));
    document.getElementById('resultSavingsPotential').innerHTML = '&#8377; ' + formatNumber(Math.round(savingsPotential));
    document.getElementById('resultHealth').textContent = health;
    document.getElementById('resultHealth').className = 'value ' + (health === 'Good' ? 'success' : health === 'Average' ? '' : 'danger');

    drawChart(income, debits);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(income, debits) {
    const ctx = document.getElementById('bankStmtChart').getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = ctx.canvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);
    ctx.canvas.width = displaySize * dpr;
    ctx.canvas.height = displaySize * dpr;
    ctx.canvas.style.width = displaySize + 'px';
    ctx.canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const radius = displaySize / 2 - 20;
    const total = income + debits;
    if (total === 0) return;

    ctx.clearRect(0, 0, displaySize, displaySize);

    const segs = [
      { label: 'Income', value: income, color: '#16a34a' },
      { label: 'Expenses', value: debits, color: '#dc2626' },
    ];
    let startAngle = -Math.PI / 2;
    segs.forEach(seg => {
      if (seg.value <= 0) return;
      const angle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += angle;
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
