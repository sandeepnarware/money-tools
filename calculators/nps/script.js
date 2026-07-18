document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('npsForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultContributions = document.getElementById('resultContributions');
  const resultCorpus = document.getElementById('resultCorpus');
  const resultLumpSum = document.getElementById('resultLumpSum');
  const resultPension = document.getElementById('resultPension');
  const resultAnnuity = document.getElementById('resultAnnuity');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('npsChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const retirementAge = parseFloat(document.getElementById('retirementAge').value);
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const employerContribution = parseFloat(document.getElementById('employerContribution').value);
    const currentBalance = parseFloat(document.getElementById('currentNpsBalance').value);
    const annualReturn = parseFloat(document.getElementById('expectedReturnRate').value);
    const annuityPct = parseFloat(document.getElementById('annuityPurchase').value);
    const annuityReturn = parseFloat(document.getElementById('annuityReturnRate').value);

    if (!currentAge || !retirementAge || !monthlyContribution || !annualReturn || !annuityPct || !annuityReturn) {
      alert('Please enter valid positive values.');
      return;
    }

    const years = retirementAge - currentAge;
    if (years <= 0) {
      alert('Retirement age must be greater than current age.');
      return;
    }

    const n = years * 12;
    const monthlyTotal = monthlyContribution + employerContribution;
    const r = annualReturn / 12 / 100;

    const fvFromSip = monthlyTotal * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const fvFromBalance = currentBalance * Math.pow(1 + annualReturn / 100, years);
    const corpus = fvFromSip + fvFromBalance;

    const totalContributions = (monthlyTotal * n) + currentBalance;
    const annuityAmount = corpus * (annuityPct / 100);
    const lumpSum = corpus - annuityAmount;
    const monthlyPension = annuityAmount * (annuityReturn / 100) / 12;

    resultContributions.textContent = '\u20B9 ' + formatNumber(Math.round(totalContributions));
    resultCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(corpus));
    resultLumpSum.textContent = '\u20B9 ' + formatNumber(Math.round(lumpSum));
    resultPension.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyPension));
    resultAnnuity.textContent = '\u20B9 ' + formatNumber(Math.round(annuityAmount));

    const schedule = buildYearlySchedule(monthlyTotal, r, currentBalance, annualReturn, years, currentAge);
    renderSchedule(schedule);
    drawChart(lumpSum, annuityAmount);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildYearlySchedule(monthlyTotal, monthlyRate, currentBalance, annualReturn, totalYears, currentAge) {
    const rows = [];

    for (let year = 1; year <= totalYears; year++) {
      const months = year * 12;
      const totalInvested = (monthlyTotal * months) + currentBalance;
      const fvSip = monthlyTotal * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
      const fvBal = currentBalance * Math.pow(1 + annualReturn / 100, year);
      const corpus = fvSip + fvBal;
      const returns = corpus - totalInvested;

      rows.push({
        year,
        age: currentAge + year,
        investment: Math.round(totalInvested),
        returns: Math.round(returns),
        corpus: Math.round(corpus),
      });
    }

    return rows;
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td>${r.age}</td>
        <td class="text-right">${formatNumber(r.investment)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.corpus)}</td>
      </tr>
    `).join('');
  }

  function drawChart(lumpSum, annuityAmount) {
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
    const total = lumpSum + annuityAmount;
    const segs = [
      { label: 'Lump Sum', value: lumpSum, color: '#16a34a' },
      { label: 'Annuity', value: annuityAmount, color: '#2563eb' },
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
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Lump Sum', 26, legendY + 2);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(110, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Annuity', 126, legendY + 2);
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
