document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('expenseTrackerForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultIncome = document.getElementById('resultIncome');
  const resultExpenses = document.getElementById('resultExpenses');
  const resultSavings = document.getElementById('resultSavings');
  const resultSavingsRate = document.getElementById('resultSavingsRate');
  const expenseBreakdownBody = document.getElementById('expenseBreakdownBody');
  const chartCanvas = document.getElementById('expenseChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncome').value) || 0;

    const categories = [
      { id: 'rentMortgage', label: 'Rent / Mortgage' },
      { id: 'groceriesFood', label: 'Groceries & Food' },
      { id: 'utilities', label: 'Utilities' },
      { id: 'transportation', label: 'Transportation' },
      { id: 'entertainment', label: 'Entertainment' },
      { id: 'shopping', label: 'Shopping' },
      { id: 'healthcare', label: 'Healthcare' },
      { id: 'insurance', label: 'Insurance' },
      { id: 'education', label: 'Education' },
      { id: 'diningOut', label: 'Dining Out' },
      { id: 'subscriptions', label: 'Subscriptions' },
      { id: 'otherExpenses', label: 'Other Expenses' },
    ];

    const amounts = categories.map(c => parseFloat(document.getElementById(c.id).value) || 0);
    const totalExpenses = amounts.reduce((a, b) => a + b, 0);
    const savings = Math.max(0, income - totalExpenses);
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    resultIncome.textContent = '\u20B9 ' + formatNumber(Math.round(income));
    const expEl = resultExpenses;
    expEl.textContent = '\u20B9 ' + formatNumber(Math.round(totalExpenses));
    if (totalExpenses > income) {
      expEl.className = 'value danger';
    } else {
      expEl.className = 'value primary';
    }
    resultSavings.textContent = '\u20B9 ' + formatNumber(Math.round(savings));
    resultSavingsRate.textContent = savingsRate.toFixed(1) + '%';

    renderBreakdown(categories, amounts, totalExpenses);
    drawChart(amounts, categories);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderBreakdown(categories, amounts, total) {
    const colors = ['#005c8e','#00652c','#d97706','#ba1a1a','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#06b6d4','#a855f7'];
    expenseBreakdownBody.innerHTML = categories.map((cat, i) => {
      const pct = total > 0 ? (amounts[i] / total) * 100 : 0;
      return '<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + colors[i] + ';margin-right:8px;"></span>' + cat.label + '</td><td class="text-right">\u20B9 ' + formatNumber(Math.round(amounts[i])) + '</td><td class="text-right">' + pct.toFixed(1) + '%</td></tr>';
    }).join('');
  }

  function drawChart(amounts, categories) {
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
    const total = amounts.reduce((a, b) => a + b, 0);

    const colors = ['#005c8e','#00652c','#d97706','#ba1a1a','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#06b6d4','#a855f7'];

    const segs = amounts.map((val, i) => ({ label: categories[i].label, value: val, color: colors[i] }));

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
          ctx.stroke();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();

      const legendY = displaySize - 6;
      const legendItems = segs.filter(s => s.value > 0);
      ctx.font = '12px -apple-system, sans-serif';
      const totalW = legendItems.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (legendItems.length - 1) * 20;
      let legendX = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, legendX + 16, legendY + 2);
        legendX += 16 + ctx.measureText(item.label).width + 20;
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

  calculate();
});