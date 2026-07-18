document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('currencyForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultFromAmt = document.getElementById('resultFromAmt');
  const resultRate = document.getElementById('resultRate');
  const resultConverted = document.getElementById('resultConverted');
  const resultUpdated = document.getElementById('resultUpdated');
  const chartCanvas = document.getElementById('currencyChart');

  let liveRates = null;
  let ratesDate = '';

  function fetchRates() {
    return fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json')
      .then(res => res.json())
      .then(data => {
        liveRates = data.inr;
        ratesDate = data.date;
        resultUpdated.textContent = 'Rates as of ' + ratesDate;
      })
      .catch(() => {
        resultUpdated.textContent = 'Could not fetch live rates. Using approximate rates.';
      });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const amount = parseFloat(document.getElementById('convAmount').value);
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const f = from.toLowerCase();
    const t = to.toLowerCase();
    let rate;
    if (from === to) {
      rate = 1;
    } else if (liveRates) {
      const hasFrom = from === 'INR' || liveRates[f];
      const hasTo = to === 'INR' || liveRates[t];
      if (hasFrom && hasTo) {
        if (from === 'INR') {
          rate = liveRates[t];
        } else if (to === 'INR') {
          rate = 1 / liveRates[f];
        } else {
          rate = liveRates[t] / liveRates[f];
        }
      }
    }
    if (!rate || rate <= 0) {
      const approxRates = {
        INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.83, AUD: 0.018, CAD: 0.016, SGD: 0.016, AED: 0.044 },
      };
      if (from === 'INR') {
        rate = approxRates.INR[to];
        if (to === 'INR') rate = 1;
      } else if (to === 'INR') {
        rate = 1 / (approxRates.INR[from] || 1);
      } else {
        rate = (approxRates.INR[to] || 1) / (approxRates.INR[from] || 1);
      }
    }

    if (isNaN(rate) || rate <= 0) {
      alert('Conversion rate not available for selected pair.');
      return;
    }

    const converted = amount * rate;

    const sym = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3', JPY: '\u00A5', AUD: 'A$', CAD: 'C$', SGD: 'S$', AED: 'AED' };

    resultFromAmt.textContent = (sym[from] || '') + ' ' + formatNumber(Math.round(amount));
    resultRate.textContent = rate.toFixed(4);
    resultConverted.textContent = (sym[to] || '') + ' ' + formatNumber(Math.round(converted));

    drawChart(0, converted, from, to);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(amt, converted, from, to) {
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
    const radius = displaySize / 2 - 30;

    const segs = [{ label: to, value: 1, color: '#2563eb' }];

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();

      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 16px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(to, cx, cy);

      const legendY = displaySize - 6;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(10, legendY - 10, 12, 12);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(to + ' (' + formatNumber(Math.round(converted)) + ')', 26, legendY + 2);
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

  fetchRates().then(() => calculate());
});
