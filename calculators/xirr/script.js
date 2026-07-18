function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

function parseDate(str) {
  const parts = str.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function daysBetween(d1, d2) {
  return (d2 - d1) / (1000 * 60 * 60 * 24);
}

function xirrNpv(cashflows, rate) {
  const baseDate = cashflows[0].date;
  let npv = 0;
  for (const cf of cashflows) {
    const days = daysBetween(baseDate, cf.date);
    npv += cf.amount / Math.pow(1 + rate, days / 365);
  }
  return npv;
}

function xirrNpvDerivative(cashflows, rate) {
  const baseDate = cashflows[0].date;
  let dnpv = 0;
  for (const cf of cashflows) {
    const days = daysBetween(baseDate, cf.date);
    dnpv += cf.amount * (-days / 365) / Math.pow(1 + rate, days / 365 + 1);
  }
  return dnpv;
}

function calculateXirr(cashflows) {
  if (cashflows.length < 2) return null;

  const hasNegative = cashflows.some(c => c.amount < 0);
  const hasPositive = cashflows.some(c => c.amount > 0);
  if (!hasNegative || !hasPositive) return null;

  cashflows.sort((a, b) => a.date - b.date);

  let rate = 0.1;
  for (let i = 0; i < 1000; i++) {
    const npv = xirrNpv(cashflows, rate);
    const dnpv = xirrNpvDerivative(cashflows, rate);
    if (Math.abs(dnpv) < 1e-15) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-10) return newRate;
    rate = newRate;
  }
  return rate;
}

document.addEventListener('DOMContentLoaded', () => {
  const cashflowBody = document.getElementById('cashflowBody');
  const addRowBtn = document.getElementById('addRowBtn');
  const calculateBtn = document.getElementById('calculateXirrBtn');
  const resultsSection = document.getElementById('resultsSection');
  const resultXirr = document.getElementById('resultXirr');
  const resultTotalInvested = document.getElementById('resultTotalInvested');
  const resultTotalReturns = document.getElementById('resultTotalReturns');
  const resultAbsReturn = document.getElementById('resultAbsReturn');
  const chartCanvas = document.getElementById('xirrChart');

  function createRow(dateVal, amountVal) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="date" class="cf-date" value="${dateVal}" style="width:100%; padding:8px; font-size:0.9rem; border:1px solid var(--border); border-radius:6px; background:var(--surface); color:var(--text); outline:none;"></td>
      <td><input type="number" class="cf-amount" value="${amountVal}" step="any" style="width:100%; padding:8px; font-size:0.9rem; border:1px solid var(--border); border-radius:6px; background:var(--surface); color:var(--text); outline:none;"></td>
      <td><button type="button" class="btn btn-secondary" style="padding:6px 10px; font-size:0.8rem;">✕</button></td>
    `;
    tr.querySelector('button').addEventListener('click', () => {
      if (cashflowBody.children.length > 2) {
        tr.remove();
      } else {
        alert('At least 2 cash flow entries are required.');
      }
    });
    return tr;
  }

  const today = dateStr(new Date());
  const monthsAgo = (m) => {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    return dateStr(d);
  };

  const defaults = [
    { date: monthsAgo(12), amount: -10000 },
    { date: monthsAgo(11), amount: -10000 },
    { date: monthsAgo(10), amount: -10000 },
    { date: monthsAgo(9), amount: -10000 },
    { date: monthsAgo(8), amount: -10000 },
    { date: monthsAgo(7), amount: -10000 },
    { date: monthsAgo(6), amount: -10000 },
    { date: monthsAgo(5), amount: -10000 },
    { date: monthsAgo(4), amount: -10000 },
    { date: monthsAgo(3), amount: -10000 },
    { date: monthsAgo(2), amount: -10000 },
    { date: monthsAgo(1), amount: -10000 },
    { date: today, amount: 135000 },
  ];

  defaults.forEach(d => cashflowBody.appendChild(createRow(d.date, d.amount)));

  addRowBtn.addEventListener('click', () => {
    cashflowBody.appendChild(createRow(today, ''));
  });

  calculateBtn.addEventListener('click', () => {
    const rows = cashflowBody.querySelectorAll('tr');
    const cashflows = [];
    for (const row of rows) {
      const dateInput = row.querySelector('.cf-date');
      const amountInput = row.querySelector('.cf-amount');
      const dateVal = dateInput.value;
      const amountVal = parseFloat(amountInput.value);
      if (!dateVal || isNaN(amountVal) || amountVal === 0) {
        alert('Please fill in all date and amount fields. Amounts must be non-zero.');
        return;
      }
      cashflows.push({ date: parseDate(dateVal), amount: amountVal });
    }

    if (cashflows.length < 2) {
      alert('Please enter at least 2 cash flow entries.');
      return;
    }

    const hasNegative = cashflows.some(c => c.amount < 0);
    const hasPositive = cashflows.some(c => c.amount > 0);
    if (!hasNegative || !hasPositive) {
      alert('You need at least one negative (investment) and one positive (withdrawal/value) amount.');
      return;
    }

    const xirrRate = calculateXirr(cashflows);
    if (xirrRate === null || !isFinite(xirrRate)) {
      alert('Could not calculate XIRR. Please check your cash flows.');
      return;
    }

    const totalInv = cashflows.filter(c => c.amount < 0).reduce((s, c) => s + Math.abs(c.amount), 0);
    const totalRet = cashflows.filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0);
    const absReturn = ((totalRet - totalInv) / totalInv) * 100;

    resultXirr.textContent = (xirrRate * 100).toFixed(2) + '%';
    resultTotalInvested.textContent = '\u20B9 ' + formatNumber(Math.round(totalInv));
    resultTotalReturns.textContent = '\u20B9 ' + formatNumber(Math.round(totalRet));
    resultAbsReturn.textContent = absReturn.toFixed(2) + '%';

    drawChart(cashflows);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function drawChart(cashflows) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);
    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displaySize, displaySize);

    const padding = { top: 24, right: 20, bottom: 50, left: 64 };
    const chartW = displaySize - padding.left - padding.right;
    const chartH = displaySize - padding.top - padding.bottom;

    const investments = cashflows.filter(c => c.amount < 0).reduce((s, c) => s + Math.abs(c.amount), 0);
    const returns = cashflows.filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0);
    const net = returns - investments;
    const total = investments + returns;

    if (total === 0) return;

    const cx = displaySize / 2;
    const cy = displaySize / 2 + 10;
    const radius = displaySize / 2 - 40;

    const segs = [
      { label: 'Invested', value: investments, color: '#2563eb' },
      { label: 'Returns', value: returns, color: '#16a34a' },
    ];
    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      if (total <= 0) return;
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
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      if (net >= 0) {
        ctx.fillStyle = '#16a34a';
        ctx.fillText('+' + formatNumber(Math.round(net)), cx, cy + 5);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillText(formatNumber(Math.round(net)), cx, cy + 5);
      }
      const legendY = displaySize - 8;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(cx - 60, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Invested', cx - 44, legendY + 2);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(cx + 10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Returns', cx + 26, legendY + 2);
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
});
