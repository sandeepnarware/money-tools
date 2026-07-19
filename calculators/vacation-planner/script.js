document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vacationForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const cost = parseFloat(document.getElementById('tripCost').value);
    const months = parseFloat(document.getElementById('monthsUntil').value);
    const saved = parseFloat(document.getElementById('alreadySavedV').value);
    const annualReturn = parseFloat(document.getElementById('expectedReturnV').value);

    if (!cost || cost <= 0) { alert('Please enter valid trip cost.'); return; }
    if (!months || months <= 0) { alert('Please enter valid months.'); return; }

    let remaining, monthly;
    if (annualReturn > 0 && months > 0) {
      const r = annualReturn / 12 / 100;
      const fvSaved = saved * Math.pow(1 + r, months);
      remaining = cost - fvSaved;
      if (remaining > 0) {
        monthly = remaining * r / (Math.pow(1 + r, months) - 1);
      } else {
        monthly = 0;
      }
    } else {
      remaining = cost - saved;
      monthly = remaining > 0 ? remaining / months : 0;
    }

    document.getElementById('resultTotalNeededV').innerHTML = '&#8377; ' + formatNumber(Math.round(cost));
    document.getElementById('resultSavedV').innerHTML = '&#8377; ' + formatNumber(Math.round(saved));
    document.getElementById('resultMonthlyV').innerHTML = '&#8377; ' + formatNumber(Math.round(Math.max(0, monthly)));
    document.getElementById('resultMonthsV').textContent = formatNumber(Math.round(months));

    drawChart(saved, Math.max(0, remaining));
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(saved, need) {
    const ctx = document.getElementById('vacationChart').getContext('2d');
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
    const segs = [
      { label: 'Saved', value: saved, color: '#00652c' },
      { label: 'Need', value: need, color: '#005c8e' },
    ];
    const total = saved + need;
    if (total === 0) return;

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
