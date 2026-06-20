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

    if (!P || !annualRate || !years || P <= 0 || annualRate <= 0 || years <= 0) {
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

    const pAngle = (principal / total) * Math.PI * 2;
    const iAngle = (totalInterest / total) * Math.PI * 2;

    ctx.clearRect(0, 0, displaySize, displaySize);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + pAngle);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + pAngle, -Math.PI / 2 + pAngle + iAngle);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Principal', 26, legendY + 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(100, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Interest', 116, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
