document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('coastFireForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultFireNumber = document.getElementById('resultFireNumber');
  const resultFvAtRetire = document.getElementById('resultFvAtRetire');
  const resultCoastNumber = document.getElementById('resultCoastNumber');
  const resultCoastGap = document.getElementById('resultCoastGap');
  const resultMonthlyNeeded = document.getElementById('resultMonthlyNeeded');
  const chartCanvas = document.getElementById('coastFireChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const annualExpenses = parseFloat(document.getElementById('annualExpenses').value);
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
    const withdrawalRate = parseFloat(document.getElementById('withdrawalRate').value);
    const coastAge = parseFloat(document.getElementById('coastAge').value);
    const retireAge = parseFloat(document.getElementById('retireAge').value);

    if (!currentAge || !currentSavings || !annualExpenses || !expectedReturn || !withdrawalRate || !coastAge || !retireAge) {
      alert('Please enter valid values.');
      return;
    }
    if (coastAge <= currentAge) {
      alert('Coast age must be greater than current age.');
      return;
    }
    if (retireAge <= coastAge) {
      alert('Retirement age must be greater than coast age.');
      return;
    }

    const r = expectedReturn / 100;
    const fireNum = annualExpenses / (withdrawalRate / 100);

    const yearsToRetire = retireAge - currentAge;
    const yearsToCoast = coastAge - currentAge;
    const yearsCoastToRetire = retireAge - coastAge;

    const fvAtRetire = currentSavings * Math.pow(1 + r, yearsToRetire);
    const fvAtCoast = currentSavings * Math.pow(1 + r, yearsToCoast);
    const fvFromCoast = fvAtCoast * Math.pow(1 + r, yearsCoastToRetire);

    let coastTarget, gap, monthlyNeeded;

    if (fvFromCoast >= fireNum) {
      coastTarget = 0;
      gap = 0;
      monthlyNeeded = 0;
      resultMonthlyNeeded.parentElement.innerHTML = '<div class="label">Monthly Savings Needed to Coast</div><div class="value primary" id="resultMonthlyNeeded">You\'ve already hit Coast FIRE!</div>';
    } else {
      coastTarget = fireNum / Math.pow(1 + r, yearsCoastToRetire);
      gap = coastTarget - fvAtCoast;
      const pmtRate = r / 12;
      const pmtN = yearsToCoast * 12;
      monthlyNeeded = gap * pmtRate / (Math.pow(1 + pmtRate, pmtN) - 1) / (1 + pmtRate);
      resultMonthlyNeeded.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyNeeded));
    }

    resultFireNumber.textContent = '\u20B9 ' + formatNumber(Math.round(fireNum));
    resultFvAtRetire.textContent = '\u20B9 ' + formatNumber(Math.round(fvFromCoast));
    resultCoastNumber.textContent = '\u20B9 ' + formatNumber(Math.round(coastTarget));
    resultCoastGap.textContent = '\u20B9 ' + formatNumber(Math.round(gap));
    if (monthlyNeeded > 0) {
      resultMonthlyNeeded.textContent = '\u20B9 ' + formatNumber(Math.round(monthlyNeeded));
    }

    drawChart(fireNum, fvFromCoast, currentSavings, yearsToCoast, yearsCoastToRetire, coastAge, retireAge, r);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(fireNum, fvAtRetire, currentSavings, yearsToCoast, yearsCoastToRetire, coastAge, retireAge, r) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 600;
    const displayWidth = Math.min(600, containerWidth);
    const displayHeight = 300;
    chartCanvas.width = displayWidth * dpr;
    chartCanvas.height = displayHeight * dpr;
    chartCanvas.style.width = displayWidth + 'px';
    chartCanvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);

    const totalYears = yearsToCoast + yearsCoastToRetire;
    const pad = { top: 20, bottom: 40, left: 60, right: 20 };
    const chartW = displayWidth - pad.left - pad.right;
    const chartH = displayHeight - pad.top - pad.bottom;

    const values = [];
    for (let y = 0; y <= totalYears; y++) {
      if (y <= yearsToCoast) {
        values.push(currentSavings * Math.pow(1 + r, y));
      } else {
        values.push(values[values.length - 1] * Math.pow(1 + r, 1));
      }
    }

    const maxVal = Math.max(fireNum, ...values) * 1.1;

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    ctx.strokeStyle = '#ba1a1a';
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    const fireY = pad.top + chartH - (fireNum / maxVal) * chartH;
    ctx.moveTo(pad.left, fireY);
    ctx.lineTo(pad.left + chartW, fireY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ba1a1a';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('FIRE Target', pad.left + chartW - 80, fireY - 4);

    ctx.strokeStyle = '#005c8e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = pad.left + (i / totalYears) * chartW;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const coastX = pad.left + (yearsToCoast / totalYears) * chartW;
    ctx.strokeStyle = '#d97706';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(coastX, pad.top);
    ctx.lineTo(coastX, pad.top + chartH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#d97706';
    ctx.fillText('Coast Age ' + coastAge, coastX - 40, pad.top + chartH + 16);

    ctx.fillStyle = '#191c1e';
    ctx.font = '12px -apple-system, sans-serif';
    for (let i = 0; i <= totalYears; i += 5) {
      const x = pad.left + (i / totalYears) * chartW;
      ctx.fillText(currentAge + i, x - 10, displayHeight - 8);
    }

    for (let v = 0; v <= maxVal; v += maxVal / 5) {
      const y = pad.top + chartH - (v / maxVal) * chartH;
      ctx.fillText('\u20B9' + formatNumber(Math.round(v)), 2, y + 4);
      ctx.strokeStyle = '#dce1e4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#005c8e';
    ctx.fillRect(10, 6, 12, 12);
    ctx.fillStyle = '#191c1e';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Portfolio Growth', 26, 16);

    const startAge = coastAge - yearsToCoast;
    const regions = values.map((v, i) => ({
      type: 'point',
      x: pad.left + (i / totalYears) * chartW,
      y: pad.top + chartH - (v / maxVal) * chartH,
      r: 10,
      label: 'Age ' + (startAge + i),
      value: '₹ ' + formatNumber(Math.round(v)),
      color: '#005c8e',
    }));
    ChartTooltip.bind(chartCanvas, regions);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
