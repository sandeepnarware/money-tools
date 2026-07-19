document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ssForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalDeposited = document.getElementById('resultTotalDeposited');
  const resultMaturityAmount = document.getElementById('resultMaturityAmount');
  const resultInterestEarned = document.getElementById('resultInterestEarned');
  const resultMaturityAge = document.getElementById('resultMaturityAge');
  const resultTotalYears = document.getElementById('resultTotalYears');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('ssChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const girlAge = parseFloat(document.getElementById('girlAge').value);
    let annualDeposit = parseFloat(document.getElementById('annualDeposit').value);
    const currentBalance = parseFloat(document.getElementById('currentBalance').value);
    const ssyRate = parseFloat(document.getElementById('ssyRate').value);

    if (girlAge < 0 || girlAge > 10 || !annualDeposit || !ssyRate || annualDeposit <= 0 || ssyRate <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const totalYears = 21 - girlAge;
    const depositYears = Math.min(15, totalYears);
    const rate = ssyRate / 100;

    let opening = currentBalance;
    let totalDeposited = currentBalance;
    let totalInterest = 0;
    const schedule = [];

    for (let year = 1; year <= totalYears; year++) {
      const deposit = year <= depositYears ? annualDeposit : 0;
      totalDeposited += deposit;
      const interest = (opening + deposit / 2) * rate;
      totalInterest += interest;
      const closing = opening + deposit + interest;

      schedule.push({
        year,
        opening: Math.round(opening),
        deposit: Math.round(deposit),
        interest: Math.round(interest),
        closing: Math.round(closing),
      });

      opening = closing;
    }

    const maturityAmount = opening;

    resultTotalDeposited.textContent = '\u20B9 ' + formatNumber(Math.round(totalDeposited));
    resultMaturityAmount.textContent = '\u20B9 ' + formatNumber(Math.round(maturityAmount));
    resultInterestEarned.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));
    resultMaturityAge.textContent = '21 years';
    resultTotalYears.textContent = totalYears + ' years';

    renderSchedule(schedule);
    drawChart(Math.round(totalDeposited), Math.round(totalInterest));
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.opening)}</td>
        <td class="text-right">${formatNumber(r.deposit)}</td>
        <td class="text-right">${formatNumber(r.interest)}</td>
        <td class="text-right">${formatNumber(r.closing)}</td>
      </tr>
    `).join('');
  }

  function drawChart(deposits, interest) {
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
    const total = deposits + interest;
    const segs = [
      { label: 'Deposits', value: deposits, color: '#005c8e' },
      { label: 'Interest', value: interest, color: '#00652c' },
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
      ctx.fillStyle = '#005c8e';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Deposits', 26, legendY + 2);
      ctx.fillStyle = '#00652c';
      ctx.fillRect(110, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.fillText('Interest', 126, legendY + 2);
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
