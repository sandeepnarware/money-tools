document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('emiForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultEmi = document.getElementById('resultEmi');
  const resultInterest = document.getElementById('resultInterest');
  const resultTotal = document.getElementById('resultTotal');
  const amortBody = document.getElementById('amortBody');
  const chartCanvas = document.getElementById('emiChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const P = parseFloat(document.getElementById('loanAmount').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const years = parseFloat(document.getElementById('loanTenure').value);

    if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate <= 0 || isNaN(years) || years <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const n = years * 12;
    const r = annualRate / 12 / 100;

    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    resultEmi.textContent = '\u20B9 ' + formatNumber(Math.round(emi));
    resultInterest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));
    resultTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalPayment));

    const schedule = buildAmortizationSchedule(P, emi, r, n);
    renderAmortizationTable(schedule);
    drawChart(P, totalInterest);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildAmortizationSchedule(principal, emi, monthlyRate, totalMonths) {
    let balance = principal;
    const yearlyRows = [];
    let yearStartBalance = principal;
    let yearEmi = 0;
    let yearPrincipal = 0;
    let yearInterest = 0;
    let year = 1;

    for (let i = 1; i <= totalMonths; i++) {
      const interest = balance * monthlyRate;
      const principalPaid = emi - interest;
      balance = Math.max(0, balance - principalPaid);

      yearEmi += emi;
      yearPrincipal += principalPaid;
      yearInterest += interest;

      if (i % 12 === 0 || i === totalMonths) {
        yearlyRows.push({
          year,
          opening: Math.round(yearStartBalance),
          emiPaid: Math.round(yearEmi),
          principal: Math.round(yearPrincipal),
          interest: Math.round(yearInterest),
          closing: Math.round(balance),
        });
        yearStartBalance = balance;
        yearEmi = 0;
        yearPrincipal = 0;
        yearInterest = 0;
        year++;
      }
    }

    return yearlyRows;
  }

  function renderAmortizationTable(schedule) {
    amortBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="text-right">${formatNumber(r.opening)}</td>
        <td class="text-right">${formatNumber(r.emiPaid)}</td>
        <td class="text-right">${formatNumber(r.principal)}</td>
        <td class="text-right">${formatNumber(r.interest)}</td>
        <td class="text-right">${formatNumber(r.closing)}</td>
      </tr>
    `).join('');
  }

  function drawChart(principal, totalInterest) {
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
    const total = principal + totalInterest;

    const segs = [
      { label: 'Principal', value: principal, color: '#005c8e' },
      { label: 'Interest', value: totalInterest, color: '#d97706' },
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
      const legendItems = [
        { color: '#005c8e', label: 'Principal' },
        { color: '#d97706', label: 'Interest' },
      ];
      ctx.font = '12px -apple-system, sans-serif';
      const totalW = legendItems.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (legendItems.length - 1) * 20;
      let lx = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, lx + 16, legendY + 2);
        lx += 16 + ctx.measureText(item.label).width + 20;
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
