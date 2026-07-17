document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('homeVsRentForm');
  const resultsSection = document.getElementById('resultsSection');
  const resultNetWorthBuy = document.getElementById('resultNetWorthBuy');
  const resultNetWorthRent = document.getElementById('resultNetWorthRent');
  const resultWhichBetter = document.getElementById('resultWhichBetter');
  const resultTotalCostBuying = document.getElementById('resultTotalCostBuying');
  const resultTotalCostRenting = document.getElementById('resultTotalCostRenting');
  const resultDifference = document.getElementById('resultDifference');
  const chartCanvas = document.getElementById('homeVsRentChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
    const homePrice = parseFloat(document.getElementById('homePrice').value);
    const downPct = parseFloat(document.getElementById('downPayment').value);
    const loanRate = parseFloat(document.getElementById('loanRate').value);
    const loanTenure = parseFloat(document.getElementById('loanTenure').value);
    const appr = parseFloat(document.getElementById('propertyAppreciation').value);
    const rentIncr = parseFloat(document.getElementById('rentIncrease').value);
    const roi = parseFloat(document.getElementById('returnOnInvestment').value);
    const maintTax = parseFloat(document.getElementById('maintenanceTax').value);
    const horizon = parseFloat(document.getElementById('timeHorizon').value);

    if (!monthlyRent || !homePrice || !loanRate || !loanTenure || !horizon ||
        monthlyRent <= 0 || homePrice <= 0 || loanRate <= 0 || loanTenure <= 0 || horizon <= 0) {
      alert('Please enter valid positive values.');
      return;
    }

    const downAmt = homePrice * downPct / 100;
    const loanAmt = homePrice - downAmt;
    const rLoan = loanRate / 12 / 100;
    const nLoan = loanTenure * 12;
    const EMI = loanAmt * rLoan * Math.pow(1 + rLoan, nLoan) / (Math.pow(1 + rLoan, nLoan) - 1);
    const pHorizon = horizon * 12;

    const totalEMIPaid = EMI * pHorizon;

    const remainingLoan = loanAmt * (Math.pow(1 + rLoan, nLoan) - Math.pow(1 + rLoan, pHorizon)) / (Math.pow(1 + rLoan, nLoan) - 1);
    const houseValue = homePrice * Math.pow(1 + appr / 100, horizon);
    const equity = houseValue - remainingLoan;

    const totalMaint = homePrice * maintTax / 100 * horizon;
    const totalCostBuying = downAmt + totalEMIPaid + totalMaint;

    const fvDown = downAmt * Math.pow(1 + roi / 100, horizon);
    const rInvest = roi / 12 / 100;

    let fvDiff = 0;
    let totalRentPaid = 0;
    for (let month = 1; month <= pHorizon; month++) {
      const yearIdx = Math.floor((month - 1) / 12);
      const currentRent = monthlyRent * Math.pow(1 + rentIncr / 100, yearIdx);
      const diff = EMI - currentRent;
      const remMonths = pHorizon - month;
      fvDiff += diff * Math.pow(1 + rInvest, remMonths);
      totalRentPaid += currentRent;
    }

    const netWorthRent = fvDown + fvDiff;
    const diff = Math.abs(equity - netWorthRent);

    resultNetWorthBuy.textContent = '\u20B9 ' + formatNumber(Math.round(equity));
    resultNetWorthRent.textContent = '\u20B9 ' + formatNumber(Math.round(netWorthRent));
    resultTotalCostBuying.textContent = '\u20B9 ' + formatNumber(Math.round(totalCostBuying));
    resultTotalCostRenting.textContent = '\u20B9 ' + formatNumber(Math.round(totalRentPaid));

    if (equity > netWorthRent) {
      resultWhichBetter.textContent = 'Buy';
      resultWhichBetter.className = 'value success';
    } else if (netWorthRent > equity) {
      resultWhichBetter.textContent = 'Rent';
      resultWhichBetter.className = 'value success';
    } else {
      resultWhichBetter.textContent = 'Equal';
      resultWhichBetter.className = 'value';
    }

    resultDifference.textContent = '\u20B9 ' + formatNumber(Math.round(diff));

    drawChart(equity, netWorthRent);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(val1, val2) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = 300;
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const pad = { top: 30, bottom: 50, left: 70, right: 30 };
    const chartW = displayW - pad.left - pad.right;
    const chartH = displayH - pad.top - pad.bottom;
    const maxVal = Math.max(val1, val2) * 1.3;
    const barW = Math.min(80, chartW * 0.3);
    const gap = (chartW - barW * 2) / 3;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yVal = (maxVal / 4) * i;
      const y = pad.top + chartH - (yVal / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(abbreviate(yVal), pad.left - 8, y + 4);
    }

    const vals = [val1, val2];
    const labels = ['Net Worth Buy', 'Net Worth Rent'];
    const colors = ['#2563eb', '#16a34a'];

    vals.forEach((v, i) => {
      const x = pad.left + gap + i * (gap + barW);
      const barH = (v / maxVal) * chartH;
      ctx.fillStyle = colors[i];
      ctx.fillRect(x, pad.top + chartH - barH, barW, barH);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u20B9 ' + formatNumber(Math.round(v)), x + barW / 2, pad.top + chartH - barH - 6);

      ctx.fillStyle = '#64748b';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(labels[i], x + barW / 2, pad.top + chartH + 18);
    });
  }

  function abbreviate(num) {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
