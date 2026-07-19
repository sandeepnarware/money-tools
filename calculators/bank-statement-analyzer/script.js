document.addEventListener('DOMContentLoaded', () => {
  const resultsSection = document.getElementById('resultsSection');
  const csvUpload = document.getElementById('csvUpload');
  const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');

  let allTxns = [];

  const categoryKeywords = [
    { cat: 'Income', keywords: ['salary', 'credit', 'deposit', 'interest', 'refund', 'dividend', 'receipt'] },
    { cat: 'Food & Dining', keywords: ['swiggy', 'zomato', 'restaurant', 'food', 'cafe', 'pizza', 'dining', 'eat', 'mcdonald', 'starbucks', 'dhaba', 'hotel', 'tiffin'] },
    { cat: 'Transport', keywords: ['uber', 'ola', 'petrol', 'fuel', 'metro', 'bus', 'cab', 'auto', 'rapido', 'parking', 'toll', 'travel'] },
    { cat: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'clothing', 'apparel', 'lifestyle', 'ajio', 'meesho', 'nykaa'] },
    { cat: 'Groceries', keywords: ['grocery', 'supermarket', 'departmental', 'more', 'bigbasket', 'zepto', 'blinkit', 'dairy', 'mart', 'fresh'] },
    { cat: 'Utilities & Bills', keywords: ['electricity', 'water', 'phone', 'internet', 'broadband', 'bill', 'recharge', 'gas', 'energy', 'utility'] },
    { cat: 'Entertainment', keywords: ['netflix', 'spotify', 'prime', 'hotstar', 'movie', 'cinema', 'game', 'gaming', 'entertainment', 'ticket', 'concert', 'youtube'] },
    { cat: 'Health & Medical', keywords: ['hospital', 'doctor', 'pharmacy', 'medical', 'health', 'clinic', 'medicine', 'dentist', 'eye', 'diagnostic', 'lab'] },
    { cat: 'Bank Charges', keywords: ['bank charge', 'atm charge', 'service charge', 'commission', 'fee', 'penalty', 'ledger folio', 'sms charge', 'debit card'] },
    { cat: 'Rent', keywords: ['rent'] },
    { cat: 'Insurance', keywords: ['insurance', 'premium', 'lic', 'policy'] },
    { cat: 'Education', keywords: ['school', 'college', 'tuition', 'university', 'fees', 'course', 'academy', 'education', 'exam'] },
    { cat: 'Transfer', keywords: ['transfer', 'neft', 'rtgs', 'imps', 'upi', 'fund', 'wallet'] },
    { cat: 'Investment', keywords: ['sip', 'mutual fund', 'mf', 'stocks', 'demat', 'investment', 'share', 'bonds', 'nps', 'ppf', 'fd', 'fixed'] },
    { cat: 'ATM Withdrawal', keywords: ['atm', 'withdrawal', 'cash'] },
  ];

  function classify(desc) {
    const lower = desc.toLowerCase();
    for (const entry of categoryKeywords) {
      for (const kw of entry.keywords) {
        if (lower.includes(kw)) return entry.cat;
      }
    }
    return 'Others';
  }

  function parseDate(str) {
    const parts = str.split(/[/-]/);
    if (parts.length !== 3) return null;
    let d, m, y;
    if (parts[2].length === 4) {
      [d, m, y] = parts;
    } else {
      [y, m, d] = parts;
    }
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }

  function parseCSV(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return [];

    // find header row — look for date-like column
    let start = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const cols = lines[i].split(',').map(c => c.trim().toLowerCase());
      if (cols.some(c => c.includes('date')) || cols.some(c => c.includes('description')) || cols.some(c => c.includes('particular'))) {
        start = i;
        break;
      }
    }

    const header = lines[start].split(',').map(c => c.trim().toLowerCase());
    const dateIdx = header.findIndex(c => c.includes('date') || c === 'dt');
    const descIdx = header.findIndex(c => c.includes('desc') || c.includes('particular') || c.includes('narr') || c.includes('details') || c.includes('remark'));
    const debitIdx = header.findIndex(c => c.includes('debit') || c.includes('withdrawal') || c.includes('dr') || c === 'withdrawal amt');
    const creditIdx = header.findIndex(c => c.includes('credit') || c.includes('deposit') || c.includes('cr') || c === 'deposit amt');
    const balIdx = header.findIndex(c => c.includes('balance'));

    if (dateIdx === -1 || (debitIdx === -1 && creditIdx === -1)) return [];

    const txns = [];
    for (let i = start + 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const date = dateIdx >= 0 && dateIdx < cols.length ? cols[dateIdx] : '';
      const desc = descIdx >= 0 && descIdx < cols.length ? cols[descIdx] : '';
      const debitStr = debitIdx >= 0 && debitIdx < cols.length ? cols[debitIdx] : '';
      const creditStr = creditIdx >= 0 && creditIdx < cols.length ? cols[creditIdx] : '';
      const balanceStr = balIdx >= 0 && balIdx < cols.length ? cols[balIdx] : '';

      const parsedDate = parseDate(date);
      if (!parsedDate) continue;

      const debit = parseFloat(debitStr.replace(/[^\d.-]/g, '')) || 0;
      const credit = parseFloat(creditStr.replace(/[^\d.-]/g, '')) || 0;
      const balance = parseFloat(balanceStr.replace(/[^\d.-]/g, '')) || 0;

      if (debit === 0 && credit === 0) continue;

      txns.push({
        date: parsedDate,
        dateStr: date,
        desc: desc || 'Untitled',
        debit,
        credit,
        balance,
        category: classify(desc),
      });
    }
    return txns;
  }

  downloadTemplateBtn.addEventListener('click', () => {
    const csvContent = 'Date,Description,Debit,Credit,Balance\n01-01-2025,Salary,0,85000,85000\n05-01-2025,Rent,15000,0,70000\n08-01-2025,Grocery,3000,0,67000\n10-01-2025,Electricity Bill,2000,0,65000\n12-01-2025,Swiggy Food,500,0,64500\n15-01-2025,Uber Ride,300,0,64200\n20-01-2025,ATM Withdrawal,5000,0,59200\n25-01-2025,Phone Recharge,499,0,58701\n01-02-2025,Salary,0,85000,143701\n05-02-2025,Rent,15000,0,128701\n08-02-2025,Amazon Shopping,2500,0,126201\n12-02-2025,Netflix,649,0,125552\n18-02-2025,Petrol,2000,0,123552\n22-02-2025,Dining Out,1200,0,122352\n25-02-2025,Insurance Premium,5000,0,117352\n01-03-2025,Salary,0,90000,207352\n05-03-2025,Rent,16000,0,191352\n10-03-2025,Medical,1500,0,189852\n15-03-2025,SIP Investment,10000,0,179852\n20-03-2025,Zepto Grocery,2000,0,177852';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bank-statement-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  csvUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      allTxns = parseCSV(ev.target.result);
      if (allTxns.length === 0) {
        alert('Could not parse any transactions. Make sure your CSV has Date, Description, Debit/Credit columns.');
        return;
      }
      analyze(allTxns);
    };
    reader.readAsText(file);
  });

  function analyze(txns) {
    txns.sort((a, b) => a.date - b.date);

    const income = txns.filter(t => t.credit > 0);
    const expenses = txns.filter(t => t.debit > 0);

    const totalIncome = income.reduce((s, t) => s + t.credit, 0);
    const totalExpenses = expenses.reduce((s, t) => s + t.debit, 0);
    const netFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netFlow / totalIncome) * 100 : 0;

    const bankCharges = txns.filter(t => t.category === 'Bank Charges');
    const totalBankCharges = bankCharges.reduce((s, t) => s + t.debit, 0);

    // Category breakdown
    const catMap = {};
    expenses.forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = 0;
      catMap[t.category] += t.debit;
    });
    const catSorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    // Monthly aggregation
    const monthMap = {};
    txns.forEach(t => {
      const key = t.date.getFullYear() + '-' + String(t.date.getMonth() + 1).padStart(2, '0');
      if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0, count: 0 };
      monthMap[key].income += t.credit;
      monthMap[key].expenses += t.debit;
      monthMap[key].count++;
    });
    const months = Object.keys(monthMap).sort();

    // Summary
    const summaryGrid = document.getElementById('summaryGrid');
    const startDate = txns[0].date;
    const endDate = txns[txns.length - 1].date;
    const monthsSpan = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30.44)));

    summaryGrid.innerHTML = `
      <div class="result-item"><div class="label">Period</div><div class="value">${formatDate(startDate)} - ${formatDate(endDate)} (${monthsSpan} mo)</div></div>
      <div class="result-item"><div class="label">Total Income</div><div class="value success">${formatINR(Math.round(totalIncome))}</div></div>
      <div class="result-item"><div class="label">Total Expenses</div><div class="value" style="color:#ba1a1a">${formatINR(Math.round(totalExpenses))}</div></div>
      <div class="result-item"><div class="label">Net Cash Flow</div><div class="value ${netFlow >= 0 ? 'success' : 'danger'}">${formatINR(Math.round(netFlow))}</div></div>
      <div class="result-item"><div class="label">Avg Monthly Income</div><div class="value">${formatINR(Math.round(totalIncome / monthsSpan))}</div></div>
      <div class="result-item"><div class="label">Avg Monthly Expenses</div><div class="value">${formatINR(Math.round(totalExpenses / monthsSpan))}</div></div>
      <div class="result-item"><div class="label">Savings Rate</div><div class="value ${savingsRate >= 20 ? 'success' : savingsRate >= 10 ? '' : 'danger'}">${savingsRate.toFixed(1)}%</div></div>
      <div class="result-item"><div class="label">Bank Charges</div><div class="value" style="color:#ba1a1a">${formatINR(Math.round(totalBankCharges))}</div></div>
      <div class="result-item"><div class="label">Transactions</div><div class="value">${txns.length}</div></div>
      <div class="result-item"><div class="label">Avg Expense/Tx</div><div class="value">${formatINR(Math.round(totalExpenses / (expenses.length || 1)))}</div></div>
    `;

    // Income vs Expenses donut
    drawIncomeExpenseChart(totalIncome, totalExpenses);

    // Monthly trend bar
    drawMonthlyTrendChart(months, monthMap);

    // Category chart + table
    drawCategoryChart(catSorted, totalExpenses);

    // Category table
    const categoryBody = document.getElementById('categoryBody');
    categoryBody.innerHTML = catSorted.map(([cat, amt]) => `
      <tr>
        <td>${cat}</td>
        <td class="text-right">${formatINR(Math.round(amt))}</td>
        <td class="text-right">${(amt / totalExpenses * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    // Insights
    renderInsights(txns, catSorted, totalIncome, totalExpenses, netFlow, savingsRate, totalBankCharges, bankCharges.length, monthsSpan);

    // Transaction table
    renderTxTable(txns);

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderInsights(txns, catSorted, totalIncome, totalExpenses, netFlow, savingsRate, totalBankCharges, numBankCharges, monthsSpan) {
    const list = document.getElementById('insightsList');
    const insights = [];

    const topCat = catSorted[0];
    if (topCat) {
      const pct = (topCat[1] / totalExpenses * 100).toFixed(1);
      insights.push(`Your biggest expense category is <strong>${topCat[0]}</strong> at ${pct}% of total spending (${formatINR(Math.round(topCat[1]))}).`);
    }

    const top2 = catSorted[1];
    if (top2) {
      const pct2 = (top2[1] / totalExpenses * 100).toFixed(1);
      insights.push(`Second highest spending: <strong>${top2[0]}</strong> at ${pct2}% (${formatINR(Math.round(top2[1]))}).`);
    }

    if (totalBankCharges > 0) {
      const avgMonthlyCharge = totalBankCharges / monthsSpan;
      insights.push(`Bank charges total <strong>${formatINR(Math.round(totalBankCharges))}</strong> across ${numBankCharges} transactions (avg ${formatINR(Math.round(avgMonthlyCharge))}/mo). Consider switching to a zero-balance account.`);
    }

    if (savingsRate >= 30) {
      insights.push(`Excellent savings rate of <strong>${savingsRate.toFixed(1)}%</strong>! You're saving well above the recommended 20%.`);
    } else if (savingsRate >= 20) {
      insights.push(`Good savings rate of <strong>${savingsRate.toFixed(1)}%</strong>. You're on track with the 50-30-20 rule.`);
    } else if (savingsRate >= 10) {
      insights.push(`Savings rate is <strong>${savingsRate.toFixed(1)}%</strong>. Try to cut discretionary spending to reach 20%.`);
    } else {
      insights.push(`Savings rate is only <strong>${savingsRate.toFixed(1)}%</strong>. Review non-essential expenses to build an emergency fund.`);
    }

    const avgMonthlyExpense = totalExpenses / monthsSpan;
    const incomeTxns = txns.filter(t => t.credit > 0);
    const avgMonthlyIncome = totalIncome / monthsSpan;
    if (avgMonthlyIncome > 0) {
      insights.push(`Average monthly income: <strong>${formatINR(Math.round(avgMonthlyIncome))}</strong> vs expenses: <strong>${formatINR(Math.round(avgMonthlyExpense))}</strong>.`);
    }

    // find highest spending month
    const monthMap = {};
    txns.forEach(t => {
      const key = t.date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!monthMap[key]) monthMap[key] = 0;
      monthMap[key] += t.debit;
    });
    const maxMonth = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];
    if (maxMonth) {
      insights.push(`Highest spending month: <strong>${maxMonth[0]}</strong> (${formatINR(Math.round(maxMonth[1]))}).`);
    }

    const totalDays = Math.max(1, Math.round((txns[txns.length - 1].date - txns[0].date) / (1000 * 60 * 60 * 24)));
    const dailyAvgExpense = totalExpenses / totalDays;
    insights.push(`Average daily spend: <strong>${formatINR(Math.round(dailyAvgExpense))}</strong>.`);

    list.innerHTML = insights.map((ins, i) => `
      <div style="background:var(--bg-secondary); border-radius:8px; padding:10px 14px; font-size:0.9rem; border-left:4px solid ${getInsightColor(i)};">
        <span>${ins}</span>
      </div>
    `).join('');
  }

  function getInsightColor(i) {
    const colors = ['#d97706', '#2075ae', '#ba1a1a', '#00652c', '#8b5cf6', '#06b6d4', '#ec4899'];
    return colors[i % colors.length];
  }

  function renderTxTable(txns) {
    const body = document.getElementById('txBody');
    const search = document.getElementById('txSearch');
    const catFilter = document.getElementById('txCategoryFilter');
    const typeFilter = document.getElementById('txTypeFilter');

    // Populate category filter
    const cats = [...new Set(txns.map(t => t.category))].sort();
    catFilter.innerHTML = '<option value="all">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');

    function filterAndRender() {
      const q = search.value.toLowerCase();
      const cat = catFilter.value;
      const type = typeFilter.value;
      const filtered = txns.filter(t => {
        if (q && !t.desc.toLowerCase().includes(q)) return false;
        if (cat !== 'all' && t.category !== cat) return false;
        if (type === 'credit' && t.credit === 0) return false;
        if (type === 'debit' && t.debit === 0) return false;
        return true;
      });
      body.innerHTML = filtered.map(t => `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>${t.desc}</td>
          <td class="text-right" style="color:${t.debit > 0 ? '#ba1a1a' : ''}">${t.debit > 0 ? formatINR(Math.round(t.debit)) : '-'}</td>
          <td class="text-right" style="color:${t.credit > 0 ? '#00652c' : ''}">${t.credit > 0 ? formatINR(Math.round(t.credit)) : '-'}</td>
          <td class="text-right">${formatINR(Math.round(t.balance))}</td>
          <td>${t.category}</td>
        </tr>
      `).join('');
    }

    search.addEventListener('input', filterAndRender);
    catFilter.addEventListener('change', filterAndRender);
    typeFilter.addEventListener('change', filterAndRender);
    filterAndRender();
  }

  function drawIncomeExpenseChart(income, expenses) {
    const canvas = document.getElementById('incomeExpenseChart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = canvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const radius = displaySize / 2 - 20;
    const total = income + expenses;

    if (total === 0) return;

    const segs = [
      { label: 'Income', value: income, color: '#00652c' },
      { label: 'Expenses', value: expenses, color: '#ba1a1a' },
    ];

    let angleCursor = -Math.PI / 2;
    const regions = segs.filter(s => s.value > 0).map(seg => {
      const sliceAngle = (seg.value / total) * Math.PI * 2;
      const region = {
        type: 'arc', cx, cy, rInner: radius * 0.82, rOuter: radius,
        start: angleCursor, end: angleCursor + sliceAngle,
        label: seg.label, value: formatINR(Math.round(seg.value)), color: seg.color,
      };
      angleCursor += sliceAngle;
      return region;
    });
    ChartTooltip.bind(canvas, regions);

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / total) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
          ctx.stroke();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();

      const legendY = displaySize - 6;
      const legendItems = segs.filter(s => s.value > 0);
      ctx.font = '12px -apple-system, sans-serif';
      const totalW = legendItems.reduce((s, item) => s + 16 + ctx.measureText(item.label).width, 0) + (legendItems.length - 1) * 20;
      let lx = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 10, 12, 12);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(item.label, lx + 16, legendY + 2);
        lx += 16 + ctx.measureText(item.label).width + 20;
      });
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

  function drawMonthlyTrendChart(months, monthMap) {
    const canvas = document.getElementById('monthlyTrendChart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = canvas.parentElement.clientWidth || 350;
    const displayW = Math.min(550, containerWidth);
    const displayH = 200;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displayW, displayH);

    const pad = { top: 20, bottom: 30, left: 60, right: 20 };
    const chartW = displayW - pad.left - pad.right;
    const chartH = displayH - pad.top - pad.bottom;
    const barW = Math.min(40, chartW / months.length / 3);

    const allValues = months.flatMap(m => [monthMap[m].income, monthMap[m].expenses]);
    const maxVal = Math.max(...allValues, 1);

    // Y axis
    ctx.strokeStyle = '#dce1e4';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (chartH * i / 4);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#545f73';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatINR(Math.round(maxVal * i / 4)), pad.left - 5, y + 3);
    }

    const regions = [];
    months.forEach((m, i) => {
      const x = pad.left + chartW * (i + 0.5) / months.length;
      const data = monthMap[m];
      const incomeH = (data.income / maxVal) * chartH;
      const expenseH = (data.expenses / maxVal) * chartH;

      // Income bar
      ctx.fillStyle = '#00652c';
      ctx.fillRect(x - barW, pad.top + chartH - incomeH, barW - 2, incomeH);

      // Expense bar
      ctx.fillStyle = '#ba1a1a';
      ctx.fillRect(x + 2, pad.top + chartH - expenseH, barW - 2, expenseH);

      const monthLabel = m.slice(5) + '/' + m.slice(2, 4);
      if (data.income > 0) {
        regions.push({ type: 'rect', x: x - barW, y: pad.top + chartH - incomeH, w: barW - 2, h: incomeH,
          label: monthLabel + ' · Income', value: formatINR(Math.round(data.income)), color: '#00652c' });
      }
      if (data.expenses > 0) {
        regions.push({ type: 'rect', x: x + 2, y: pad.top + chartH - expenseH, w: barW - 2, h: expenseH,
          label: monthLabel + ' · Expenses', value: formatINR(Math.round(data.expenses)), color: '#ba1a1a' });
      }

      // X label
      ctx.fillStyle = '#545f73';
      ctx.font = '9px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const label = m.slice(5) + '/' + m.slice(2, 4);
      ctx.fillText(label, x, displayH - 5);
    });
    ChartTooltip.bind(canvas, regions);

    // Legend
    ctx.fillStyle = '#00652c';
    ctx.fillRect(displayW - 120, 5, 10, 10);
    ctx.fillStyle = '#191c1e';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Income', displayW - 106, 14);

    ctx.fillStyle = '#ba1a1a';
    ctx.fillRect(displayW - 60, 5, 10, 10);
    ctx.fillStyle = '#191c1e';
    ctx.fillText('Expenses', displayW - 46, 14);
  }

  function drawCategoryChart(catSorted, totalExpenses) {
    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = canvas.parentElement.clientWidth || 300;
    const displaySize = Math.min(300, containerWidth);
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2 - 15;
    const radius = displaySize / 2 - 45;

    const catColors = ['#d97706', '#005c8e', '#00652c', '#ba1a1a', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6', '#84cc16', '#d946ef', '#ba1a1a', '#2075ae', '#a855f7'];

    const segs = catSorted.map(([cat, amt], i) => ({
      label: cat, value: amt, color: catColors[i % catColors.length],
    }));

    let angleCursor = -Math.PI / 2;
    const regions = segs.filter(s => s.value > 0).map(seg => {
      const sliceAngle = (seg.value / totalExpenses) * Math.PI * 2;
      const region = {
        type: 'arc', cx, cy, rInner: radius * 0.82, rOuter: radius,
        start: angleCursor, end: angleCursor + sliceAngle,
        label: seg.label, value: formatINR(Math.round(seg.value)), color: seg.color,
      };
      angleCursor += sliceAngle;
      return region;
    });
    ChartTooltip.bind(canvas, regions);

    let startTime, animId;
    function draw(p) {
      ctx.clearRect(0, 0, displaySize, displaySize);
      const maxAngle = -Math.PI / 2 + 2 * Math.PI * p;
      let currentStart = -Math.PI / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      segs.forEach(seg => {
        if (seg.value <= 0) return;
        const sliceAngle = (seg.value / totalExpenses) * Math.PI * 2;
        const segEnd = currentStart + sliceAngle;
        if (currentStart < maxAngle) {
          const end = Math.min(segEnd, maxAngle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, currentStart, end); ctx.closePath();
          ctx.fillStyle = seg.color; ctx.fill();
          ctx.stroke();
        }
        currentStart = segEnd;
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();

      const legendY = displaySize - 6;
      const legendItems = segs.filter(s => s.value > 0);
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      const totalW = legendItems.reduce((s, item) => {
        const label = item.label + ' ' + (totalExpenses > 0 ? (item.value / totalExpenses * 100).toFixed(1) + '%' : '');
        return s + 10 + ctx.measureText(label).width + 16;
      }, 0) + (legendItems.length - 1) * 16;
      let lx = (displaySize - totalW) / 2;
      legendItems.forEach(item => {
        const label = item.label + ' ' + (totalExpenses > 0 ? (item.value / totalExpenses * 100).toFixed(1) + '%' : '');
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 10, 10, 10);
        ctx.fillStyle = '#191c1e';
        ctx.fillText(label, lx + 13, legendY + 2);
        lx += 10 + ctx.measureText(label).width + 16;
      });
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

  function formatDate(d) {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatINR(num) {
    return '\u20B9 ' + num.toLocaleString('en-IN');
  }
});
