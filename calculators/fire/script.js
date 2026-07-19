document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fireForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultFireCorpus = document.getElementById('resultFireCorpus');
  const resultCurrentSavings = document.getElementById('resultCurrentSavings');
  const resultMonthlySavings = document.getElementById('resultMonthlySavings');
  const resultYearsToFI = document.getElementById('resultYearsToFI');
  const resultFireAge = document.getElementById('resultFireAge');
  const resultCorpusAtRetirement = document.getElementById('resultCorpusAtRetirement');
  const projectionBody = document.getElementById('projectionBody');
  const chartCanvas = document.getElementById('fireChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const currentSavings = parseFloat(document.getElementById('currentSavingsFire').value);
    const monthlySavings = parseFloat(document.getElementById('monthlySavings').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const returnRate = parseFloat(document.getElementById('returnRate').value) / 100;
    const withdrawalRate = parseFloat(document.getElementById('withdrawalRate').value) / 100;
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;

    if (!currentAge || currentAge < 18 || currentAge > 70) {
      alert('Please enter a valid age between 18 and 70.');
      return;
    }

    if (!monthlySavings || !monthlyExpenses || monthlySavings <= 0 || monthlyExpenses <= 0) {
      alert('Please enter valid positive values for Monthly Savings and Expenses.');
      return;
    }

    const annualExpenses = monthlyExpenses * 12;
    const annualSavings = monthlySavings * 12;
    const fireCorpus = annualExpenses / withdrawalRate;

    let yearsToFI;
    if (currentSavings >= fireCorpus) {
      yearsToFI = 0;
    } else if (returnRate === 0) {
      yearsToFI = (fireCorpus - currentSavings) / annualSavings;
    } else {
      const r = returnRate;
      const s = annualSavings;
      const C = currentSavings;
      const F = fireCorpus;
      yearsToFI = Math.log((F * r + s) / (C * r + s)) / Math.log(1 + r);
    }

    const fireAge = currentAge + yearsToFI;

    let corpusAtRetirement;
    if (returnRate === 0) {
      corpusAtRetirement = currentSavings + annualSavings * yearsToFI;
    } else {
      corpusAtRetirement = currentSavings * Math.pow(1 + returnRate, yearsToFI) + annualSavings * (Math.pow(1 + returnRate, yearsToFI) - 1) / returnRate;
    }

    resultFireCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(fireCorpus));
    resultCurrentSavings.textContent = '\u20B9 ' + formatNumber(Math.round(currentSavings));
    resultMonthlySavings.textContent = '\u20B9 ' + formatNumber(Math.round(monthlySavings));
    resultYearsToFI.textContent = yearsToFI.toFixed(1) + ' yrs';
    resultFireAge.textContent = Math.round(fireAge) + ' yrs';
    resultCorpusAtRetirement.textContent = '\u20B9 ' + formatNumber(Math.round(corpusAtRetirement));

    const projection = buildProjection(currentSavings, annualSavings, returnRate, fireCorpus, currentAge);
    renderProjection(projection);
    drawChart(projection, fireCorpus, currentAge);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildProjection(currentSavings, annualSavings, returnRate, fireCorpus, currentAge) {
    const rows = [];
    let balance = currentSavings;
    let year = 1;

    while (balance < fireCorpus && year <= 100) {
      const returns = balance * returnRate;
      balance = balance + returns + annualSavings;
      rows.push({
        year: year,
        age: Math.round(currentAge + year),
        startBalance: Math.round(balance - returns - annualSavings),
        annualSavings: Math.round(annualSavings),
        returns: Math.round(returns),
        endBalance: Math.round(balance),
      });
      year++;
    }

    return rows;
  }

  function renderProjection(projection) {
    projectionBody.innerHTML = projection.map(r => `
      <tr>
        <td>${r.year}</td>
        <td>${r.age}</td>
        <td class="text-right">${formatNumber(r.startBalance)}</td>
        <td class="text-right">${formatNumber(r.annualSavings)}</td>
        <td class="text-right">${formatNumber(r.returns)}</td>
        <td class="text-right">${formatNumber(r.endBalance)}</td>
      </tr>
    `).join('');
  }

  function drawChart(projection, fireCorpus, currentAge) {
    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartCanvas.parentElement.clientWidth || 500;
    const displayWidth = Math.min(500, containerWidth);
    const displayHeight = 300;
    chartCanvas.width = displayWidth * dpr;
    chartCanvas.height = displayHeight * dpr;
    chartCanvas.style.width = displayWidth + 'px';
    chartCanvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    if (projection.length === 0) return;

    const padding = { top: 20, right: 20, bottom: 40, left: 65 };
    const chartW = displayWidth - padding.left - padding.right;
    const chartH = displayHeight - padding.top - padding.bottom;

    const maxVal = Math.max(fireCorpus, ...projection.map(d => d.endBalance)) * 1.05;
    const minAge = projection[0].age;
    const maxAge = projection[projection.length - 1].age;

    function xPos(age) {
      return padding.left + ((age - minAge) / (maxAge - minAge)) * chartW;
    }

    function yPos(val) {
      return padding.top + chartH - (val / maxVal) * chartH;
    }

    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH * i / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#545f73';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH * i / 4;
      const val = maxVal - maxVal * i / 4;
      ctx.fillText('\u20B9' + formatNumber(Math.round(val / 100000)) + 'L', padding.left - 8, y + 4);
    }

    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(projection.length / 8));
    for (let i = 0; i < projection.length; i += step) {
      const x = xPos(projection[i].age);
      ctx.fillStyle = '#545f73';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(projection[i].age, x, displayHeight - 8);
    }

    ctx.fillStyle = '#545f73';
    ctx.textAlign = 'center';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText('Age (Years)', padding.left + chartW / 2, displayHeight - 2);

    const fireY = yPos(fireCorpus);
    ctx.strokeStyle = '#00652c';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, fireY);
    ctx.lineTo(padding.left + chartW, fireY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#00652c';
    ctx.textAlign = 'left';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.fillText('FIRE Target: \u20B9' + formatNumber(Math.round(fireCorpus / 100000)) + 'L', padding.left + 4, fireY - 4);

    ctx.strokeStyle = '#005c8e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    projection.forEach((d, i) => {
      const x = xPos(d.age);
      const y = yPos(d.endBalance);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#005c8e';
    projection.forEach((d) => {
      const x = xPos(d.age);
      const y = yPos(d.endBalance);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
