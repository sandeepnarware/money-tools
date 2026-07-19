document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lumpsumForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultInvested = document.getElementById('resultInvested');
  const resultReturns = document.getElementById('resultReturns');
  const resultTotal = document.getElementById('resultTotal');
  const resultInflAdj = document.getElementById('resultInflAdj');
  const chartCanvas = document.getElementById('lumpsumChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('investmentAmount').value);
    const annualRate = parseFloat(document.getElementById('expectedReturn').value);
    const years = parseFloat(document.getElementById('investmentPeriod').value);
    const annualInflation = parseFloat(document.getElementById('inflationRate').value);

    if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate <= 0 || isNaN(years) || years <= 0 || isNaN(annualInflation) || annualInflation < 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const fv = P * Math.pow(1 + annualRate / 100, years);
    const estimatedReturns = fv - P;
    const inflAdj = fv / Math.pow(1 + annualInflation / 100, years);

    resultInvested.textContent = '\u20B9 ' + formatNumber(Math.round(P));
    resultReturns.textContent = '\u20B9 ' + formatNumber(Math.round(estimatedReturns));
    resultTotal.textContent = '\u20B9 ' + formatNumber(Math.round(fv));
    resultInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(inflAdj));

    drawChart(P, estimatedReturns);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, currentStart, end);
          ctx.closePath();
          ctx.fillStyle = seg.color;
          ctx.fill();
          ctx.stroke();
        }

        currentStart = segEnd;
      });

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

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
