document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('healthForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultScore = document.getElementById('resultScore');
  const resultRating = document.getElementById('resultRating');
  const resultSavings = document.getElementById('resultSavings');
  const resultEmergency = document.getElementById('resultEmergency');
  const resultDebt = document.getElementById('resultDebt');
  const resultInsurance = document.getElementById('resultInsurance');
  const resultInvestment = document.getElementById('resultInvestment');
  const resultRetirement = document.getElementById('resultRetirement');
  const recommendations = document.getElementById('recommendations');
  const chartCanvas = document.getElementById('healthChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const income = parseFloat(document.getElementById('monthlyIncome').value) || 0;
    const expenses = parseFloat(document.getElementById('monthlyExpenses').value) || 0;
    const monthlySavings = parseFloat(document.getElementById('monthlySavings').value) || 0;
    const emergencyFund = parseFloat(document.getElementById('emergencyFund').value) || 0;
    const debt = parseFloat(document.getElementById('totalDebt').value) || 0;
    const termIns = document.getElementById('termInsurance').value;
    const healthIns = document.getElementById('healthInsurance').value;
    const investments = parseFloat(document.getElementById('totalInvestments').value) || 0;
    const age = parseFloat(document.getElementById('currentAge').value) || 30;
    const retireInvest = document.getElementById('retirementInvesting').value;

    const savingsRate = income > 0 ? (income - expenses) / income * 100 : 0;
    let savingsScore = 0;
    if (savingsRate >= 30) savingsScore = 20;
    else if (savingsRate >= 20) savingsScore = 15;
    else if (savingsRate >= 10) savingsScore = 10;
    else if (savingsRate >= 5) savingsScore = 5;

    const monthsCovered = expenses > 0 ? emergencyFund / expenses : 0;
    let emergencyScore = 0;
    if (monthsCovered >= 12) emergencyScore = 20;
    else if (monthsCovered >= 6) emergencyScore = 15;
    else if (monthsCovered >= 3) emergencyScore = 10;
    else if (monthsCovered >= 1) emergencyScore = 5;

    const dti = income > 0 ? debt / income * 100 : 0;
    let debtScore = 0;
    if (dti === 0) debtScore = 20;
    else if (dti <= 10) debtScore = 18;
    else if (dti <= 20) debtScore = 14;
    else if (dti <= 30) debtScore = 10;
    else if (dti <= 40) debtScore = 5;

    const insScore = (termIns === 'yes' ? 8 : 0) + (healthIns === 'yes' ? 7 : 0);

    let invScore = 0;
    if (income > 0) {
      if (investments >= income * 12) invScore = 15;
      else if (investments >= income * 6) invScore = 12;
      else if (investments >= income * 3) invScore = 8;
      else if (investments >= income * 1) invScore = 4;
    }

    let ageFactor = 0;
    if (age <= 30) ageFactor = 5;
    else if (age <= 40) ageFactor = 4;
    else if (age <= 50) ageFactor = 3;
    else if (age <= 60) ageFactor = 2;
    else ageFactor = 1;

    const retireBase = retireInvest === 'yes' ? 5 : 0;
    const retireScore = retireBase + ageFactor;

    const totalScore = savingsScore + emergencyScore + debtScore + insScore + invScore + retireScore;

    resultScore.textContent = totalScore;

    let ratingText = '';
    let ratingColor = '';
    if (totalScore >= 80) { ratingText = 'Excellent'; ratingColor = 'var(--success)'; }
    else if (totalScore >= 60) { ratingText = 'Good'; ratingColor = 'var(--primary)'; }
    else if (totalScore >= 40) { ratingText = 'Fair'; ratingColor = '#f59e0b'; }
    else { ratingText = 'Poor'; ratingColor = '#ef4444'; }

    resultRating.textContent = ratingText;
    resultRating.style.color = ratingColor;

    resultSavings.textContent = savingsScore + ' / 20';
    resultEmergency.textContent = emergencyScore + ' / 20';
    resultDebt.textContent = debtScore + ' / 20';
    resultInsurance.textContent = insScore + ' / 15';
    resultInvestment.textContent = invScore + ' / 15';
    resultRetirement.textContent = retireScore + ' / 10';

    const tips = [];
    if (savingsScore < 20) tips.push('Try to save at least 20% of your income. Reduce discretionary spending or increase your income sources.');
    if (emergencyScore < 20) tips.push('Build an emergency fund covering at least 6 months of expenses. Start with a small monthly goal.');
    if (debtScore < 20) tips.push('Work on reducing your debt-to-income ratio. Consider debt consolidation or a repayment plan.');
    if (insScore < 15) tips.push('Get adequate insurance coverage. Term life and health insurance are essential for financial security.');
    if (invScore < 15) tips.push('Grow your investment corpus. Consider investing at least 3&times; your annual income across diversified assets.');
    if (retireScore < 10) tips.push('Start investing for retirement as early as possible. The earlier you start, the more time your money has to grow.');

    if (tips.length > 0) {
      recommendations.innerHTML = '<strong style="font-size:1rem;">Recommendations to Improve Your Score</strong>' +
        tips.map(t => '<div style="display:flex; gap:8px; margin-top:10px;"><span style="color:var(--primary);">&#9654;</span><span>' + t + '</span></div>').join('');
    } else {
      recommendations.innerHTML = '<strong style="font-size:1rem; color:var(--success);">&#10003; Great job! You\'re on top of your finances.</strong>';
    }

    drawChart(totalScore);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(score) {
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
    const radius = displaySize / 2 - 20;
    const filled = (score / 100) * Math.PI * 2;
    const empty = (1 - score / 100) * Math.PI * 2;

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      const fillAngle = -Math.PI / 2 + filled * p;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, -Math.PI / 2, fillAngle);
      ctx.closePath();
      ctx.fillStyle = '#2563eb';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold ' + (displaySize * 0.12) + 'px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(score + '/100', cx, cy);
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

  calculate();
});
