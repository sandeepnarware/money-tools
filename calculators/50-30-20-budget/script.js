document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budget50Form');
  const resultsSection = document.getElementById('resultsSection');

  const resultIncome = document.getElementById('resultBIncome');
  const resultNeeds = document.getElementById('resultBNeeds');
  const resultWants = document.getElementById('resultBWants');
  const resultSavings = document.getElementById('resultBSavings');
  const resultNeedsPct = document.getElementById('resultNeedsPct');
  const resultWantsPct = document.getElementById('resultWantsPct');
  const resultSavingsPct = document.getElementById('resultSavingsPct');
  const chartCanvas = document.getElementById('budget50Chart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('bIncome').value);

    const rent = parseFloat(document.getElementById('bRent').value) || 0;
    const groceries = parseFloat(document.getElementById('bGroceries').value) || 0;
    const utilities = parseFloat(document.getElementById('bUtilities').value) || 0;
    const transport = parseFloat(document.getElementById('bTransport').value) || 0;
    const healthcare = parseFloat(document.getElementById('bHealthcare').value) || 0;
    const insurance = parseFloat(document.getElementById('bInsurance').value) || 0;

    const entertainment = parseFloat(document.getElementById('bEntertainment').value) || 0;
    const dining = parseFloat(document.getElementById('bDining').value) || 0;
    const shopping = parseFloat(document.getElementById('bShopping').value) || 0;
    const subscriptions = parseFloat(document.getElementById('bSubscriptions').value) || 0;

    const investments = parseFloat(document.getElementById('bInvestments').value) || 0;
    const emergency = parseFloat(document.getElementById('bEmergency').value) || 0;

    if (!income || income <= 0) {
      alert('Please enter a valid monthly income.');
      return;
    }

    const needsTotal = rent + groceries + utilities + transport + healthcare + insurance;
    const wantsTotal = entertainment + dining + shopping + subscriptions;
    const savingsTotal = investments + emergency;

    const needsPct = (needsTotal / income) * 100;
    const wantsPct = (wantsTotal / income) * 100;
    const savingsPct = (savingsTotal / income) * 100;

    resultIncome.textContent = '\u20B9 ' + formatNumber(Math.round(income));
    resultNeeds.textContent = '\u20B9 ' + formatNumber(Math.round(needsTotal));
    resultWants.textContent = '\u20B9 ' + formatNumber(Math.round(wantsTotal));
    resultSavings.textContent = '\u20B9 ' + formatNumber(Math.round(savingsTotal));

    function pctSpan(pct, target) {
      const color = pct <= target ? '#16a34a' : '#ef4444';
      return '<span style="color:' + color + ';font-weight:600;">' + pct.toFixed(1) + '%</span> (Target ' + target + '%)';
    }

    resultNeedsPct.innerHTML = pctSpan(needsPct, 50);
    resultWantsPct.innerHTML = pctSpan(wantsPct, 30);
    resultSavingsPct.innerHTML = pctSpan(savingsPct, 20);

    drawChart(needsTotal, wantsTotal, savingsTotal);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(needs, wants, savings) {
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
    const total = needs + wants + savings;
    const segs = [
      { label: 'Needs', value: needs, color: '#2563eb' },
      { label: 'Wants', value: wants, color: '#d97706' },
      { label: 'Savings', value: savings, color: '#16a34a' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) return;
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      const ly = displaySize - 6;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(10, ly - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Needs', 26, ly + 2);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(80, ly - 10, 12, 12);
      ctx.fillText('Wants', 96, ly + 2);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(150, ly - 10, 12, 12);
      ctx.fillText('Savings', 166, ly + 2);
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
