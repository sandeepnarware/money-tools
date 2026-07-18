document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('spendingAnalysisForm');
  const resultsSection = document.getElementById('resultsSection');

  const needsIds = ['rentAmt', 'groceriesAmt', 'utilsAmt', 'transportAmt', 'healthcareAmt', 'insuranceAmt', 'educationAmt'];
  const wantsIds = ['entertainmentAmt', 'shoppingAmt', 'diningAmt', 'subsAmt', 'otherAmt'];
  const allNames = ['Rent', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Shopping', 'Healthcare', 'Insurance', 'Education', 'Dining Out', 'Subscriptions', 'Other'];
  const allIds = ['rentAmt', 'groceriesAmt', 'utilsAmt', 'transportAmt', 'entertainmentAmt', 'shoppingAmt', 'healthcareAmt', 'insuranceAmt', 'educationAmt', 'diningAmt', 'subsAmt', 'otherAmt'];
  const allTypes = ['Needs', 'Needs', 'Needs', 'Needs', 'Wants', 'Wants', 'Needs', 'Needs', 'Needs', 'Wants', 'Wants', 'Wants'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncome').value);
    if (!income || income <= 0) { alert('Please enter valid income.'); return; }

    const values = allIds.map(id => parseFloat(document.getElementById(id).value) || 0);
    const totalSpending = values.reduce((s, v) => s + v, 0);

    const needsTotal = needsIds.reduce((s, id) => s + (parseFloat(document.getElementById(id).value) || 0), 0);
    const wantsTotal = wantsIds.reduce((s, id) => s + (parseFloat(document.getElementById(id).value) || 0), 0);
    const ratio = wantsTotal > 0 ? (needsTotal / wantsTotal) : needsTotal;

    let maxVal = -1, maxIdx = 0;
    values.forEach((v, i) => { if (v > maxVal) { maxVal = v; maxIdx = i; } });

    document.getElementById('resultTotalSpend').innerHTML = '&#8377; ' + formatNumber(Math.round(totalSpending));
    document.getElementById('resultTopCategory').textContent = allNames[maxIdx] + ' (' + formatNumber(Math.round(maxVal)) + ')';
    document.getElementById('resultNeedsTotal').innerHTML = '&#8377; ' + formatNumber(Math.round(needsTotal));
    document.getElementById('resultWantsTotal').innerHTML = '&#8377; ' + formatNumber(Math.round(wantsTotal));
    document.getElementById('resultRatio').textContent = ratio.toFixed(1) + ':1 (Needs are ' + ratio.toFixed(1) + ' times Wants)';

    const tbody = document.getElementById('spendingTableBody');
    tbody.innerHTML = allNames.map((name, i) =>
      '<tr><td>' + name + '</td><td class="text-right">' + formatNumber(Math.round(values[i])) + '</td><td>' + allTypes[i] + '</td></tr>'
    ).join('');

    drawChart(needsTotal, wantsTotal);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(needs, wants) {
    const ctx = document.getElementById('spendingAnalysisChart').getContext('2d');
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
    const total = needs + wants;
    if (total === 0) return;

    const segs = [
      { label: 'Needs', value: needs, color: '#2563eb' },
      { label: 'Wants', value: wants, color: '#f59e0b' },
    ];

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
