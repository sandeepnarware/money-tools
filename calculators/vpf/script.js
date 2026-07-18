document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vpfForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultMonthlyVpf = document.getElementById('resultMonthlyVpf');
  const resultTotalVpf = document.getElementById('resultTotalVpf');
  const resultInterestEarned = document.getElementById('resultInterestEarned');
  const resultTotalCorpus = document.getElementById('resultTotalCorpus');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('vpfChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const basicDa = parseFloat(document.getElementById('basicDa').value);
    const vpfPercent = parseFloat(document.getElementById('vpfPercent').value);
    const epfRate = parseFloat(document.getElementById('epfRate').value);
    const currentBalance = parseFloat(document.getElementById('currentVpfBalance').value);
    const years = parseFloat(document.getElementById('yearsToRetire').value);

    if (!basicDa || !vpfPercent || !epfRate || !years || basicDa <= 0 || vpfPercent <= 0 || epfRate <= 0 || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const monthlyVpf = basicDa * vpfPercent / 100;
    const annualContribution = monthlyVpf * 12;
    const rate = epfRate / 100;

    let opening = currentBalance;
    let totalContribution = 0;
    let totalInterest = 0;
    let closing = 0;

    const schedule = [];

    for (let year = 1; year <= years; year++) {
      totalContribution += annualContribution;
      const interest = (opening + annualContribution / 2) * rate;
      totalInterest += interest;
      closing = opening + annualContribution + interest;

      schedule.push({
        year,
        opening: Math.round(opening),
        contribution: Math.round(annualContribution),
        interest: Math.round(interest),
        closing: Math.round(closing),
      });

      opening = closing;
    }

    resultMonthlyVpf.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyVpf));
    resultTotalVpf.textContent = '\u20B9 ' + formatNumber(Math.round(totalContribution));
    resultInterestEarned.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));
    resultTotalCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(closing));

    renderSchedule(schedule);
    drawChart(totalContribution, totalInterest);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.opening)}</td>
        <td class="text-right">${formatNumber(r.contribution)}</td>
        <td class="text-right">${formatNumber(r.interest)}</td>
        <td class="text-right">${formatNumber(r.closing)}</td>
      </tr>
    `).join('');
  }

  function drawChart(contributions, interest) {
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
    const total = contributions + interest;
    const segs = [
      { label: 'Contributions', value: contributions, color: '#2563eb' },
      { label: 'Interest', value: interest, color: '#16a34a' },
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
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Contributions', 26, legendY + 2);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(120, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Interest', 136, legendY + 2);
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
