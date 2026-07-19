document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('gratuityForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultGratuity = document.getElementById('resultGratuity');
  const resultExempt = document.getElementById('resultExempt');
  const resultTaxable = document.getElementById('resultTaxable');
  const chartCanvas = document.getElementById('gratuityChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const basicDa = parseFloat(document.getElementById('basicDa').value);
    const years = parseFloat(document.getElementById('serviceYears').value);
    const act = document.getElementById('applicableAct').value;

    if (!basicDa || !years || basicDa <= 0 || years < 5) {
      alert('Please enter valid values (min 5 years of service).');
      return;
    }

    let gratuity;
    if (act === 'Act') {
      gratuity = (basicDa * 15 / 26) * years;
    } else {
      gratuity = (basicDa * 15 / 30) * years;
    }

    const exempt = Math.min(gratuity, 2000000);
    const taxable = Math.max(0, gratuity - exempt);

    resultGratuity.textContent = '\u20B9 ' + formatNumber(Math.round(gratuity));
    resultExempt.textContent = '\u20B9 ' + formatNumber(Math.round(exempt));
    resultTaxable.textContent = '\u20B9 ' + formatNumber(Math.round(taxable));

    drawChart(exempt, taxable);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(exempt, taxable) {
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
    const total = exempt + taxable;

    const segs = [
      { label: 'Exempt', value: exempt, color: '#00652c' },
      { label: 'Taxable', value: taxable, color: '#ba1a1a' },
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

      const ly = displaySize - 6;
      ctx.fillStyle = '#00652c';
      ctx.fillRect(10, ly - 10, 12, 12);
      ctx.fillStyle = '#191c1e';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Exempt', 26, ly + 2);

      ctx.fillStyle = '#ba1a1a';
      ctx.fillRect(90, ly - 10, 12, 12);
      ctx.fillText('Taxable', 106, ly + 2);
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
