document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('subForm');
  const resultsSection = document.getElementById('resultsSection');
  const chartCanvas = document.getElementById('subChart');

  const resultMonthlyTotal = document.getElementById('resultMonthlyTotal');
  const resultAnnualTotal = document.getElementById('resultAnnualTotal');
  const resultIncome = document.getElementById('resultIncome');
  const resultIncomePct = document.getElementById('resultIncomePct');
  const resultCount = document.getElementById('resultCount');
  const resultAvgCost = document.getElementById('resultAvgCost');
  const resultSavings = document.getElementById('resultSavings');
  const subBody = document.getElementById('subBody');

  const SUB_COLORS = ['#005c8e', '#00652c', '#d97706', '#ba1a1a', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#545f73'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncome').value) || 0;
    const additionalCount = parseInt(document.getElementById('additionalCount').value) || 0;
    const avgAdditionalCost = parseFloat(document.getElementById('avgAdditionalCost').value) || 0;

    const subs = [];
    for (let i = 1; i <= 8; i++) {
      const name = document.getElementById('subName' + i).value || 'Sub ' + i;
      const cost = parseFloat(document.getElementById('subCost' + i).value) || 0;
      subs.push({ name, cost, index: i });
    }

    const namedCosts = subs.map(s => s.cost);
    const totalNamedCost = namedCosts.reduce((s, c) => s + c, 0);
    const additionalCost = additionalCount * avgAdditionalCost;
    const totalMonthly = totalNamedCost + additionalCost;
    const totalAnnual = totalMonthly * 12;
    const totalCount = 8 + additionalCount;
    const avgCost = totalCount > 0 ? totalMonthly / totalCount : 0;
    const incomePct = income > 0 ? (totalMonthly / income) * 100 : 0;

    const sortedCosts = [...namedCosts].sort((a, b) => a - b);
    const potentialSavings = (sortedCosts[0] + sortedCosts[1]) * 12;

    resultMonthlyTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalMonthly));
    resultAnnualTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalAnnual));
    resultIncome.textContent = '\u20B9 ' + formatNumber(Math.round(income));
    resultIncomePct.textContent = incomePct.toFixed(1) + '%';
    resultIncomePct.className = 'value' + (incomePct > 10 ? ' danger' : '');
    resultCount.textContent = totalCount;
    resultAvgCost.textContent = '\u20B9 ' + formatNumber(Math.round(avgCost));
    resultSavings.textContent = '\u20B9 ' + formatNumber(Math.round(potentialSavings));

    const chartData = subs.map((s, i) => ({ label: s.name, value: s.cost, color: SUB_COLORS[i] }));
    if (additionalCount > 0) {
      chartData.push({ label: 'Other (' + additionalCount + ' subs)', value: additionalCost, color: SUB_COLORS[8] });
    }
    drawDonut(chartData);

    let tableRows = '';
    subs.forEach((s, i) => {
      const annual = s.cost * 12;
      const pct = totalMonthly > 0 ? (s.cost / totalMonthly) * 100 : 0;
      tableRows += `
        <tr>
          <td>${i + 1}</td>
          <td>${s.name}</td>
          <td class="text-right">${formatNumber(Math.round(s.cost))}</td>
          <td class="text-right">${formatNumber(Math.round(annual))}</td>
          <td class="text-right">${pct.toFixed(1)}%</td>
        </tr>
      `;
    });
    if (additionalCount > 0) {
      const annualAdditional = additionalCost * 12;
      const pct = totalMonthly > 0 ? (additionalCost / totalMonthly) * 100 : 0;
      tableRows += `
        <tr>
          <td>${subs.length + 1}</td>
          <td>Additional (${additionalCount} subs)</td>
          <td class="text-right">${formatNumber(Math.round(additionalCost))}</td>
          <td class="text-right">${formatNumber(Math.round(annualAdditional))}</td>
          <td class="text-right">${pct.toFixed(1)}%</td>
        </tr>
      `;
    }
    subBody.innerHTML = tableRows;

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawDonut(data) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);

    const cols = data.length > 8 ? 3 : 2;
    const legendRows = Math.ceil(data.length / cols);
    const legendSpace = legendRows * 16 + 10;

    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = (displaySize - legendSpace) / 2 + 10;
    const radius = Math.min(displaySize / 2 - 20, cy - 20);
    const innerRadius = radius * 0.82;

    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;

    let angleCursor = -Math.PI / 2;
    const regions = data.filter(d => d.value > 0).map(d => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      const region = {
        type: 'arc', cx, cy, rInner: innerRadius, rOuter: radius,
        start: angleCursor, end: angleCursor + sliceAngle,
        label: d.label, value: '₹ ' + formatNumber(Math.round(d.value)), color: d.color,
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
      data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath();
          ctx.arc(cx, cy, radius, currentStart, end);
          ctx.arc(cx, cy, innerRadius, end, currentStart, true);
          ctx.closePath();
          ctx.fillStyle = d.color;
          ctx.fill();
          ctx.stroke();
        }
        currentStart = segEnd;
      });

      ctx.font = '10px -apple-system, sans-serif';
      const activeData = data.filter(d => d.value > 0);
      const totalW = activeData.reduce((s, d) => s + 12 + ctx.measureText(d.label).width, 0) + (activeData.length - 1) * 16;
      let lx = (displaySize - totalW) / 2;
      const ly = displaySize - 6;
      activeData.forEach(d => {
        ctx.fillStyle = d.color;
        ctx.fillRect(lx, ly - 7, 8, 8);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(d.label, lx + 12, ly + 1);
        lx += 12 + ctx.measureText(d.label).width + 16;
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
