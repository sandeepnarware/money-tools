document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rvbForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultPropertyValue = document.getElementById('resultPropertyValue');
  const resultMfValue = document.getElementById('resultMfValue');
  const resultEmi = document.getElementById('resultEmi');
  const resultRent = document.getElementById('resultRent');

  const cmpBuyUpfront = document.getElementById('cmpBuyUpfront');
  const cmpRentUpfront = document.getElementById('cmpRentUpfront');
  const cmpBuyMonthly = document.getElementById('cmpBuyMonthly');
  const cmpRentMonthly = document.getElementById('cmpRentMonthly');
  const cmpBuyTotalOutflow = document.getElementById('cmpBuyTotalOutflow');
  const cmpRentTotalOutflow = document.getElementById('cmpRentTotalOutflow');
  const cmpBuyFinalAsset = document.getElementById('cmpBuyFinalAsset');
  const cmpRentFinalAsset = document.getElementById('cmpRentFinalAsset');
  const cmpBuyNetGain = document.getElementById('cmpBuyNetGain');
  const cmpRentNetGain = document.getElementById('cmpRentNetGain');

  const hraSection = document.getElementById('hraSection');
  const hraDetails = document.getElementById('hraDetails');
  const insightBox = document.getElementById('insightBox');
  const chartCanvas = document.getElementById('rvbChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const propertyPrice = parseFloat(document.getElementById('propertyPrice').value);
    const loanRate = parseFloat(document.getElementById('loanRate').value);
    const appreciationRate = parseFloat(document.getElementById('appreciationRate').value);
    const rentPercent = parseFloat(document.getElementById('rentPercent').value);
    const sipRate = parseFloat(document.getElementById('sipRate').value);
    const basicSalary = parseFloat(document.getElementById('basicSalary').value);
    const hraReceived = parseFloat(document.getElementById('hraReceived').value);
    const taxSlab = parseFloat(document.getElementById('taxSlab').value);

    if (!propertyPrice || !loanRate || !rentPercent || !sipRate || propertyPrice <= 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    const downpaymentPct = 0.2;
    const tenureYears = 20;
    const totalMonths = tenureYears * 12;

    const downpayment = propertyPrice * downpaymentPct;
    const loanAmount = propertyPrice - downpayment;
    const monthlyLoanRate = loanRate / 12 / 100;

    const emi = loanAmount * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, totalMonths) / (Math.pow(1 + monthlyLoanRate, totalMonths) - 1);
    const totalEmiPaid = emi * totalMonths;
    const totalInterestPaid = totalEmiPaid - loanAmount;

    const annualRent = propertyPrice * (rentPercent / 100);
    const monthlyRent = annualRent / 12;
    const totalRentPaid = monthlyRent * totalMonths;

    const monthlySurplus = Math.max(0, emi - monthlyRent);

    const propertyValueEnd = propertyPrice * Math.pow(1 + appreciationRate / 100, tenureYears);

    const monthlySipRate = sipRate / 12 / 100;
    const downpaymentGrowth = downpayment * Math.pow(1 + sipRate / 100, tenureYears);
    const surplusSipValue = monthlySurplus > 0
      ? monthlySurplus * (Math.pow(1 + monthlySipRate, totalMonths) - 1) / monthlySipRate * (1 + monthlySipRate)
      : 0;
    const totalMfPortfolio = downpaymentGrowth + surplusSipValue;

    const buyTotalOutflow = downpayment + totalEmiPaid;
    const buyNetGain = propertyValueEnd - buyTotalOutflow;

    const rentTotalOutflow = totalRentPaid;
    const rentNetGain = totalMfPortfolio - rentTotalOutflow;

    resultPropertyValue.textContent = '\u20B9 ' + formatNumber(Math.round(propertyValueEnd));
    resultMfValue.textContent = '\u20B9 ' + formatNumber(Math.round(totalMfPortfolio));
    resultEmi.textContent = '\u20B9 ' + formatNumber(Math.round(emi));
    resultRent.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyRent));

    cmpBuyUpfront.textContent = '\u20B9 ' + formatNumber(Math.round(downpayment)) + ' (Downpayment)';
    cmpRentUpfront.textContent = '\u20B9 ' + formatNumber(Math.round(downpayment)) + ' (Invested)';
    cmpBuyMonthly.textContent = '\u20B9 ' + formatNumber(Math.round(emi)) + ' (EMI)';
    cmpRentMonthly.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyRent)) + ' (Rent)';
    cmpBuyTotalOutflow.textContent = '\u20B9 ' + formatNumber(Math.round(buyTotalOutflow));
    cmpRentTotalOutflow.textContent = '\u20B9 ' + formatNumber(Math.round(rentTotalOutflow));
    cmpBuyFinalAsset.textContent = '\u20B9 ' + formatNumber(Math.round(propertyValueEnd));
    cmpRentFinalAsset.textContent = '\u20B9 ' + formatNumber(Math.round(totalMfPortfolio));
    cmpBuyNetGain.textContent = formatCurrency(buyNetGain);
    cmpRentNetGain.textContent = formatCurrency(rentNetGain);

    // HRA
    if (basicSalary > 0 && hraReceived > 0 && taxSlab > 0) {
      const rentMinus10Pct = monthlyRent - 0.1 * basicSalary;
      const fiftyPctBasic = 0.5 * basicSalary;
      const hraExemptionMonthly = Math.max(0, Math.min(hraReceived, rentMinus10Pct, fiftyPctBasic));
      const hraExemptionAnnual = hraExemptionMonthly * 12;
      const taxSavedAnnual = hraExemptionAnnual * (taxSlab / 100);
      const taxSavedTotal = taxSavedAnnual * tenureYears;

      hraDetails.innerHTML =
        'Monthly HRA Exemption: <strong>\u20B9 ' + formatNumber(Math.round(hraExemptionMonthly)) + '</strong><br>' +
        'Annual HRA Exemption: <strong>\u20B9 ' + formatNumber(Math.round(hraExemptionAnnual)) + '</strong><br>' +
        'Annual Tax Saved (at ' + taxSlab + '% slab): <strong>\u20B9 ' + formatNumber(Math.round(taxSavedAnnual)) + '</strong><br>' +
        'Total Tax Saved over 20 years: <strong style="color:#16a34a;">\u20B9 ' + formatNumber(Math.round(taxSavedTotal)) + '</strong>';
      hraSection.style.display = 'block';
    } else {
      hraSection.style.display = 'none';
    }

    // Insight text
    const winner = totalMfPortfolio > propertyValueEnd ? 'Rent &amp; Invest' : 'Buy';
    const loser = totalMfPortfolio > propertyValueEnd ? 'Buy' : 'Rent &amp; Invest';
    const diff = Math.abs(totalMfPortfolio - propertyValueEnd);
    const betterGain = totalMfPortfolio > propertyValueEnd ? rentNetGain : buyNetGain;
    const worseGain = totalMfPortfolio > propertyValueEnd ? buyNetGain : rentNetGain;

    let insight = '';
    if (totalMfPortfolio > propertyValueEnd) {
      insight = 'Renting and investing the difference comes out ahead by <strong>\u20B9 ' + formatNumber(Math.round(diff)) + '</strong>. ' +
        'Your MF portfolio grows to <strong>\u20B9 ' + formatNumber(Math.round(totalMfPortfolio)) + '</strong> vs property value of <strong>\u20B9 ' + formatNumber(Math.round(propertyValueEnd)) + '</strong>.';
    } else if (propertyValueEnd > totalMfPortfolio) {
      insight = 'Buying the property comes out ahead by <strong>\u20B9 ' + formatNumber(Math.round(diff)) + '</strong>. ' +
        'Property value grows to <strong>\u20B9 ' + formatNumber(Math.round(propertyValueEnd)) + '</strong> vs MF portfolio of <strong>\u20B9 ' + formatNumber(Math.round(totalMfPortfolio)) + '</strong>.';
    } else {
      insight = 'Both options yield almost identical results.';
    }

    if (monthlySurplus <= 0) {
      insight += '<br><br>Note: EMI (\u20B9 ' + formatNumber(Math.round(emi)) + ') is less than or equal to rent (\u20B9 ' + formatNumber(Math.round(monthlyRent)) + '), so there is no surplus to invest in SIP.';
    }

    insightBox.innerHTML = insight;

    drawChart(downpayment, totalEmiPaid, propertyValueEnd, totalRentPaid, totalMfPortfolio);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(downpayment, totalEmi, propertyValue, totalRent, mfPortfolio) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = Math.round(displayW * 0.55);
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const padding = { top: 24, right: 20, bottom: 50, left: 64 };
    const chartW = displayW - padding.left - padding.right;
    const chartH = displayH - padding.top - padding.bottom;

    const buyTotal = downpayment + totalEmi;
    const values = [buyTotal, propertyValue, totalRent, mfPortfolio];
    const maxVal = Math.max(...values) * 1.2;

    const groups = [
      { label: 'Buy Home', bars: [buyTotal, propertyValue] },
      { label: 'Rent & Invest', bars: [totalRent, mfPortfolio] },
    ];

    const groupWidth = chartW / groups.length;
    const barWidth = groupWidth * 0.3;
    const barOffset = (groupWidth - barWidth * 2) / 3;

    function getY(val) {
      return padding.top + chartH - (val / maxVal) * chartH;
    }

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const ySteps = 5;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px -apple-system, sans-serif';
    for (let i = 0; i <= ySteps; i++) {
      const val = (maxVal / ySteps) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(abbreviateNumber(val), padding.left - 8, y + 4);
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    const barColors = ['#f59e0b', '#2563eb'];

    groups.forEach((g, gi) => {
      const gx = padding.left + gi * groupWidth;

      g.bars.forEach((val, bi) => {
        const x = gx + barOffset + bi * (barOffset + barWidth);
        const h = (val / maxVal) * chartH;
        ctx.fillStyle = barColors[bi];
        ctx.fillRect(x, getY(val), barWidth, h);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.fillText('\u20B9 ' + abbreviateNumber(val), x + barWidth / 2, getY(val) - 8);
      });

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      g.label.split(' ').forEach((part, pi) => {
        ctx.fillText(part, gx + groupWidth / 2, padding.top + chartH + 16 + pi * 14);
      });
    });

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(10, 8, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Total Cost', 26, 18);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(120, 8, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Final Asset', 136, 18);
  }

  function abbreviateNumber(num) {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  }

  function formatCurrency(num) {
    const formatted = Math.abs(Math.round(num)).toLocaleString('en-IN');
    return num < 0 ? '(\u20B9 ' + formatted + ')' : '\u20B9 ' + formatted;
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
