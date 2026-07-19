const STATES = [
  { name: 'Andhra Pradesh', stampMale: 5, stampFemale: 5, stampJoint: 5, reg: 0.5, regCap: 0, note: '' },
  { name: 'Arunachal Pradesh', stampMale: 6, stampFemale: 6, stampJoint: 6, reg: 1, regCap: 0, note: '' },
  { name: 'Assam', stampMale: 6, stampFemale: 5, stampJoint: 5.5, reg: 8.5, regCap: 0, note: 'Registration 8.5%' },
  { name: 'Bihar', stampMale: 6, stampFemale: 5.7, stampJoint: 6, reg: 2, regCap: 0, note: '' },
  { name: 'Chandigarh', stampMale: 5, stampFemale: 5, stampJoint: 5, reg: 1, regCap: 0, note: '' },
  { name: 'Chhattisgarh', stampMale: 5, stampFemale: 5, stampJoint: 5, reg: 4, regCap: 0, note: '' },
  { name: 'Delhi', stampMale: 6, stampFemale: 6, stampJoint: 6, reg: 1, regCap: 0, note: '' },
  { name: 'Goa', stampMale: 4.5, stampFemale: 4.5, stampJoint: 4.5, reg: 3, regCap: 0, note: 'Slab rate: ~4.5% avg' },
  { name: 'Gujarat', stampMale: 4.9, stampFemale: 4.9, stampJoint: 4.9, reg: 1, regCap: 0, note: 'No reg charges for women in some areas' },
  { name: 'Haryana (Urban)', stampMale: 7, stampFemale: 5, stampJoint: 6, reg: 1, regCap: 50000, note: 'Reg capped at ₹50,000' },
  { name: 'Haryana (Rural)', stampMale: 5, stampFemale: 3, stampJoint: 4, reg: 1, regCap: 50000, note: 'Reg capped at ₹50,000' },
  { name: 'Himachal Pradesh', stampMale: 6, stampFemale: 4, stampJoint: 5, reg: 2, regCap: 0, note: '' },
  { name: 'Jammu & Kashmir', stampMale: 7, stampFemale: 3, stampJoint: 7, reg: 1.2, regCap: 0, note: '' },
  { name: 'Jharkhand', stampMale: 4, stampFemale: 4, stampJoint: 4, reg: 3, regCap: 0, note: '' },
  { name: 'Karnataka', stampMale: 5, stampFemale: 5, stampJoint: 5, reg: 1, regCap: 0, note: 'Slab: 2-5% based on value' },
  { name: 'Kerala', stampMale: 8, stampFemale: 8, stampJoint: 8, reg: 2, regCap: 0, note: '' },
  { name: 'Madhya Pradesh', stampMale: 7.5, stampFemale: 7.5, stampJoint: 7.5, reg: 3, regCap: 0, note: '' },
  { name: 'Maharashtra', stampMale: 6, stampFemale: 5, stampJoint: 6, reg: 1, regCap: 30000, note: 'Reg capped at ₹30,000 above ₹30L' },
  { name: 'Manipur', stampMale: 7, stampFemale: 7, stampJoint: 7, reg: 3, regCap: 0, note: '' },
  { name: 'Meghalaya', stampMale: 9.9, stampFemale: 9.9, stampJoint: 9.9, reg: 1, regCap: 0, note: '' },
  { name: 'Mizoram', stampMale: 0.1, stampFemale: 0.1, stampJoint: 0.1, reg: 1, regCap: 0, note: 'Fixed stamp duty (₹100-500)' },
  { name: 'Nagaland', stampMale: 8.25, stampFemale: 8.25, stampJoint: 8.25, reg: 1, regCap: 0, note: '' },
  { name: 'Odisha', stampMale: 5, stampFemale: 4, stampJoint: 4.5, reg: 2, regCap: 0, note: '' },
  { name: 'Punjab', stampMale: 7, stampFemale: 5, stampJoint: 6, reg: 1, regCap: 0, note: '' },
  { name: 'Rajasthan', stampMale: 6, stampFemale: 5, stampJoint: 6, reg: 1, regCap: 0, note: '' },
  { name: 'Sikkim', stampMale: 5, stampFemale: 4, stampJoint: 4.5, reg: 1, regCap: 0, note: 'Sikkimese origin rates' },
  { name: 'Tamil Nadu', stampMale: 7, stampFemale: 7, stampJoint: 7, reg: 4, regCap: 0, note: '' },
  { name: 'Telangana', stampMale: 5, stampFemale: 5, stampJoint: 5, reg: 0.5, regCap: 0, note: '' },
  { name: 'Tripura', stampMale: 5, stampFemale: 5, stampJoint: 5, reg: 1, regCap: 0, note: '' },
  { name: 'Uttar Pradesh', stampMale: 7, stampFemale: 6, stampJoint: 6.5, reg: 1, regCap: 0, note: '' },
  { name: 'Uttarakhand', stampMale: 5, stampFemale: 3.75, stampJoint: 4.37, reg: 2, regCap: 0, note: '' },
  { name: 'West Bengal', stampMale: 5, stampFemale: 5, stampJoint: 5, reg: 1, regCap: 0, note: '4% for properties ≤₹25L in municipal areas' },
];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('prForm');
  const resultsSection = document.getElementById('resultsSection');
  const stateSelect = document.getElementById('stateSelect');
  const buyerType = document.getElementById('buyerType');

  const resultPropertyPrice = document.getElementById('resultPropertyPrice');
  const resultStampDuty = document.getElementById('resultStampDuty');
  const resultStampRate = document.getElementById('resultStampRate');
  const resultRegFee = document.getElementById('resultRegFee');
  const resultRegRate = document.getElementById('resultRegRate');
  const resultAdditional = document.getElementById('resultAdditional');
  const resultGrandTotal = document.getElementById('resultGrandTotal');
  const chartCanvas = document.getElementById('prChart');

  STATES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    stateSelect.appendChild(opt);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const price = parseFloat(document.getElementById('propertyPrice').value);
    const stateName = stateSelect.value;
    const buyer = buyerType.value;

    if (!price || price <= 0 || !stateName) {
      alert('Please enter a valid property price and select a state.');
      return;
    }

    const state = STATES.find(s => s.name === stateName);
    if (!state) return;

    const stampPct = buyer === 'female' ? state.stampFemale : buyer === 'joint' ? state.stampJoint : state.stampMale;
    const stampDuty = price * (stampPct / 100);

    let regFee;
    if (state.regCap > 0) {
      const pctFee = price * (state.reg / 100);
      regFee = Math.min(pctFee, state.regCap);
    } else {
      regFee = price * (state.reg / 100);
    }

    const additional = stampDuty + regFee;
    const grandTotal = price + additional;

    resultPropertyPrice.textContent = '\u20B9 ' + formatNumber(Math.round(price));
    resultStampDuty.textContent = '\u20B9 ' + formatNumber(Math.round(stampDuty));
    resultStampRate.textContent = '@ ' + stampPct + '%' + (state.note ? ' \u00B7 ' + state.note : '');
    resultRegFee.textContent = '\u20B9 ' + formatNumber(Math.round(regFee));
    resultRegRate.textContent = '@ ' + state.reg + '%' + (state.regCap > 0 ? ' (capped at \u20B9 ' + formatNumber(state.regCap) + ')' : '');
    resultAdditional.textContent = '\u20B9 ' + formatNumber(Math.round(additional));
    resultGrandTotal.textContent = '\u20B9 ' + formatNumber(Math.round(grandTotal));

    drawChart(price, stampDuty, regFee);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(price, stamp, reg) {
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

    const items = [
      { label: 'Property Price', value: price, color: '#005c8e' },
      { label: 'Stamp Duty', value: stamp, color: '#d97706' },
      { label: 'Registration', value: reg, color: '#00652c' },
    ];

    const maxVal = Math.max(...items.map(i => i.value)) * 1.25;
    const barWidth = chartW * 0.18;
    const gap = (chartW - barWidth * items.length) / (items.length + 1);

    function getY(val) { return padding.top + chartH - (val / maxVal) * chartH; }

    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = 1;
    const ySteps = 5;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#545f73';
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

    const regions = [];
    items.forEach((item, i) => {
      const x = padding.left + gap + i * (gap + barWidth);
      const h = (item.value / maxVal) * chartH;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, getY(item.value), barWidth, h);
      regions.push({ type: 'rect', x: x, y: getY(item.value), w: barWidth, h: h,
        label: item.label, value: '\u20B9 ' + formatNumber(Math.round(item.value)), color: item.color });

      ctx.textAlign = 'center';
      ctx.fillStyle = '#191c1e';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.fillText('\u20B9 ' + abbreviateNumber(item.value), x + barWidth / 2, getY(item.value) - 8);

      ctx.fillStyle = '#545f73';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, padding.top + chartH + 16);
    });

    ChartTooltip.bind(chartCanvas, regions);
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
