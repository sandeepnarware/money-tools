document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('epfForm');
  const resultsSection = document.getElementById('resultsSection');

  const resultEmployeeTotal = document.getElementById('resultEmployeeTotal');
  const resultEmployerTotal = document.getElementById('resultEmployerTotal');
  const resultCorpus = document.getElementById('resultCorpus');
  const resultInterest = document.getElementById('resultInterest');
  const resultContributions = document.getElementById('resultContributions');
  const scheduleBody = document.getElementById('scheduleBody');
  const chartCanvas = document.getElementById('epfChart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
  });

  function calculate() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const retirementAge = parseFloat(document.getElementById('retirementAge').value);
    const currentBalance = parseFloat(document.getElementById('currentBalance').value);
    const basicDa = parseFloat(document.getElementById('basicDa').value);
    const employeeRate = parseFloat(document.getElementById('employeeRate').value);
    const employerRate = parseFloat(document.getElementById('employerRate').value);
    const epfRate = parseFloat(document.getElementById('epfInterestRate').value);

    if (!currentAge || !retirementAge || !basicDa || !employeeRate || !employerRate || !epfRate) {
      alert('Please enter valid values.');
      return;
    }

    const yearsToRetire = retirementAge - currentAge;
    if (yearsToRetire <= 0) {
      alert('Retirement age must be greater than current age.');
      return;
    }

    const employeeMonthly = basicDa * employeeRate / 100;
    const employerMonthly = basicDa * employerRate / 100;
    const totalMonthly = employeeMonthly + employerMonthly;

    let opening = currentBalance;
    let totalEmployee = 0;
    let totalEmployer = 0;
    let totalInterest = 0;
    const schedule = [];

    for (let year = 1; year <= yearsToRetire; year++) {
      const yearlyEmployee = employeeMonthly * 12;
      const yearlyEmployer = employerMonthly * 12;
      const yearlyContribution = yearlyEmployee + yearlyEmployer;

      const interest = (opening + yearlyContribution / 2) * epfRate / 100;
      const closing = opening + yearlyContribution + interest;

      totalEmployee += yearlyEmployee;
      totalEmployer += yearlyEmployer;
      totalInterest += interest;

      schedule.push({
        year,
        age: currentAge + year,
        opening: Math.round(opening),
        employee: Math.round(yearlyEmployee),
        employer: Math.round(yearlyEmployer),
        interest: Math.round(interest),
        closing: Math.round(closing),
      });

      opening = closing;
    }

    const corpus = opening;

    resultEmployeeTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalEmployee));
    resultEmployerTotal.textContent = '\u20B9 ' + formatNumber(Math.round(totalEmployer));
    resultCorpus.textContent = '\u20B9 ' + formatNumber(Math.round(corpus));
    resultInterest.textContent = '\u20B9 ' + formatNumber(Math.round(totalInterest));
    resultContributions.textContent = '\u20B9 ' + formatNumber(Math.round(totalEmployee + totalEmployer));

    renderSchedule(schedule);
    drawChart(totalEmployee, totalEmployer, totalInterest);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSchedule(schedule) {
    scheduleBody.innerHTML = schedule.map(r => `
      <tr>
        <td>${r.year}</td>
        <td>${r.age}</td>
        <td class="text-right">${formatNumber(r.opening)}</td>
        <td class="text-right">${formatNumber(r.employee)}</td>
        <td class="text-right">${formatNumber(r.employer)}</td>
        <td class="text-right">${formatNumber(r.interest)}</td>
        <td class="text-right">${formatNumber(r.closing)}</td>
      </tr>
    `).join('');
  }

  function drawChart(employeeTotal, employerTotal, interest) {
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
    const total = employeeTotal + employerTotal + interest;

    ctx.clearRect(0, 0, displaySize, displaySize);

    const empAngle = (employeeTotal / total) * Math.PI * 2;
    const employerAngle = (employerTotal / total) * Math.PI * 2;
    const intAngle = (interest / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + empAngle);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + empAngle, -Math.PI / 2 + empAngle + employerAngle);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, -Math.PI / 2 + empAngle + employerAngle, -Math.PI / 2 + empAngle + employerAngle + intAngle);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    const legendY = displaySize - 6;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(10, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Employee', 26, legendY + 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(100, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Employer', 116, legendY + 2);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(190, legendY - 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Interest', 206, legendY + 2);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  calculate();
});
