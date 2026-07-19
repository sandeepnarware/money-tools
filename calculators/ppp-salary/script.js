document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pppForm');
  const resultsSection = document.getElementById('resultsSection');

  const pppFactors = { USA: 3.5, UK: 3.0, Canada: 2.8, Australia: 3.2, UAE: 2.5, Singapore: 3.8, Germany: 3.3, Japan: 2.6 };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const salary = parseFloat(document.getElementById('salaryIndia').value);
    const country = document.getElementById('targetCountry').value;

    if (!salary || salary <= 0) { alert('Please enter valid salary.'); return; }

    const factor = pppFactors[country] || 1;
    const equivSalary = salary * factor;
    const diff = (factor - 1) * 100;

    document.getElementById('resultSalaryINR').innerHTML = '&#8377; ' + formatNumber(Math.round(salary));
    document.getElementById('resultPPPFactor').textContent = factor.toFixed(2);
    document.getElementById('resultEquivSalary').innerHTML = '&#8377; ' + formatNumber(Math.round(equivSalary));
    document.getElementById('resultPPPAdj').innerHTML = '&#8377; ' + formatNumber(Math.round(salary));
    document.getElementById('resultDiff').textContent = (diff > 0 ? '+' : '') + diff.toFixed(1) + '% (' + (diff > 0 ? 'more' : 'less') + ' in ' + country + ')';

    drawChart(salary, equivSalary, country);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(india, target, country) {
    const ctx = document.getElementById('pppChart').getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = ctx.canvas.parentElement.clientWidth || 500;
    const displaySize = Math.min(300, containerWidth);
    ctx.canvas.width = displaySize * dpr;
    ctx.canvas.height = displaySize * dpr;
    ctx.canvas.style.width = displaySize + 'px';
    ctx.canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const bars = [
      { label: 'India', value: india, color: '#005c8e' },
      { label: country, value: target, color: '#00652c' },
    ];
    const padding = { top: 20, bottom: 40, left: 50, right: 20 };
    const chartW = displaySize - padding.left - padding.right;
    const chartH = displaySize - padding.top - padding.bottom;
    const maxVal = Math.max(...bars.map(b => b.value), 1);

    ctx.clearRect(0, 0, displaySize, displaySize);

    const barW = chartW / bars.length * 0.6;
    const gap = chartW / bars.length * 0.4;

    bars.forEach((bar, i) => {
      const x = padding.left + i * (barW + gap) + gap / 2;
      const barH = (bar.value / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      ctx.fillStyle = bar.color;
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = '#191c1e';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bar.label, x + barW / 2, displaySize - padding.bottom + 14);

      ctx.fillStyle = '#191c1e';
      ctx.font = 'bold 10px -apple-system, sans-serif';
      ctx.fillText('₹' + formatNumber(Math.round(bar.value)), x + barW / 2, y - 4);
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
