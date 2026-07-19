document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('zbbForm');
  const resultsSection = document.getElementById('resultsSection');
  const colors = ['#005c8e', '#00652c', '#ba1a1a', '#d97706', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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

    const segs = values.map((val, i) => ({ label: labels[i], value: val, color: colors[i] }));

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
      let lx = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, lx + 16, legendY + 2);
        lx += 16 + ctx.measureText(item.label).width + 20;
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
