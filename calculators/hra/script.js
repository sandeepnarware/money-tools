document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('hraForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultActualHRA = document.getElementById('resultActualHRA');
  const resultRentMinus10 = document.getElementById('resultRentMinus10');
  const resultCityExemption = document.getElementById('resultCityExemption');
  const resultExemption = document.getElementById('resultExemption');
  const resultTaxable = document.getElementById('resultTaxable');
  const chartCanvas = document.getElementById('hraChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const basic = parseFloat(document.getElementById('basicSalary').value);
    const da = parseFloat(document.getElementById('dearnessAllowance').value) || 0;
    const hra = parseFloat(document.getElementById('hraReceived').value);
    const rent = parseFloat(document.getElementById('rentPaid').value);
    const cityType = document.getElementById('cityType').value;

    if (!basic || !hra || !rent || basic <= 0 || hra <= 0 || rent <= 0) {
      alert('Please enter valid positive values for Basic Salary, HRA, and Rent.');
      return;
    }

    const basicAnnual = basic * 12;
    const daAnnual = da * 12;
    const hraAnnual = hra * 12;
    const rentAnnual = rent * 12;
    const salaryForHRA = basicAnnual + daAnnual;

    const exemption1 = hraAnnual;
    const exemption2 = Math.max(0, rentAnnual - 0.1 * salaryForHRA);
    const exemption3 = salaryForHRA * (cityType === 'Metro' ? 0.5 : 0.4);

    const exemption = Math.min(exemption1, exemption2, exemption3);
    const taxable = hraAnnual - exemption;

    resultActualHRA.textContent = '\u20B9 ' + formatNumber(Math.round(hraAnnual));
    resultRentMinus10.textContent = '\u20B9 ' + formatNumber(Math.round(exemption2));
    resultCityExemption.textContent = '\u20B9 ' + formatNumber(Math.round(exemption3));
    resultExemption.textContent = '\u20B9 ' + formatNumber(Math.round(exemption));
    resultTaxable.textContent = '\u20B9 ' + formatNumber(Math.round(taxable));

    drawChart(exemption, taxable);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(exempted, taxable) {
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
    const total = exempted + taxable;

    ctx.clearRect(0, 0, displaySize, displaySize);

    if (total === 0) return;

    const segs = [
      { label: 'Exempted HRA', value: exempted, color: '#16a34a' },
      { label: 'Taxable HRA', value: taxable, color: '#2563eb' },
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
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Exempted HRA', 26, legendY + 2);

      ctx.fillStyle = '#2563eb';
      ctx.fillRect(130, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Taxable HRA', 146, legendY + 2);
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
