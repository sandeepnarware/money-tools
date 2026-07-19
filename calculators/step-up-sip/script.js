document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stepUpSipForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultInvested = document.getElementById('resultInvested');
  const resultReturns = document.getElementById('resultReturns');
  const resultTotal = document.getElementById('resultTotal');
  const resultInflAdj = document.getElementById('resultInflAdj');
  const resultFinalSip = document.getElementById('resultFinalSip');
  const resultSimpleCorpus = document.getElementById('resultSimpleCorpus');
  const resultAdvantage = document.getElementById('resultAdvantage');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('stepUpSipChart');
  const comparisonCanvas = document.getElementById('comparisonChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('monthlyInvestment').value);
    const stepUp = parseFloat(document.getElementById('stepUpRate').value);
    const annualRate = parseFloat(document.getElementById('expectedReturn').value);
    const years = parseFloat(document.getElementById('investmentPeriod').value);
    const annualInflation = parseFloat(document.getElementById('inflationRate').value);

    if (isNaN(P) || P <= 0 || isNaN(stepUp) || stepUp < 0 || isNaN(annualRate) || annualRate <= 0 || isNaN(years) || years <= 0 || isNaN(annualInflation) || annualInflation < 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const r = annualRate / 100;
    const inflationFactor = Math.pow(1 + annualInflation / 100, years);
    let totalInvestment = 0;
    let totalCorpus = 0;
    const schedule = [];

    for (let i = 0; i < years; i++) {
      const monthlyContrib = P * Math.pow(1 + stepUp / 100, i);
      const yearlyContrib = monthlyContrib * 12;
      const remainingYears = years - i;
      const fv = yearlyContrib * Math.pow(1 + r, remainingYears);
      totalInvestment += yearlyContrib;
      totalCorpus += fv;

      schedule.push({
        year: i + 1,
        monthlySip: Math.round(monthlyContrib),
        investment: Math.round(totalInvestment),
        returns: Math.round(totalCorpus - totalInvestment),
        corpus: Math.round(totalCorpus),
        inflAdj: Math.round(totalCorpus / inflationFactor),
      });
    }

    const estimatedReturns = totalCorpus - totalInvestment;
    const finalMonthlySip = P * Math.pow(1 + stepUp / 100, years - 1);
    const inflAdjCorpus = totalCorpus / inflationFactor;

    // Simple SIP: same starting monthly amount, no step-up, same period & return.
    // Uses the same annual-compounding method as above for a fair comparison.
    let simpleInvestment = 0;
    let simpleCorpus = 0;
    for (let i = 0; i < years; i++) {
      const yearlyContrib = P * 12;
      simpleInvestment += yearlyContrib;
      simpleCorpus += yearlyContrib * Math.pow(1 + r, years - i);
    }
    const simpleReturns = simpleCorpus - simpleInvestment;
    const advantage = totalCorpus - simpleCorpus;

    resultInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInvestment));
    resultReturns.textContent = '\u20B9 ' + formatNumber(Math.round(estimatedReturns));
    resultTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalCorpus));
    resultInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(inflAdjCorpus));
    resultFinalSip.textContent = '\u20B9 ' + formatNumber(Math.round(finalMonthlySip));
    resultSimpleCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(simpleCorpus));
    resultAdvantage.textContent = '\u20B9 ' + formatNumber(Math.round(advantage));

    renderSchedule(schedule);
    drawChart(totalInvestment, estimatedReturns);
    drawComparisonChart(simpleInvestment, simpleReturns, totalInvestment, estimatedReturns);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.monthlySip)}</td>
        <td class="text-right">${formatNumber(r.investment)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.corpus)}</td>
        <td class="text-right">${formatNumber(r.inflAdj)}</td>
      </tr>
    `).join('');
  }

  function drawChart(invested, returns) {
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
    const total = invested + returns;

    const segs = [
      { label: 'Invested', value: invested, color: '#005c8e' },
      { label: 'Returns', value: returns, color: '#00652c' },
    ];

    let angleCursor = -Math.PI / 2;
    const regions = segs.filter(s => s.value > 0).map(seg => {
      const sliceAngle = (seg.value / total) * Math.PI * 2;
      const region = {
        type: 'arc', cx, cy, rInner: radius * 0.82, rOuter: radius,
        start: angleCursor, end: angleCursor + sliceAngle,
        label: seg.label, value: '₹ ' + formatNumber(Math.round(seg.value)), color: seg.color,
      };
      angleCursor += sliceAngle;
      return region;
    });
    ChartTooltip.bind(chartCanvas, regions);

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
      ctx.fillStyle = '#005c8e';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Invested', 26, legendY + 2);

      ctx.fillStyle = '#00652c';
      ctx.fillRect(100, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.fillText('Returns', 116, legendY + 2);
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

  function drawComparisonChart(simpleInv, simpleRet, stepInv, stepRet) {
    const ctx = comparisonCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = comparisonCanvas.parentElement.clientWidth || 500;
    const displayWidth = Math.min(500, containerWidth);
    const displayHeight = 300;
    comparisonCanvas.width = displayWidth * dpr;
    comparisonCanvas.height = displayHeight * dpr;
    comparisonCanvas.style.width = displayWidth + 'px';
    comparisonCanvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);

    const bars = [
      { label: 'Simple SIP', inv: simpleInv, ret: simpleRet },
      { label: 'Step-Up SIP', inv: stepInv, ret: stepRet },
    ];
    const maxTotal = Math.max(simpleInv + simpleRet, stepInv + stepRet);
    const barWidth = displayWidth * 0.22;
    const gap = displayWidth * 0.16;
    const startX = (displayWidth - barWidth * 2 - gap) / 2;
    const bottomY = displayHeight - 54;
    const chartH = bottomY - 44;

    const regions = [];
    bars.forEach((b, i) => {
      const x = startX + i * (barWidth + gap);
      const invH = maxTotal > 0 ? (b.inv / maxTotal) * chartH : 0;
      const retH = maxTotal > 0 ? (b.ret / maxTotal) * chartH : 0;
      regions.push({ type: 'rect', x: x, y: bottomY - invH, w: barWidth, h: invH,
        label: b.label + ' · Invested', value: '₹ ' + formatNumber(Math.round(b.inv)), color: '#005c8e' });
      regions.push({ type: 'rect', x: x, y: bottomY - invH - retH, w: barWidth, h: retH,
        label: b.label + ' · Returns', value: '₹ ' + formatNumber(Math.round(b.ret)), color: '#00652c' });
    });
    ChartTooltip.bind(comparisonCanvas, regions);

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      bars.forEach((b, i) => {
        const total = b.inv + b.ret;
        const x = startX + i * (barWidth + gap);
        const invH = maxTotal > 0 ? (b.inv / maxTotal) * chartH * p : 0;
        const retH = maxTotal > 0 ? (b.ret / maxTotal) * chartH * p : 0;
        ctx.fillStyle = '#005c8e';
        ctx.fillRect(x, bottomY - invH, barWidth, invH);
        ctx.fillStyle = '#00652c';
        ctx.fillRect(x, bottomY - invH - retH, barWidth, retH);

        ctx.fillStyle = '#191c1e';
        ctx.font = 'bold 13px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('₹ ' + formatNumber(Math.round(total)), x + barWidth / 2, bottomY - invH - retH - 8);
        ctx.font = '12px -apple-system, sans-serif';
        ctx.fillText(b.label, x + barWidth / 2, bottomY + 18);
      });

      const legendY = displayHeight - 12;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#005c8e';
      ctx.fillRect(startX, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Invested', startX + 16, legendY);
      ctx.fillStyle = '#00652c';
      ctx.fillRect(startX + 90, legendY - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.fillText('Returns', startX + 106, legendY);
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
