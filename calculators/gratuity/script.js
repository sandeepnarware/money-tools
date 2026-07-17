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

    const ang1 = (exempt / total) * Math.PI * 2;
    const ang2 = (taxable / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + ang1);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + ang1, -Math.PI / 2 + ang1 + ang2);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    const ly = displaySize - 6;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(10, ly - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Exempt', 26, ly + 2);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(90, ly - 10, 12, 12);
    ctx.fillText('Taxable', 106, ly + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
