document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('portAllocForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultTotal = document.getElementById('resultTotal');
  const resultEquity = document.getElementById('resultEquity');
  const resultDebt = document.getElementById('resultDebt');
  const resultGold = document.getElementById('resultGold');
  const resultRealEstate = document.getElementById('resultRealEstate');
  const resultCash = document.getElementById('resultCash');
  const allocBody = document.getElementById('allocBody');
  const allocAdvice = document.getElementById('allocAdvice');
  const idealAgeLabel = document.getElementById('idealAgeLabel');
  const chartCanvas = document.getElementById('portAllocChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function getIdealAllocation(age) {
    const equityTarget = Math.max(25, Math.min(85, 110 - age));
    const goldTarget = age > 60 ? 5 : 10;
    const cashTarget = 5;
    const debtTarget = 100 - equityTarget - goldTarget - cashTarget;
    return { equity: equityTarget, debt: debtTarget, gold: goldTarget, cash: cashTarget };
  }

  function calculate() {
    const age = parseFloat(document.getElementById('userAge').value) || 30;
    const equity = parseFloat(document.getElementById('allocEquity').value) || 0;
    const debt = parseFloat(document.getElementById('allocDebt').value) || 0;
    const gold = parseFloat(document.getElementById('allocGold').value) || 0;
    const realEstate = parseFloat(document.getElementById('allocRealEstate').value) || 0;
    const cash = parseFloat(document.getElementById('allocCash').value) || 0;

    if (equity + debt + gold + cash + realEstate <= 0) {
      alert('Please enter at least one positive value.');
      return;
    }

    const financialTotal = equity + debt + gold + cash;
    const grandTotal = financialTotal + realEstate;

    const ePct = (equity / grandTotal) * 100;
    const dPct = (debt / grandTotal) * 100;
    const gPct = (gold / grandTotal) * 100;
    const rPct = (realEstate / grandTotal) * 100;
    const cPct = (cash / grandTotal) * 100;

    resultTotal.textContent = '\u20B9 ' + formatNumber(Math.round(grandTotal));
    resultEquity.textContent = ePct.toFixed(1) + '%';
    resultDebt.textContent = dPct.toFixed(1) + '%';
    resultGold.textContent = gPct.toFixed(1) + '%';
    resultRealEstate.textContent = rPct.toFixed(1) + '%';
    resultCash.textContent = cPct.toFixed(1) + '%';

    const ideal = getIdealAllocation(age);
    idealAgeLabel.textContent = age;

    const financialPct = (financialTotal / grandTotal) * 100;

    const assets = [
      { name: 'Equity', amount: equity, pct: ePct, ideal: ideal.equity, color: '#2563eb' },
      { name: 'Debt', amount: debt, pct: dPct, ideal: ideal.debt, color: '#16a34a' },
      { name: 'Gold', amount: gold, pct: gPct, ideal: ideal.gold, color: '#f59e0b' },
      { name: 'Real Estate', amount: realEstate, pct: rPct, ideal: null, color: '#ef4444' },
      { name: 'Cash', amount: cash, pct: cPct, ideal: ideal.cash, color: '#8b5cf6' },
    ];

    allocBody.innerHTML = assets.map(a => {
      let action = '-';
      let actionColor = '#64748b';
      if (a.ideal !== null && a.ideal > 0) {
        const diff = a.pct - a.ideal;
        if (diff > 3) {
          action = 'Reduce by \u20B9 ' + formatNumber(Math.round((diff / 100) * grandTotal));
          actionColor = '#ef4444';
        } else if (diff < -3) {
          action = 'Add \u20B9 ' + formatNumber(Math.round((-diff / 100) * grandTotal));
          actionColor = '#16a34a';
        } else {
          action = 'On track';
          actionColor = '#16a34a';
        }
      } else if (a.name === 'Real Estate') {
        action = 'No target (personal)';
        actionColor = '#64748b';
      }
      return `<tr>
        <td>${a.name}</td>
        <td class="text-right">${formatNumber(Math.round(a.amount))}</td>
        <td class="text-right" style="font-weight:600;">${a.pct.toFixed(1)}%</td>
        <td class="text-right" style="font-weight:600;">${a.ideal !== null ? a.ideal + '%' : '-'}</td>
        <td class="text-right" style="color:${actionColor}; font-weight:600;">${action}</td>
      </tr>`;
    }).join('');

    const equityDiff = ePct - ideal.equity;
    const debtDiff = dPct - ideal.debt;
    let advice = '';

    if (Math.abs(equityDiff) <= 3 && Math.abs(dPct - ideal.debt) <= 3 && Math.abs(gPct - ideal.gold) <= 3 && Math.abs(cPct - ideal.cash) <= 3) {
      advice = '<strong style="color:var(--success);">&#10003; Your portfolio is well-aligned with the ideal allocation for your age.</strong>';
    } else {
      const tips = [];
      if (equityDiff > 3) tips.push('Your equity allocation is <strong>' + equityDiff.toFixed(1) + '% higher</strong> than recommended. Consider rebalancing some equity into debt.');
      if (equityDiff < -3) tips.push('Your equity allocation is <strong>' + (-equityDiff).toFixed(1) + '% lower</strong> than recommended. Consider increasing equity exposure for better growth.');
      if (dPct > ideal.debt + 3) tips.push('Debt allocation is high. Consider moving some to equity or gold.');
      if (gPct < ideal.gold - 3) tips.push('Gold allocation is below the recommended ' + ideal.gold + '%. Consider adding gold for diversification.');
      if (cPct < ideal.cash - 2) tips.push('Cash reserves are low. Aim for at least ' + ideal.cash + '% as emergency buffer.');
      advice = tips.map(t => '<div style="display:flex; gap:8px; margin-top:8px;"><span style="color:var(--primary);">&#9654;</span><span>' + t + '</span></div>').join('');
      advice = '<strong style="font-size:1rem;">Rebalancing Suggestions</strong>' + advice;
    }
    allocAdvice.innerHTML = advice;

    drawChart(assets, age);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(data, age) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 400;
    const displaySize = Math.min(400, containerWidth);
    chartCanvas.width = displaySize * dpr;
    chartCanvas.height = displaySize * dpr;
    chartCanvas.style.width = displaySize + 'px';
    chartCanvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const radius = displaySize / 2 - 40;
    const total = data.reduce((s, d) => s + d.amount, 0);

    ctx.clearRect(0, 0, displaySize, displaySize);

    let startAngle = -Math.PI / 2;
    data.forEach(d => {
      const sliceAngle = (d.amount / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold ' + (displaySize * 0.055) + 'px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Age ' + age, cx, cy - 10);
    ctx.font = (displaySize * 0.04) + 'px -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('110 - ' + age + ' rule', cx, cy + 14);

    const legendY = displaySize - 8;
    let legendX = 10;
    data.forEach(d => {
      ctx.fillStyle = d.color;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(d.name, legendX + 16, legendY + 2);
      legendX += ctx.measureText(d.name).width + 30;
      if (legendX > displaySize - 40) { legendX = 10; }
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
