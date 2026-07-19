document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('debtAvalancheForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalDebt = document.getElementById('resultTotalDebt');
  const resultMinMonthly = document.getElementById('resultMinMonthly');
  const resultIntAvalanche = document.getElementById('resultIntAvalanche');
  const resultPayoffTime = document.getElementById('resultPayoffTime');
  const resultIntMinOnly = document.getElementById('resultIntMinOnly');
  const resultIntSaved = document.getElementById('resultIntSaved');
  const payoffOrder = document.getElementById('payoffOrder');
  const chartCanvas = document.getElementById('debtAvalancheChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const name1 = document.getElementById('debt1Name').value || 'Debt 1';
    const bal1 = parseFloat(document.getElementById('debt1Balance').value) || 0;
    const rate1 = parseFloat(document.getElementById('debt1Rate').value) || 0;
    const min1 = parseFloat(document.getElementById('debt1MinPay').value) || 0;

    const name2 = document.getElementById('debt2Name').value || 'Debt 2';
    const bal2 = parseFloat(document.getElementById('debt2Balance').value) || 0;
    const rate2 = parseFloat(document.getElementById('debt2Rate').value) || 0;
    const min2 = parseFloat(document.getElementById('debt2MinPay').value) || 0;

    const name3 = document.getElementById('debt3Name').value || 'Debt 3';
    const bal3 = parseFloat(document.getElementById('debt3Balance').value) || 0;
    const rate3 = parseFloat(document.getElementById('debt3Rate').value) || 0;
    const min3 = parseFloat(document.getElementById('debt3MinPay').value) || 0;

    const extraPay = parseFloat(document.getElementById('extraPayment').value) || 0;

    const totalDebt = bal1 + bal2 + bal3;
    const minMonthly = min1 + min2 + min3;

    const debts = [
      { name: name1, balance: bal1, rate: rate1, minPay: min1 },
      { name: name2, balance: bal2, rate: rate2, minPay: min2 },
      { name: name3, balance: bal3, rate: rate3, minPay: min3 },
    ];

    const sorted = [...debts].sort((a, b) => b.rate - a.rate);
    payoffOrder.textContent = 'Recommended Payoff Order: ' + sorted.map((d, i) => (i + 1) + '. ' + d.name + ' (' + d.rate + '%)').join(' \u2192 ');

    const bals = [bal1, bal2, bal3];
    const rates = [rate1 / 100 / 12, rate2 / 100 / 12, rate3 / 100 / 12];
    const mins = [min1, min2, min3];
    const order = [0, 1, 2].sort((a, b) => rates[b] - rates[a]);

    let activeBals = [...bals];
    let totalInt = 0;
    let m = 0;
    while (activeBals.some(b => b > 0) && m < 600) {
      let available = extraPay;
      for (let i = 0; i < 3; i++) {
        if (activeBals[i] <= 0) continue;
        let int = activeBals[i] * rates[i];
        totalInt += int;
        activeBals[i] += int;
        let pay = Math.min(mins[i], activeBals[i]);
        activeBals[i] -= pay;
        available += (mins[i] - pay);
      }
      for (let idx of order) {
        if (activeBals[idx] > 0) {
          let extra = Math.min(available, activeBals[idx]);
          activeBals[idx] -= extra;
          break;
        }
      }
      m++;
    }
    const avalancheMonths = m;
    const avalancheInterest = totalInt;

    let minBals = [...bals];
    let minInt = 0;
    let minM = 0;
    while (minBals.some(b => b > 0) && minM < 600) {
      for (let i = 0; i < 3; i++) {
        if (minBals[i] <= 0) continue;
        let int = minBals[i] * rates[i];
        minInt += int;
        minBals[i] += int;
        let pay = Math.min(mins[i], minBals[i]);
        minBals[i] -= pay;
      }
      minM++;
    }

    const years = Math.floor(avalancheMonths / 12);
    const months = avalancheMonths % 12;
    const intSaved = minInt - avalancheInterest;

    resultTotalDebt.textContent = '\u20B9 ' + formatNumber(Math.round(totalDebt));
    resultMinMonthly.textContent = '\u20B9 ' + formatNumber(Math.round(minMonthly));
    resultIntAvalanche.textContent = '\u20B9 ' + formatNumber(Math.round(avalancheInterest));
    resultPayoffTime.textContent = years + ' Yrs ' + months + ' Mos';
    resultIntMinOnly.textContent = '\u20B9 ' + formatNumber(Math.round(minInt));
    resultIntSaved.textContent = '\u20B9 ' + formatNumber(Math.round(intSaved));

    drawChart(bals, [name1, name2, name3]);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(bals, names) {
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
    const total = bals.reduce((a, b) => a + b, 0);

    const colors = ['#005c8e', '#ba1a1a', '#d97706'];

    const segs = bals.map((val, i) => ({ label: names[i], value: val, color: colors[i] }));

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
      const legendItems = segs.filter(s => s.value > 0);
      ctx.font = '12px -apple-system, sans-serif';
      const totalW = legendItems.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (legendItems.length - 1) * 20;
      let legendX = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, legendX + 16, legendY + 2);
        legendX += 16 + ctx.measureText(item.label).width + 20;
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
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});