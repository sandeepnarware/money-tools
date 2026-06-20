document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rvbForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultPropertyValue = document.getElementById('resultPropertyValue');
  const resultMfValue = document.getElementById('resultMfValue');
  const resultEmi = document.getElementById('resultEmi');
  const resultRent = document.getElementById('resultRent');
  const resultSurplus = document.getElementById('resultSurplus');
  const resultPropertyInflAdj = document.getElementById('resultPropertyInflAdj');
  const resultMfInflAdj = document.getElementById('resultMfInflAdj');
  const resultWinner = document.getElementById('resultWinner');

  const cmpBuyUpfront = document.getElementById('cmpBuyUpfront');
  const cmpRentUpfront = document.getElementById('cmpRentUpfront');
  const cmpBuyMonthly = document.getElementById('cmpBuyMonthly');
  const cmpRentMonthly = document.getElementById('cmpRentMonthly');
  const cmpBuyTotalOutflow = document.getElementById('cmpBuyTotalOutflow');
  const cmpRentTotalOutflow = document.getElementById('cmpRentTotalOutflow');
  const cmpBuyFinalAsset = document.getElementById('cmpBuyFinalAsset');
  const cmpRentFinalAsset = document.getElementById('cmpRentFinalAsset');
  const cmpBuyInflAdj = document.getElementById('cmpBuyInflAdj');
  const cmpRentInflAdj = document.getElementById('cmpRentInflAdj');
  const cmpBuyNetGain = document.getElementById('cmpBuyNetGain');
  const cmpRentNetGain = document.getElementById('cmpRentNetGain');
  const cmpBuyNetInflAdj = document.getElementById('cmpBuyNetInflAdj');
  const cmpRentNetInflAdj = document.getElementById('cmpRentNetInflAdj');

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
    const inflationRate = parseFloat(document.getElementById('inflationRate').value);
    const basicSalary = parseFloat(document.getElementById('basicSalary').value);
    const hraReceived = parseFloat(document.getElementById('hraReceived').value);
    const taxSlab = parseFloat(document.getElementById('taxSlab').value);

    if (!propertyPrice || loanRate < 0 || !rentPercent || !sipRate || inflationRate < 0 || propertyPrice <= 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    const downpaymentPct = 0.2;
    const tenureYears = 20;
    const totalMonths = tenureYears * 12;
    const inflFactor = Math.pow(1 + inflationRate / 100, tenureYears);

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
    const propertyValueInflAdj = propertyValueEnd / inflFactor;

    const monthlySipRate = sipRate / 12 / 100;
    const downpaymentGrowth = downpayment * Math.pow(1 + sipRate / 100, tenureYears);
    const surplusSipValue = monthlySurplus > 0
      ? monthlySurplus * (Math.pow(1 + monthlySipRate, totalMonths) - 1) / monthlySipRate * (1 + monthlySipRate)
      : 0;
    const totalMfPortfolio = downpaymentGrowth + surplusSipValue;
    const mfPortfolioInflAdj = totalMfPortfolio / inflFactor;

    const buyTotalOutflow = downpayment + totalEmiPaid;
    const buyNetGain = propertyValueEnd - buyTotalOutflow;
    const buyNetGainInflAdj = propertyValueInflAdj - buyTotalOutflow;

    const rentTotalOutflow = totalRentPaid;
    const rentNetGain = totalMfPortfolio - rentTotalOutflow;
    const rentNetGainInflAdj = mfPortfolioInflAdj - rentTotalOutflow;

    // Headline cards
    resultEmi.textContent = '\u20B9 ' + formatNumber(Math.round(emi));
    resultRent.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyRent));
    resultSurplus.textContent = '\u20B9 ' + formatNumber(Math.round(monthlySurplus));
    resultPropertyValue.textContent = '\u20B9 ' + formatNumber(Math.round(propertyValueEnd));
    resultMfValue.textContent = '\u20B9 ' + formatNumber(Math.round(totalMfPortfolio));
    resultPropertyInflAdj.textContent = 'Inflation-Adj: \u20B9 ' + formatNumber(Math.round(propertyValueInflAdj));
    resultMfInflAdj.textContent = 'Inflation-Adj: \u20B9 ' + formatNumber(Math.round(mfPortfolioInflAdj));
    resultWinner.textContent = totalMfPortfolio > propertyValueEnd ? 'Rent & Invest Wins' : 'Buy Wins';
    resultWinner.style.color = totalMfPortfolio > propertyValueEnd ? '#16a34a' : '#2563eb';

    // Comparison table
    cmpBuyUpfront.textContent = '\u20B9 ' + formatNumber(Math.round(downpayment)) + ' (Downpayment)';
    cmpRentUpfront.textContent = '\u20B9 ' + formatNumber(Math.round(downpayment)) + ' (Invested)';
    cmpBuyMonthly.textContent = '\u20B9 ' + formatNumber(Math.round(emi)) + ' (EMI)';
    cmpRentMonthly.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyRent)) + ' (Rent)';
    cmpBuyTotalOutflow.textContent = '\u20B9 ' + formatNumber(Math.round(buyTotalOutflow));
    cmpRentTotalOutflow.textContent = '\u20B9 ' + formatNumber(Math.round(rentTotalOutflow));
    cmpBuyFinalAsset.textContent = '\u20B9 ' + formatNumber(Math.round(propertyValueEnd));
    cmpRentFinalAsset.textContent = '\u20B9 ' + formatNumber(Math.round(totalMfPortfolio));
    cmpBuyInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(propertyValueInflAdj));
    cmpRentInflAdj.textContent = '\u20B9 ' + formatNumber(Math.round(mfPortfolioInflAdj));
    cmpBuyNetGain.textContent = formatCurrency(buyNetGain);
    cmpRentNetGain.textContent = formatCurrency(rentNetGain);
    cmpBuyNetInflAdj.textContent = formatCurrency(buyNetGainInflAdj);
    cmpRentNetInflAdj.textContent = formatCurrency(rentNetGainInflAdj);

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

    // Insight
    const diff = Math.abs(totalMfPortfolio - propertyValueEnd);
    const diffInflAdj = Math.abs(mfPortfolioInflAdj - propertyValueInflAdj);

    let insight = '';
    if (totalMfPortfolio > propertyValueEnd) {
      insight = 'Renting and investing comes out ahead by <strong>\u20B9 ' + formatNumber(Math.round(diff)) + '</strong> in nominal terms. ';
      insight += 'After adjusting for inflation, the MF portfolio is worth <strong>\u20B9 ' + formatNumber(Math.round(mfPortfolioInflAdj)) + '</strong> ';
      insight += 'vs property at <strong>\u20B9 ' + formatNumber(Math.round(propertyValueInflAdj)) + '</strong> in today\'s purchasing power.';
    } else if (propertyValueEnd > totalMfPortfolio) {
      insight = 'Buying the property comes out ahead by <strong>\u20B9 ' + formatNumber(Math.round(diff)) + '</strong> in nominal terms. ';
      insight += 'After adjusting for inflation, the property is worth <strong>\u20B9 ' + formatNumber(Math.round(propertyValueInflAdj)) + '</strong> ';
      insight += 'vs MF portfolio at <strong>\u20B9 ' + formatNumber(Math.round(mfPortfolioInflAdj)) + '</strong> in today\'s purchasing power.';
    } else {
      insight = 'Both options yield almost identical results.';
    }

    if (monthlySurplus <= 0) {
      insight += '<br><br>Note: EMI (\u20B9 ' + formatNumber(Math.round(emi)) + ') is not higher than rent (\u20B9 ' + formatNumber(Math.round(monthlyRent)) + '), so there is no surplus to invest in SIP.';
    }

    insightBox.innerHTML = insight;

    drawChart(downpayment, totalEmiPaid, propertyValueEnd, propertyValueInflAdj, totalRentPaid, totalMfPortfolio, mfPortfolioInflAdj);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(downpayment, totalEmi, propertyValue, propertyInflAdj, totalRent, mfPortfolio, mfInflAdj) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = Math.round(displayW * 0.6);
    chartCanvas.width = displayW * dpr;
    chartCanvas.height = displayH * dpr;
    chartCanvas.style.width = displayW + 'px';
    chartCanvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const padding = { top: 30, right: 20, bottom: 50, left: 64 };
    const chartW = displayW - padding.left - padding.right;
    const chartH = displayH - padding.top - padding.bottom;

    const buyTotal = downpayment + totalEmi;
    const allValues = [buyTotal, propertyValue, propertyInflAdj, totalRent, mfPortfolio, mfInflAdj];
    const maxVal = Math.max(...allValues) * 1.2;

    const groups = [
      { label: 'Buy Home', bars: [buyTotal, propertyValue, propertyInflAdj] },
      { label: 'Rent & Invest', bars: [totalRent, mfPortfolio, mfInflAdj] },
    ];

    const groupWidth = chartW / groups.length;
    const barW = groupWidth * 0.22;
    const gaps = (groupWidth - barW * 3) / 4;

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

    const barColors = ['#f59e0b', '#2563eb', '#16a34a'];
    const barLabels = ['Total Cost', 'Nominal', 'Infl-Adj'];

    groups.forEach((g, gi) => {
      const gx = padding.left + gi * groupWidth;

      g.bars.forEach((val, bi) => {
        const x = gx + gaps + bi * (gaps + barW);
        const h = (val / maxVal) * chartH;
        ctx.fillStyle = barColors[bi];
        ctx.fillRect(x, getY(val), barW, h);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 10px -apple-system, sans-serif';
        ctx.fillText(abbreviateNumber(val), x + barW / 2, getY(val) - 6);
      });

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      g.label.split(' ').forEach((part, pi) => {
        ctx.fillText(part, gx + groupWidth / 2, padding.top + chartH + 16 + pi * 14);
      });
    });

    ctx.textAlign = 'left';
    const legendItems = [
      { color: '#f59e0b', label: 'Total Cost', x: 10 },
      { color: '#2563eb', label: 'Final Asset (Nominal)', x: 120 },
      { color: '#16a34a', label: 'Final Asset (Infl-Adj)', x: 290 },
    ];
    legendItems.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x, 8, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText(item.label, item.x + 16, 18);
    });
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
