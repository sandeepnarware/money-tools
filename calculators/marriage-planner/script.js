document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('marriageForm');
  const resultsSection = document.getElementById('resultsSection');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const marriageAge = parseFloat(document.getElementById('marriageAge').value);
    const cost = parseFloat(document.getElementById('marriageCost').value);
    const saved = parseFloat(document.getElementById('alreadySavedM').value);
    const annualReturn = parseFloat(document.getElementById('expectedReturnM').value);
    const inflation = parseFloat(document.getElementById('inflationRateM').value);

    if (!currentAge || !marriageAge || marriageAge <= currentAge) {
      alert('Please enter valid ages (marriage age must be greater than current age).');
      return;
    }
    if (!cost || cost <= 0) { alert('Please enter valid cost.'); return; }

    const years = marriageAge - currentAge;
    const futureCost = cost * Math.pow(1 + inflation / 100, years);
    const fvSaved = saved * Math.pow(1 + annualReturn / 100, years);
    const remaining = futureCost - fvSaved;

    let monthlySIP = 0;
    if (remaining > 0 && years > 0) {
      const r = annualReturn / 12 / 100;
      const n = years * 12;
      monthlySIP = remaining / ((Math.pow(1 + r, n) - 1) / r * (1 + r));
    }

    document.getElementById('resultYearsM').textContent = formatNumber(Math.round(years)) + ' years';
    document.getElementById('resultFutureCost').innerHTML = '&#8377; ' + formatNumber(Math.round(futureCost));
    document.getElementById('resultTotalNeededM').innerHTML = '&#8377; ' + formatNumber(Math.round(remaining > 0 ? remaining : 0));
    document.getElementById('resultMonthlySIP').innerHTML = '&#8377; ' + formatNumber(Math.round(monthlySIP));
    document.getElementById('resultSavedFV').innerHTML = '&#8377; ' + formatNumber(Math.round(fvSaved));

    drawChart(fvSaved, remaining > 0 ? remaining : 0, futureCost);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(fvSaved, remaining, futureCost) {
    const ctx = document.getElementById('marriageChart').getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = ctx.canvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);
    ctx.canvas.width = displaySize * dpr;
    ctx.canvas.height = displaySize * dpr;
    ctx.canvas.style.width = displaySize + 'px';
    ctx.canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const radius = displaySize / 2 - 20;
    const segs = [
      { label: 'Saved FV', value: fvSaved, color: '#16a34a' },
      { label: 'SIP Needed', value: remaining, color: '#2563eb' },
    ];
    const total = fvSaved + remaining;
    if (total === 0) return;

    ctx.clearRect(0, 0, displaySize, displaySize);
    let startAngle = -Math.PI / 2;
    segs.forEach(seg => {
      if (seg.value <= 0) return;
      const angle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += angle;
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
