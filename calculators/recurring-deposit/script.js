document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rdForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalDeposits = document.getElementById('resultTotalDeposits');
  const resultInterestEarned = document.getElementById('resultInterestEarned');
  const resultMaturityAmount = document.getElementById('resultMaturityAmount');
  const resultEffectiveRate = document.getElementById('resultEffectiveRate');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('rdChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('monthlyDeposit').value);
    let annualRate = parseFloat(document.getElementById('interestRate').value);
    const years = parseFloat(document.getElementById('tenureYears').value);
    const compounding = parseInt(document.getElementById('compoundingFreq').value);
    const isSenior = document.getElementById('seniorCitizen').checked;

    if (isSenior) annualRate += 0.5;

    if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate <= 0 || isNaN(years) || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const n = years * compounding;
    const r = annualRate / 100 / compounding;

    const fv = P * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const totalDeposits = P * years * 12;
    const interestEarned = fv - totalDeposits;

    resultTotalDeposits.textContent = '\u20B9 ' + formatNumber(Math.round(totalDeposits));
    resultInterestEarned.textContent = '\u20B9 ' + formatNumber(Math.round(interestEarned));
    resultMaturityAmount.textContent = '\u20B9 ' + formatNumber(Math.round(fv));

    const effectiveRate = ((Math.pow(fv / totalDeposits, 1 / years) - 1) * 100).toFixed(2);
    resultEffectiveRate.textContent = effectiveRate + '%';

    const schedule = buildYearlySchedule(P, annualRate / 12 / 100, years * 12);
    renderSchedule(schedule);
    drawChart(totalDeposits, interestEarned);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildYearlySchedule(monthlyInv, monthlyRate, totalMonths) {
    const rows = [];

    for (let year = 1; year <= totalMonths / 12; year++) {
      const months = year * 12;
      const totalInvested = monthlyInv * months;
      const corpus = monthlyInv * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
      const interest = corpus - totalInvested;

      rows.push({
        year,
        deposits: Math.round(totalInvested),
        interest: Math.round(interest),
        maturity: Math.round(corpus),
      });
    }

    return rows;
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.deposits)}</td>
        <td class="text-right">${formatNumber(r.interest)}</td>
        <td class="text-right">${formatNumber(r.maturity)}</td>
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
