document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('expensePatternForm');
  const resultsSection = document.getElementById('resultsSection');
  const chartCanvas = document.getElementById('expensePatternChart');

  const resultIncome = document.getElementById('resultIncome');
  const resultExpenses = document.getElementById('resultExpenses');
  const resultSavings = document.getElementById('resultSavings');
  const resultSavingsRate = document.getElementById('resultSavingsRate');
  const resultLargest = document.getElementById('resultLargestExpense');
  const resultAnnualSavings = document.getElementById('resultAnnualSavings');
  const categoryBody = document.getElementById('categoryBody');

  const CATEGORIES = [
    { id: 'catRent', label: 'Rent / Mortgage', type: 'Needs' },
    { id: 'catGroceries', label: 'Groceries & Food', type: 'Needs' },
    { id: 'catUtilities', label: 'Utilities', type: 'Needs' },
    { id: 'catTransport', label: 'Transportation', type: 'Needs' },
    { id: 'catEntertainment', label: 'Entertainment', type: 'Wants' },
    { id: 'catShopping', label: 'Shopping', type: 'Wants' },
    { id: 'catHealthcare', label: 'Healthcare', type: 'Needs' },
    { id: 'catInsurance', label: 'Insurance', type: 'Needs' },
    { id: 'catEducation', label: 'Education', type: 'Needs' },
    { id: 'catDiningOut', label: 'Dining Out', type: 'Wants' },
    { id: 'catSubscriptions', label: 'Subscriptions', type: 'Wants' },
    { id: 'catOther', label: 'Other Expenses', type: 'Wants' },
  ];

  const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#a855f7', '#64748b'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncome').value) || 0;

    const cats = CATEGORIES.map((c, i) => {
      const val = parseFloat(document.getElementById(c.id).value) || 0;
      return { ...c, amount: val, color: COLORS[i] };
    });

    const totalExpenses = cats.reduce((s, c) => s + c.amount, 0);
    const savings = income - totalExpenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const largest = cats.reduce((max, c) => c.amount > max.amount ? c : max, cats[0]);

    const discretionary = cats.filter(c => c.type === 'Wants');
    const discretionaryTotal = discretionary.reduce((s, c) => s + c.amount, 0);
    const potentialSavings = discretionaryTotal * 0.20;
    const annualSavings = potentialSavings * 12;

    resultIncome.textContent = '\u20B9 ' + formatNumber(Math.round(income));
    resultExpenses.textContent = '\u20B9 ' + formatNumber(Math.round(totalExpenses));
    resultSavings.textContent = '\u20B9 ' + formatNumber(Math.round(savings));
    resultSavingsRate.textContent = savingsRate.toFixed(1) + '%';
    resultLargest.textContent = largest.label + ' (\u20B9 ' + formatNumber(Math.round(largest.amount)) + ')';
    resultAnnualSavings.textContent = '\u20B9 ' + formatNumber(Math.round(annualSavings));

    drawDonut(cats.map(c => ({ label: c.label, value: c.amount, color: c.color })));

    categoryBody.innerHTML = cats.map(c => {
      const pct = totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0;
      const savingOpp = c.type === 'Wants' ? c.amount * 0.20 : 0;
      return `
        <tr>
          <td>${c.label}</td>
          <td class="text-right">${formatNumber(Math.round(c.amount))}</td>
          <td class="text-right">${pct.toFixed(1)}%</td>
          <td>${c.type}</td>
          <td class="text-right">${c.type === 'Wants' ? '\u20B9 ' + formatNumber(Math.round(savingOpp)) : '-'}</td>
        </tr>
      `;
    }).join('');

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawDonut(data) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);

    const cols = data.length > 8 ? 3 : 2;
    const legendRows = Math.ceil(data.length / cols);
    const legendSpace = legendRows * 16 + 10;

    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = (displaySize - legendSpace) / 2 + 10;
    const radius = Math.min(displaySize / 2 - 20, cy - 20);
    const innerRadius = radius * 0.82;

    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath();
          ctx.arc(cx, cy, radius, currentStart, end);
          ctx.arc(cx, cy, innerRadius, end, currentStart, true);
          ctx.closePath();
          ctx.fillStyle = d.color;
          ctx.fill();
          ctx.stroke();
        }
        currentStart = segEnd;
      });

      const colW = displaySize / cols;
      data.forEach((d, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * colW + 6;
        const y = displaySize - (legendRows - row) * 16 + 4;
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y - 7, 8, 8);
        ctx.fillStyle = '#1e293b';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillText(d.label, x + 12, y + 1);
      });
    }
    function animate(time) {
      if (!startTime) startTime = time;
      const p = Math.min(1, (time - startTime) / 600);
      draw(p);
      if (p < 1) animId = requestAnimationFrame(animate);
    }
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(animate);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
