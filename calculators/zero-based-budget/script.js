document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('zbbForm');
  const resultsSection = document.getElementById('resultsSection');
  const colors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncome').value);
    const housing = parseFloat(document.getElementById('housingExpense').value);
    const food = parseFloat(document.getElementById('foodExpense').value);
    const transport = parseFloat(document.getElementById('transportExpense').value);
    const utilities = parseFloat(document.getElementById('utilitiesExpense').value);
    const insurance = parseFloat(document.getElementById('insuranceExpense').value);
    const debt = parseFloat(document.getElementById('debtExpense').value);
    const savings = parseFloat(document.getElementById('savingsExpense').value);
    const misc = parseFloat(document.getElementById('miscExpense').value);

    if (!income || income <= 0) { alert('Please enter valid income.'); return; }

    const totalAllocated = housing + food + transport + utilities + insurance + debt + savings + misc;
    const remaining = income - totalAllocated;
    const housingPct = (housing / income) * 100;
    const foodPct = (food / income) * 100;
    const savingsPct = (savings / income) * 100;

    document.getElementById('resultIncome').innerHTML = '&#8377; ' + formatNumber(Math.round(income));
    document.getElementById('resultAllocated').innerHTML = '&#8377; ' + formatNumber(Math.round(totalAllocated));
    const remainingEl = document.getElementById('resultRemaining');
    remainingEl.textContent = formatNumber(Math.round(remaining));
    remainingEl.className = 'value';
    if (remaining > 0) {
      remainingEl.textContent += ' (Under-budgeted)';
    } else if (remaining < 0) {
      remainingEl.textContent += ' (Over-budgeted!)';
      remainingEl.className = 'value danger';
    }
    document.getElementById('resultHousingPct').textContent = housingPct.toFixed(1) + '%';
    document.getElementById('resultFoodPct').textContent = foodPct.toFixed(1) + '%';
    document.getElementById('resultSavingsPct').textContent = savingsPct.toFixed(1) + '%';

    const catValues = [housing, food, transport, utilities, insurance, debt, savings, misc];
    const catNames = ['Housing','Food','Transport','Utilities','Insurance','Debt','Savings','Misc'];
    const tbody = document.getElementById('budgetTableBody');
    tbody.innerHTML = catNames.map((name, i) =>
      '<tr><td>' + name + '</td><td class="text-right">' + formatNumber(Math.round(catValues[i])) + '</td><td class="text-right">' + (catValues[i]/income*100).toFixed(1) + '%</td></tr>'
    ).join('');

    drawChart(catValues, catNames, colors);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(values, labels, colors) {
    const ctx = document.getElementById('zbbChart').getContext('2d');
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
    const total = values.reduce((s, v) => s + v, 0);
    if (total === 0) return;

    ctx.clearRect(0, 0, displaySize, displaySize);
    let startAngle = -Math.PI / 2;

    values.forEach((val, i) => {
      if (val <= 0) return;
      const angle = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      startAngle += angle;
    });

    let lx = 10;
    values.forEach((val, i) => {
      if (val <= 0) return;
      ctx.fillStyle = colors[i];
      ctx.fillRect(lx, displaySize - 6, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText(labels[i], lx + 16, displaySize + 2);
      lx += ctx.measureText(labels[i]).width + 34;
      if (lx > displaySize - 20) lx = 10;
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
