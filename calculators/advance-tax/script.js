document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('advanceTaxForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotalIncome = document.getElementById('resultTotalIncome');
  const resultTaxOnIncome = document.getElementById('resultTaxOnIncome');
  const resultTds = document.getElementById('resultTds');
  const resultNetTax = document.getElementById('resultNetTax');
  const resultAlreadyPaid = document.getElementById('resultAlreadyPaid');
  const resultBalance = document.getElementById('resultBalance');
  const quarterlyBody = document.getElementById('quarterlyBody');
  const chartCanvas = document.getElementById('advanceTaxChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculateTax(income) {
    let tax = 0;
    if (income > 250000) {
      const slab1 = Math.min(income, 500000) - 250000;
      const slab2 = Math.min(income, 1000000) - 500000;
      const slab3 = income - 1000000;

      if (slab1 > 0) tax += slab1 * 0.05;
      if (slab2 > 0) tax += slab2 * 0.20;
      if (slab3 > 0) tax += slab3 * 0.30;
    }
    const cess = tax * 0.04;
    return tax + cess;
  }

  function calculate() {
    const income = parseFloat(document.getElementById('estimatedIncome').value);
    const otherSources = parseFloat(document.getElementById('otherSources').value);
    const tds = parseFloat(document.getElementById('tdsDeducted').value);
    const alreadyPaid = parseFloat(document.getElementById('alreadyPaid').value);

    if (!income || income <= 0) {
      alert('Please enter valid estimated income.');
      return;
    }

    const totalIncome = income + otherSources;
    const taxOnIncome = calculateTax(totalIncome);
    const netTax = Math.max(0, taxOnIncome - tds);
    const balancePayable = Math.max(0, netTax - alreadyPaid);

    resultTotalIncome.textContent = '\u20B9 ' + formatNumber(Math.round(totalIncome));
    resultTaxOnIncome.textContent = '\u20B9 ' + formatNumber(Math.round(taxOnIncome));
    resultTds.textContent = '\u20B9 ' + formatNumber(Math.round(tds));
    resultNetTax.textContent = '\u20B9 ' + formatNumber(Math.round(netTax));
    resultAlreadyPaid.textContent = '\u20B9 ' + formatNumber(Math.round(alreadyPaid));
    resultBalance.textContent = '\u20B9 ' + formatNumber(Math.round(balancePayable));

    const quarters = [
      { name: 'Q1', due: 'June 15', pct: 0.15 },
      { name: 'Q2', due: 'Sep 15', pct: 0.45 },
      { name: 'Q3', due: 'Dec 15', pct: 0.75 },
      { name: 'Q4', due: 'Mar 15', pct: 1.00 },
    ];

    quarterlyBody.innerHTML = quarters.map((q, i) => {
      const cumulative = netTax * q.pct;
      const prevCumulative = i > 0 ? netTax * quarters[i - 1].pct : 0;
      const payment = cumulative - prevCumulative;
      return `
        <tr>
          <td>${q.name}</td>
          <td>${q.due}</td>
          <td class="text-right">${formatNumber(Math.round(cumulative))}</td>
          <td class="text-right">${formatNumber(Math.round(payment))}</td>
        </tr>
      `;
    }).join('');

    drawChart(alreadyPaid, balancePayable);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(paid, balance) {
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
    const total = paid + balance;
    const segs = [
      { label: 'Paid', value: paid, color: '#16a34a' },
      { label: 'Balance', value: balance, color: '#f59e0b' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.closePath(); ctx.fillStyle = '#16a34a'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
        return;
      }
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      const legendY = displaySize - 6;
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('Paid', 26, legendY + 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(70, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Balance', 86, legendY + 2);
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
