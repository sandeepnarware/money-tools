document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('healthInsForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultRecommended = document.getElementById('resultRecommended');
  const resultSelfCover = document.getElementById('resultSelfCover');
  const resultFamilyCover = document.getElementById('resultFamilyCover');
  const resultExistingCover = document.getElementById('resultExistingCover');
  const resultCoverGap = document.getElementById('resultCoverGap');
  const chartCanvas = document.getElementById('healthInsChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const age = parseFloat(document.getElementById('yourAge').value);
    const members = parseFloat(document.getElementById('familyMembers').value);
    const cityType = document.getElementById('cityType').value;
    const existingCover = parseFloat(document.getElementById('existingHealthCover').value);
    const preExisting = document.getElementById('preExisting').value;
    const maternity = document.getElementById('maternityCover').value;

    if (!age || !members) {
      alert('Please enter valid values.');
      return;
    }

    const baseCoverMap = { 'Metro': 1000000, 'Tier 1': 700000, 'Tier 2': 500000, 'Tier 3': 300000 };
    const baseCover = baseCoverMap[cityType] || 1000000;

    let ageFactor;
    if (age <= 30) ageFactor = 1.0;
    else if (age <= 40) ageFactor = 1.2;
    else if (age <= 50) ageFactor = 1.5;
    else ageFactor = 2.0;

    const selfCover = baseCover * ageFactor;
    const familyCover = baseCover * (members - 1);
    const totalBefore = selfCover + familyCover;
    const loading = preExisting === 'Yes' ? totalBefore * 0.20 : 0;
    const maternityAdd = maternity === 'Yes' ? 50000 * members : 0;
    const recommended = totalBefore + loading + maternityAdd;
    const gap = Math.max(0, recommended - existingCover);

    resultRecommended.textContent = '\u20B9 ' + formatNumber(Math.round(recommended));
    resultSelfCover.textContent = '\u20B9 ' + formatNumber(Math.round(selfCover));
    resultFamilyCover.textContent = '\u20B9 ' + formatNumber(Math.round(familyCover));
    resultExistingCover.textContent = '\u20B9 ' + formatNumber(Math.round(existingCover));

    const gapEl = resultCoverGap;
    if (gap > 0) {
      gapEl.textContent = '\u20B9 ' + formatNumber(Math.round(gap));
      gapEl.className = 'value danger';
    } else {
      gapEl.textContent = '\u20B9 0';
      gapEl.className = 'value';
    }

    drawChart(recommended, existingCover, gap);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(recommended, existing, gap) {
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
    const total = recommended + existing + gap;
    const segs = [
      { label: 'Coverage Needed', value: recommended, color: '#2563eb' },
      { label: 'Existing Cover', value: existing, color: '#16a34a' },
      { label: 'Gap', value: gap, color: '#ef4444' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) return;
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
      let legendX = 10;
      segs.forEach(seg => {
        ctx.fillStyle = seg.color;
        ctx.fillRect(legendX, legendY - 10, 12, 12);
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px -apple-system, sans-serif';
        ctx.fillText(seg.label, legendX + 16, legendY + 2);
        legendX += ctx.measureText(seg.label).width + 32;
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