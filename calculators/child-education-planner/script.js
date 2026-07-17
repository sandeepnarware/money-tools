document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('eduForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultYears = document.getElementById('resultYearsToCollege');
  const resultFutureCost = document.getElementById('resultFutureCost');
  const resultTotalCost = document.getElementById('resultTotalCost');
  const resultSaved = document.getElementById('resultSaved');
  const resultMonthlySip = document.getElementById('resultMonthlySip');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('eduChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const childAge = parseFloat(document.getElementById('childAge').value) || 0;
    const collegeAge = parseFloat(document.getElementById('collegeAge').value) || 0;
    const currentCost = parseFloat(document.getElementById('currentCost').value) || 0;
    const infl = parseFloat(document.getElementById('eduInflation').value) || 0;
    const ret = parseFloat(document.getElementById('expectedReturn').value) || 0;
    const saved = parseFloat(document.getElementById('amountSaved').value) || 0;

    if (collegeAge <= childAge) {
      alert('College starting age must be greater than child\'s current age.');
      return;
    }
    if (!currentCost || currentCost <= 0) {
      alert('Please enter a valid education cost.');
      return;
    }

    const yearsToCollege = collegeAge - childAge;
    const months = yearsToCollege * 12;
    const futureCost = currentCost * Math.pow(1 + infl / 100, yearsToCollege);
    const totalCost4 = futureCost * 4;
    const fvSavings = saved * Math.pow(1 + ret / 100, yearsToCollege);
    const remaining = totalCost4 - fvSavings;

    let monthlySip = 0;
    let enough = false;

    if (remaining > 0) {
      const r = ret / 12 / 100;
      monthlySip = remaining / ((Math.pow(1 + r, months) - 1) / r * (1 + r));
    } else {
      enough = true;
    }

    resultYears.textContent = yearsToCollege;
    resultFutureCost.textContent = '\u20B9 ' + formatNumber(Math.round(futureCost));
    resultTotalCost.textContent = '\u20B9 ' + formatNumber(Math.round(totalCost4));
    resultSaved.textContent = '\u20B9 ' + formatNumber(Math.round(saved));

    if (enough) {
      resultMonthlySip.textContent = 'Already have enough!';
      resultMonthlySip.style.fontSize = '1.1rem';
      resultMonthlySip.style.color = 'var(--success)';
    } else {
      resultMonthlySip.textContent = '\u20B9 ' + formatNumber(Math.round(monthlySip));
      resultMonthlySip.style.fontSize = '1.5rem';
      resultMonthlySip.style.color = 'var(--success)';
    }

    const schedule = buildSchedule(childAge, yearsToCollege, monthlySip, ret, fvSavings, enough);
    renderSchedule(schedule);
    drawChart(fvSavings, monthlySip, yearsToCollege, ret, totalCost4, enough);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildSchedule(childAge, years, monthlySip, ret, fvSavings, enough) {
    const rows = [];
    let corpus = 0;

    for (let y = 1; y <= years; y++) {
      const age = childAge + y;
      const annualSavings = enough ? 0 : monthlySip * 12;
      corpus = (corpus + annualSavings) * (1 + ret / 100);
      rows.push({
        year: y,
        age: age,
        savings: Math.round(annualSavings),
        growth: Math.round(corpus - (corpus / (1 + ret / 100))),
        corpus: Math.round(corpus),
      });
    }

    return rows;
  }

  function renderSchedule(schedule) {
    if (schedule.length === 0) {
      scheduleBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">Already have enough savings!</td></tr>';
      return;
    }
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td>${r.age}</td>
        <td class="text-right">${formatNumber(r.savings)}</td>
        <td class="text-right">${formatNumber(r.growth)}</td>
        <td class="text-right">${formatNumber(r.corpus)}</td>
      </tr>
    `).join('');
  }

  function drawChart(fvSavings, monthlySip, years, ret, totalCost, enough) {
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

    const futureSipTotal = enough ? 0 : monthlySip * 12 * years * (1 + ret / 100);

    const totalFunding = totalCost;
    const savedPortion = fvSavings;
    const sipPortion = futureSipTotal;

    const savedAngle = (savedPortion / totalFunding) * Math.PI * 2;
    const sipAngle = (sipPortion / totalFunding) * Math.PI * 2;
    const gap = Math.min(savedAngle, sipAngle) > 0 ? 0.04 : 0;

    ctx.clearRect(0, 0, displaySize, displaySize);

    if (savedPortion > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + savedAngle - gap);
      ctx.closePath();
      ctx.fillStyle = '#1e40af';
      ctx.fill();
    }

    if (sipPortion > 0) {
      const startAngle = -Math.PI / 2 + savedAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sipAngle - gap);
      ctx.closePath();
      ctx.fillStyle = '#16a34a';
      ctx.fill();
    }

    const remainder = totalFunding - savedPortion - sipPortion;
    if (remainder > 0) {
      const startAngle = -Math.PI / 2 + savedAngle + sipAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + (remainder / totalFunding) * Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold ' + (displaySize * 0.065) + 'px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pct = Math.round((Math.min(savedPortion + sipPortion, totalFunding) / totalFunding) * 100);
    ctx.fillText(pct + '%', cx, cy - 8);
    ctx.font = (displaySize * 0.045) + 'px -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('covered', cx, cy + 14);

    const legendY = displaySize - 6;

    if (savedPortion > 0) {
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Already Saved', 26, legendY + 2);
    }

    if (sipPortion > 0) {
      const xOff = savedPortion > 0 ? 130 : 10;
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(xOff, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'left';
      ctx.fillText('Future SIP', xOff + 16, legendY + 2);
    }
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
