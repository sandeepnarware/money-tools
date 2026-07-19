const OLD_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250001, max: 500000, rate: 5 },
  { min: 500001, max: 1000000, rate: 20 },
  { min: 1000001, max: Infinity, rate: 30 },
];

const NEW_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400001, max: 800000, rate: 5 },
  { min: 800001, max: 1200000, rate: 10 },
  { min: 1200001, max: 1600000, rate: 15 },
  { min: 1600001, max: 2000000, rate: 20 },
  { min: 2000001, max: 2400000, rate: 25 },
  { min: 2400001, max: Infinity, rate: 30 },
];

const OLD_STD_DEDUCTION = 50000;
const NEW_STD_DEDUCTION = 75000;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('taxForm');
  const resultsSection = document.getElementById('resultsSection');

  const el = (id) => document.getElementById(id);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function parseNum(v) {
    return parseFloat(String(v).replace(/[^0-9.\-]/g, '')) || 0;
  }

  function getVal(id) {
    return parseNum(document.getElementById(id).value);
  }

  function getDeductions() {
    const inputs = document.querySelectorAll('.deduction');
    let total = 0;
    inputs.forEach(inp => {
      const max = parseFloat(inp.dataset.max) || Infinity;
      const val = parseNum(inp.value);
      total += Math.min(val, max);
    });
    return total;
  }

  function calculateHra(basic, hraReceived, monthlyRent, isMetro) {
    const annualRent = monthlyRent * 12;
    const rentExcess = annualRent - basic * 0.1;
    const hraPct = isMetro ? 0.5 : 0.4;
    const hraCity = basic * hraPct;

    return Math.max(0, Math.min(hraReceived, rentExcess, hraCity));
  }

  function computeTax(slabs, taxableIncome) {
    let tax = 0;
    for (const s of slabs) {
      if (taxableIncome > s.max) {
        tax += (s.max - s.min + 1) * s.rate / 100;
      } else if (taxableIncome > s.min) {
        tax += (taxableIncome - s.min + 1) * s.rate / 100;
        break;
      } else {
        break;
      }
    }
    return tax > 0 ? Math.max(0, tax) : 0;
  }

  function computeOldRegime(grossIncome, hraExemption, deductions) {
    const taxable = Math.max(0, grossIncome - OLD_STD_DEDUCTION - hraExemption - deductions);
    let tax = computeTax(OLD_SLABS, taxable);

    if (taxable <= 500000) {
      tax = Math.max(0, tax - 12500);
    }

    const cess = tax * 0.04;
    return { taxable, tax: tax + cess, taxBeforeCess: tax, cess };
  }

  function computeNewRegime(grossIncome) {
    const taxable = Math.max(0, grossIncome - NEW_STD_DEDUCTION);
    let tax = computeTax(NEW_SLABS, taxable);

    if (taxable <= 1200000) {
      tax = Math.max(0, tax - 60000);
    }

    const cess = tax * 0.04;
    return { taxable, tax: tax + cess, taxBeforeCess: tax, cess };
  }

  function getDeductionLabel(index) {
    const labels = [
      '80C (PPF, EPF, ELSS, etc.)',
      '80CCD(1B) NPS Tier-I',
      '80D Self & Family Health Insurance',
      '80D Parents Health Insurance',
      '24(b) Home Loan Interest',
      '80E Education Loan Interest',
      '80G Donations',
      '80TTA Savings Interest',
      'LTA (Leave Travel Allowance)',
    ];
    return labels[index] || 'Other';
  }

  function renderBreakdown(rows, activeTab) {
    const tbody = el('breakdownBody');
    const isOld = activeTab === 'old';
    tbody.innerHTML = rows.map(r => `
      <tr${r.bold ? ' style="font-weight:700;"' : ''}${r.accent ? (isOld ? ' style="color:#005c8e; font-weight:700;"' : ' style="color:#00652c; font-weight:700;"') : ''}>
        <td>${r.label}</td>
        <td class="text-right">${r.value >= 0 ? '\u20B9 ' + formatNumber(Math.abs(r.value)) : '(\u20B9 ' + formatNumber(Math.abs(r.value)) + ')'}</td>
      </tr>
    `).join('');
  }

  function calculate() {
    const basic = getVal('basicSalary');
    const hraReceived = getVal('hraReceived');
    const otherAllowances = getVal('otherAllowances');
    const monthlyRent = getVal('monthlyRent');
    const isMetro = document.getElementById('cityType').value === 'metro';

    const deductionInputs = document.querySelectorAll('.deduction');
    let totalDeductions = 0;
    const deductionDetails = [];
    deductionInputs.forEach((inp, i) => {
      const max = parseFloat(inp.dataset.max) || Infinity;
      const val = parseNum(inp.value);
      const capped = Math.min(val, max);
      totalDeductions += capped;
      if (capped > 0) {
        deductionDetails.push({ label: getDeductionLabel(i), amount: capped });
      }
    });

    const grossIncome = basic + hraReceived + otherAllowances;
    const hraExemption = calculateHra(basic, hraReceived, monthlyRent, isMetro);

    const oldResult = computeOldRegime(grossIncome, hraExemption, totalDeductions);
    const newResult = computeNewRegime(grossIncome);

    const oldEffective = grossIncome > 0 ? (oldResult.tax / grossIncome) * 100 : 0;
    const newEffective = grossIncome > 0 ? (newResult.tax / grossIncome) * 100 : 0;

    el('oldGrossIncome').textContent = '\u20B9 ' + formatNumber(grossIncome);
    el('oldTotalDeductions').textContent = '\u20B9 ' + formatNumber(Math.round(totalDeductions + hraExemption + OLD_STD_DEDUCTION));
    el('oldTaxableIncome').textContent = '\u20B9 ' + formatNumber(Math.round(oldResult.taxable));
    el('oldTaxPayable').textContent = '\u20B9 ' + formatNumber(Math.round(oldResult.tax));
    el('oldEffectiveRate').textContent = oldEffective.toFixed(2) + '%';
    el('oldStdDeduction').textContent = '\u20B9 ' + formatNumber(OLD_STD_DEDUCTION);
    el('oldHraExemption').textContent = '\u20B9 ' + formatNumber(Math.round(hraExemption));

    el('newGrossIncome').textContent = '\u20B9 ' + formatNumber(grossIncome);
    el('newStdDeduction').textContent = '\u20B9 ' + formatNumber(NEW_STD_DEDUCTION);
    el('newTaxableIncome').textContent = '\u20B9 ' + formatNumber(Math.round(newResult.taxable));
    el('newTaxPayable').textContent = '\u20B9 ' + formatNumber(Math.round(newResult.tax));
    el('newEffectiveRate').textContent = newEffective.toFixed(2) + '%';

    const recBox = el('recommendation');
    let recommended = 'old';
    if (oldResult.tax < newResult.tax) {
      recBox.style.display = 'block';
      recBox.style.background = '#eef5ff';
      recBox.style.border = '1px solid #cde5ff';
      recBox.style.color = '#004b74';
      recBox.textContent = 'Old Regime is better — you save \u20B9 ' + formatNumber(Math.round(newResult.tax - oldResult.tax)) + ' in taxes.';
      recommended = 'old';
    } else if (newResult.tax < oldResult.tax) {
      recBox.style.display = 'block';
      recBox.style.background = '#f0fdf4';
      recBox.style.border = '1px solid #d3ffd5';
      recBox.style.color = '#00652c';
      recBox.textContent = 'New Regime is better — you save \u20B9 ' + formatNumber(Math.round(oldResult.tax - newResult.tax)) + ' in taxes.';
      recommended = 'new';
    } else {
      recBox.style.display = 'block';
      recBox.style.background = '#fefce8';
      recBox.style.border = '1px solid #fef9c3';
      recBox.style.color = '#a16207';
      recBox.textContent = 'Both regimes give the same tax liability.';
    }

    const oldBreakdown = [
      { label: 'Gross Total Income', value: grossIncome },
      { label: 'Less: Standard Deduction', value: -OLD_STD_DEDUCTION },
      { label: 'Less: HRA Exemption', value: -hraExemption },
      ...deductionDetails.map(d => ({ label: 'Less: ' + d.label, value: -d.amount })),
      { label: 'Net Taxable Income', value: oldResult.taxable, bold: true },
      { label: 'Income Tax (before cess)', value: -oldResult.taxBeforeCess },
      { label: 'Health & Education Cess (4%)', value: -oldResult.cess },
      { label: 'Total Tax Payable', value: oldResult.tax, bold: true, accent: true },
    ];

    const newBreakdown = [
      { label: 'Gross Total Income', value: grossIncome },
      { label: 'Less: Standard Deduction', value: -NEW_STD_DEDUCTION },
      { label: 'Net Taxable Income', value: newResult.taxable, bold: true },
      { label: 'Income Tax (before cess)', value: -newResult.taxBeforeCess },
      { label: 'Health & Education Cess (4%)', value: -newResult.cess },
      { label: 'Total Tax Payable', value: newResult.tax, bold: true, accent: true },
    ];

    const tabOld = el('tabOld');
    const tabNew = el('tabNew');

    function setActiveTab(tab) {
      if (tab === 'old') {
        tabOld.className = 'btn btn-primary';
        tabNew.className = 'btn btn-secondary';
        renderBreakdown(oldBreakdown, 'old');
      } else {
        tabOld.className = 'btn btn-secondary';
        tabNew.className = 'btn btn-primary';
        renderBreakdown(newBreakdown, 'new');
      }
    }

    tabOld.onclick = () => setActiveTab('old');
    tabNew.onclick = () => setActiveTab('new');

    setActiveTab(recommended);

    drawChart(oldResult.taxable, oldResult.tax, newResult.taxable, newResult.tax);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(oldTaxable, oldTax, newTaxable, newTax) {
    const canvas = document.getElementById('taxChart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = canvas.parentElement.clientWidth || 500;
    const displayW = Math.min(500, containerWidth);
    const displayH = Math.round(displayW * 0.55);
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const padding = { top: 24, right: 24, bottom: 50, left: 64 };
    const chartW = displayW - padding.left - padding.right;
    const chartH = displayH - padding.top - padding.bottom;

    const items = [
      { label: 'Old Regime Taxable', value: oldTaxable, color: '#94ccff' },
      { label: 'Old Regime Tax', value: oldTax, color: '#005c8e' },
      { label: 'New Regime Taxable', value: newTaxable, color: '#d3ffd5' },
      { label: 'New Regime Tax', value: newTax, color: '#00652c' },
    ];

    const maxVal = Math.max(...items.map(i => i.value)) * 1.25;
    const barWidth = chartW * 0.16;
    const gap = (chartW - barWidth * items.length) / (items.length + 1);

    function getY(val) { return padding.top + chartH - (val / maxVal) * chartH; }

    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = 1;
    const ySteps = 5;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#545f73';
    ctx.font = '10px -apple-system, sans-serif';
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

    items.forEach((item, i) => {
      const x = padding.left + gap + i * (gap + barWidth);
      const h = (item.value / maxVal) * chartH;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, getY(item.value), barWidth, h);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#191c1e';
      ctx.font = 'bold 10px -apple-system, sans-serif';
      ctx.fillText('\u20B9 ' + abbreviateNumber(item.value), x + barWidth / 2, getY(item.value) - 8);

      ctx.fillStyle = '#545f73';
      ctx.font = '9px -apple-system, sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, padding.top + chartH + 14);
    });
  }

  function abbreviateNumber(num) {
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
