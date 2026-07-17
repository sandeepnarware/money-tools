const categories = [
  { id: 'all', label: 'All Tools' },
  { id: 'invest', label: 'Investment' },
  { id: 'save', label: 'Savings & Retirement' },
  { id: 'loan', label: 'Loan & Insurance' },
  { id: 'plan', label: 'Tax & Planning' },
];

const tools = [
  // === INVESTMENT ===
  { id: 'sip', name: 'SIP Calculator', icon: '📈', desc: 'Estimate the future value of your systematic investment plan.', cat: 'invest' },
  { id: 'step-up-sip', name: 'Step-Up SIP Calculator', icon: '🚀', desc: 'See how annually increasing your SIP can boost your corpus.', cat: 'invest' },
  { id: 'lumpsum', name: 'Lumpsum Calculator', icon: '💎', desc: 'Calculate the future value of a one-time investment.', cat: 'invest' },
  { id: 'swp', name: 'SWP Calculator', icon: '💸', desc: 'Plan your systematic withdrawals and see how long your corpus lasts.', cat: 'invest' },
  { id: 'sip-delay-cost', name: 'SIP Delay Cost Calculator', icon: '⏰', desc: 'See how delaying your SIP by even a year can cost you.', cat: 'invest' },
  { id: 'goal-based-sip', name: 'Goal-based SIP Calculator', icon: '🎯', desc: 'Find the monthly SIP needed to reach your financial goal.', cat: 'invest' },
  { id: 'cagr', name: 'CAGR Calculator', icon: '📊', desc: 'Compute the compound annual growth rate of your investment.', cat: 'invest' },
  { id: 'xirr', name: 'XIRR Calculator', icon: '📅', desc: 'Calculate the exact returns for irregular cash flows.', cat: 'invest' },
  { id: 'opportunity-cost', name: 'Opportunity Cost Calculator', icon: '⚖️', desc: 'Compare two investment choices and see what you give up.', cat: 'invest' },
  { id: 'expense-ratio-impact', name: 'Expense Ratio Impact Calculator', icon: '📉', desc: 'See how expense ratios eat into your mutual fund returns.', cat: 'invest' },
  { id: 'dividend-reinvest', name: 'Dividend Reinvestment Calculator', icon: '🔄', desc: 'See how reinvesting dividends can grow your portfolio.', cat: 'invest' },
  { id: 'dividend-yield', name: 'Dividend Yield Calculator', icon: '💵', desc: 'Calculate the dividend yield on your stock investments.', cat: 'invest' },
  { id: 'portfolio-allocation', name: 'Portfolio Allocation Calculator', icon: '📊', desc: 'Optimize your asset allocation across equity, debt, gold and more.', cat: 'invest' },
  { id: 'risk-reward', name: 'Risk/Reward Calculator', icon: '⚡', desc: 'Assess the risk-reward ratio of your investment decisions.', cat: 'invest' },
  { id: 'portfolio-analyzer', name: 'Investment Portfolio Analyzer', icon: '📁', desc: 'Analyze your investment portfolio allocation and performance.', cat: 'invest' },
  { id: 'mutual-fund-portfolio-review', name: 'Mutual Fund Portfolio Review', icon: '📋', desc: 'Review and analyze your mutual fund portfolio.', cat: 'invest' },
  { id: 'gold-sip', name: 'Gold SIP Calculator', icon: '🥇', desc: 'Plan your gold investment through a Gold SIP.', cat: 'invest' },
  { id: 'gold-loan', name: 'Gold Loan Calculator', icon: '💍', desc: 'Calculate EMI and interest for a gold loan.', cat: 'invest' },
  { id: 'currency-converter', name: 'Currency Converter', icon: '💱', desc: 'Convert between Indian Rupee and major world currencies.', cat: 'invest' },
  { id: 'sip-vs-fd', name: 'SIP vs FD', icon: '⚔️', desc: 'Compare returns from SIP investing vs fixed deposits.', cat: 'invest' },
  { id: 'regular-vs-direct', name: 'Regular vs Direct Mutual Funds', icon: '⚖️', desc: 'Compare regular and direct mutual fund returns and costs.', cat: 'invest' },
  { id: 'ppf-vs-fd', name: 'PPF vs FD', icon: '🔄', desc: 'Compare PPF and Fixed Deposit returns over time.', cat: 'invest' },
  { id: 'etf-vs-mutual-fund', name: 'ETF vs Mutual Fund', icon: '📊', desc: 'Compare ETFs and mutual funds for your investment goals.', cat: 'invest' },
  { id: 'gold-etf-vs-physical-gold', name: 'Gold ETF vs Physical Gold', icon: '🏅', desc: 'Compare investing in Gold ETFs vs buying physical gold.', cat: 'invest' },
  { id: 'lump-sum-vs-sip', name: 'Lump Sum vs SIP', icon: '💪', desc: 'Compare lump sum investing vs systematic investment plans.', cat: 'invest' },
  { id: 'nps-vs-mutual-fund', name: 'NPS vs Mutual Fund', icon: '🏦', desc: 'Compare NPS and mutual fund investments for retirement.', cat: 'invest' },

  // === SAVINGS & RETIREMENT ===
  { id: 'fixed-deposit', name: 'Fixed Deposit Calculator', icon: '🏛️', desc: 'Estimate FD maturity amount and interest earnings.', cat: 'save' },
  { id: 'recurring-deposit', name: 'Recurring Deposit Calculator', icon: '🏦', desc: 'Calculate the maturity value of your RD investments.', cat: 'save' },
  { id: 'ppf', name: 'PPF Calculator', icon: '🛡️', desc: 'Plan your Public Provident Fund investments and maturity.', cat: 'save' },
  { id: 'epf', name: 'EPF Calculator', icon: '🏛️', desc: 'Calculate your Employee Provident Fund corpus at retirement.', cat: 'save' },
  { id: 'vpf', name: 'VPF Calculator', icon: '💰', desc: 'Calculate your Voluntary Provident Fund contributions and corpus.', cat: 'save' },
  { id: 'sukanya-samriddhi', name: 'Sukanya Samriddhi Calculator', icon: '👧', desc: 'Plan your Sukanya Samriddhi Yojana investment for your daughter.', cat: 'save' },
  { id: 'senior-citizen-savings-scheme', name: 'SCSS Calculator', icon: '👴', desc: 'Calculate returns from the Senior Citizen Savings Scheme.', cat: 'save' },
  { id: 'nps', name: 'NPS Calculator', icon: '🏦', desc: 'Estimate your NPS corpus and monthly pension at retirement.', cat: 'save' },
  { id: 'pension', name: 'Pension Calculator', icon: '🧓', desc: 'Estimate how much pension you need and how to build it.', cat: 'save' },
  { id: 'fire', name: 'FIRE Calculator', icon: '🔥', desc: 'Calculate when you can achieve financial independence & retire early.', cat: 'save' },
  { id: 'coast-fire', name: 'Coast FIRE Calculator', icon: '🏝️', desc: 'Calculate the savings needed to coast to retirement.', cat: 'save' },
  { id: 'lean-fire', name: 'Lean FIRE Calculator', icon: '🌿', desc: 'Plan for a minimalist, lean FIRE retirement.', cat: 'save' },
  { id: 'fat-fire', name: 'Fat FIRE Calculator', icon: '🍷', desc: 'Plan for a comfortable, fat FIRE retirement.', cat: 'save' },
  { id: 'retirement-corpus', name: 'Retirement Corpus Calculator', icon: '🏖️', desc: 'Estimate the corpus you will need for a comfortable retirement.', cat: 'save' },
  { id: 'retirement-withdrawal', name: 'Retirement Withdrawal Calculator', icon: '💳', desc: 'Plan your retirement withdrawals to make your corpus last.', cat: 'save' },
  { id: 'retirement-readiness', name: 'Retirement Readiness Assessment', icon: '✅', desc: 'Assess whether your retirement corpus is on track.', cat: 'save' },
  { id: 'inflation-during-retirement', name: 'Inflation During Retirement', icon: '📈', desc: 'See how inflation impacts your retirement corpus.', cat: 'save' },
  { id: 'emergency-fund', name: 'Emergency Fund Calculator', icon: '🆘', desc: 'Find out how much you need for a rainy day fund.', cat: 'save' },
  { id: 'savings-rate', name: 'Savings Rate Calculator', icon: '📊', desc: 'Calculate your savings rate and see how it affects your FI journey.', cat: 'save' },
  { id: 'financial-independence-tracker', name: 'FI Progress Tracker', icon: '📈', desc: 'Track your progress toward financial independence.', cat: 'save' },

  // === LOAN & INSURANCE ===
  { id: 'emi', name: 'EMI Calculator', icon: '🏦', desc: 'Calculate your loan EMI, total interest, and amortization schedule.', cat: 'loan' },
  { id: 'home-loan-prepayment', name: 'Home Loan Prepayment Calculator', icon: '🏠', desc: 'See how much interest you save by prepaying your home loan.', cat: 'loan' },
  { id: 'balance-transfer', name: 'Balance Transfer Calculator', icon: '🔄', desc: 'Compare the savings from transferring your loan balance.', cat: 'loan' },
  { id: 'interest-saved', name: 'Interest Saved Calculator', icon: '💵', desc: 'Calculate how much interest you save by making extra payments.', cat: 'loan' },
  { id: 'home-affordability', name: 'Home Affordability Calculator', icon: '🏡', desc: 'Find out how much home you can afford based on your income.', cat: 'loan' },
  { id: 'rent-vs-buy', name: 'Rent vs Buy', icon: '🏠', desc: 'Compare the financial impact of renting vs buying a home.', cat: 'loan' },
  { id: 'home-loan-vs-renting', name: 'Home Loan vs Renting', icon: '🏡', desc: 'Compare the long-term cost of buying vs renting a home.', cat: 'loan' },
  { id: 'property-registration', name: 'Property Registration Cost', icon: '📋', desc: 'Estimate stamp duty, registration fees, and other property costs.', cat: 'loan' },
  { id: 'rental-yield', name: 'Rental Yield Calculator', icon: '💰', desc: 'Calculate your propertys gross and net rental yield.', cat: 'loan' },
  { id: 'term-insurance', name: 'Term Insurance Need Calculator', icon: '🛡️', desc: 'Calculate how much term life insurance coverage you need.', cat: 'loan' },
  { id: 'health-insurance', name: 'Health Insurance Coverage Calculator', icon: '🏥', desc: 'Estimate adequate health insurance cover for your family.', cat: 'loan' },
  { id: 'life-insurance-gap', name: 'Life Insurance Gap Calculator', icon: '⚠️', desc: 'Find the gap in your life insurance coverage.', cat: 'loan' },
  { id: 'vehicle-insurance', name: 'Vehicle Insurance Comparison', icon: '🚗', desc: 'Compare vehicle insurance plans and coverage.', cat: 'loan' },
  { id: 'debt-avalanche', name: 'Debt Avalanche Calculator', icon: '📉', desc: 'Pay off debts faster using the avalanche method.', cat: 'loan' },
  { id: 'debt-snowball', name: 'Debt Snowball Calculator', icon: '⛄', desc: 'Pay off debts faster using the snowball method.', cat: 'loan' },

  // === TAX & PLANNING ===
  { id: 'income-tax', name: 'Income Tax Optimizer', icon: '🧾', desc: 'Compare old vs new tax regime and find the best strategy.', cat: 'plan' },
  { id: 'capital-gains-tax', name: 'Capital Gains Tax Calculator', icon: '📊', desc: 'Calculate tax on capital gains from equity, debt and property.', cat: 'plan' },
  { id: 'mutual-fund-tax', name: 'Mutual Fund Tax Calculator', icon: '💹', desc: 'Calculate capital gains tax on your mutual fund investments.', cat: 'plan' },
  { id: 'gold-tax', name: 'Gold Tax Calculator', icon: '🥇', desc: 'Calculate tax on gains from gold investments.', cat: 'plan' },
  { id: 'stock-tax', name: 'Stock Tax Calculator', icon: '📈', desc: 'Calculate tax on your stock market gains.', cat: 'plan' },
  { id: 'tax-loss-harvesting', name: 'Tax Loss Harvesting Calculator', icon: '🌾', desc: 'See how tax loss harvesting can reduce your tax liability.', cat: 'plan' },
  { id: 'freelancer-tax', name: 'Freelancer Tax Calculator', icon: '💼', desc: 'Estimate your tax liability as a freelancer or self-employed.', cat: 'plan' },
  { id: '44ada', name: '44ADA Calculator', icon: '📋', desc: 'Compute presumptive income tax for freelancers under 44ADA.', cat: 'plan' },
  { id: '44ad', name: '44AD Calculator', icon: '📋', desc: 'Compute presumptive income tax for businesses under 44AD.', cat: 'plan' },
  { id: 'advance-tax', name: 'Advance Tax Calculator', icon: '📅', desc: 'Calculate your advance tax liability and quarterly due dates.', cat: 'plan' },
  { id: 'gst', name: 'GST Calculator', icon: '🛒', desc: 'Calculate GST amount inclusive or exclusive of the price.', cat: 'plan' },
  { id: 'huf-tax-benefit', name: 'HUF Tax Benefit Calculator', icon: '👨‍👩‍👧‍👦', desc: 'Calculate tax savings by creating a Hindu Undivided Family.', cat: 'plan' },
  { id: 'hra', name: 'HRA Calculator', icon: '🏢', desc: 'Calculate your HRA exemption for tax savings.', cat: 'plan' },
  { id: 'leave-encashment', name: 'Leave Encashment Calculator', icon: '✈️', desc: 'Calculate the value of your accrued leave days.', cat: 'plan' },
  { id: 'gratuity', name: 'Gratuity Calculator', icon: '🎁', desc: 'Calculate your gratuity amount based on years of service.', cat: 'plan' },
  { id: 'inflation', name: 'Inflation Calculator', icon: '📉', desc: 'See how inflation erodes your money purchasing power over time.', cat: 'plan' },
  { id: 'financial-health-score', name: 'Financial Health Score', icon: '❤️', desc: 'Get a score out of 100 with actionable tips to improve your finances.', cat: 'plan' },
  { id: 'child-education-planner', name: 'Child Education Planner', icon: '🎓', desc: 'Plan for your child future education costs.', cat: 'plan' },
  { id: 'monthly-expense-tracker', name: 'Monthly Expense Tracker', icon: '📊', desc: 'Track and categorize your monthly spending.', cat: 'plan' },
  { id: 'expense-pattern-analyzer', name: 'Expense Pattern Analyzer', icon: '🔍', desc: 'Analyze your spending patterns and find savings opportunities.', cat: 'plan' },
  { id: 'subscription-detector', name: 'Subscription Detector', icon: '📱', desc: 'Track all your subscriptions and see what they cost annually.', cat: 'plan' },
  { id: '50-30-20-budget', name: '50/30/20 Budget Calculator', icon: '📊', desc: 'Apply the 50/30/20 budgeting rule to your income.', cat: 'plan' },
  { id: 'zero-based-budget', name: 'Zero-Based Budget Planner', icon: '📋', desc: 'Plan a zero-based budget where every rupee is allocated.', cat: 'plan' },
  { id: 'spending-category-analyzer', name: 'Spending Category Analyzer', icon: '📊', desc: 'Analyze your spending across different categories.', cat: 'plan' },
  { id: 'credit-score-planner', name: 'Credit Score Improvement Planner', icon: '📈', desc: 'Get a personalized plan to improve your credit score.', cat: 'plan' },
  { id: 'emergency-fund-planner', name: 'Emergency Fund Planner', icon: '🆘', desc: 'Plan your emergency fund savings goal step by step.', cat: 'plan' },
  { id: 'marriage-planner', name: 'Marriage Planning Calculator', icon: '💒', desc: 'Plan and save for your wedding expenses.', cat: 'plan' },
  { id: 'vacation-planner', name: 'Vacation Savings Planner', icon: '✈️', desc: 'Plan and save for your dream vacation.', cat: 'plan' },
  { id: 'house-purchase-planner', name: 'House Purchase Planner', icon: '🏡', desc: 'Plan your savings journey to buy your dream home.', cat: 'plan' },
  { id: 'car-purchase-planner', name: 'Car Purchase Planner', icon: '🚗', desc: 'Plan your savings to buy your dream car.', cat: 'plan' },
  { id: 'wealth-tracker', name: 'Wealth Tracker', icon: '💼', desc: 'Track assets, liabilities, and net worth over time.', cat: 'plan' },
  { id: 'bank-statement-analyzer', name: 'Bank Statement Analyzer', icon: '🏧', desc: 'Analyze your bank statements for spending patterns.', cat: 'plan' },
  { id: 'ppp-salary', name: 'PPP Salary Comparison', icon: '🌍', desc: 'Compare salaries across countries adjusted for purchasing power.', cat: 'plan' },
  { id: 'cost-of-living', name: 'India vs Other Countries Cost of Living', icon: '🏙️', desc: 'Compare cost of living between India and other countries.', cat: 'plan' },
  { id: 'inflation-across-countries', name: 'Inflation Across Countries', icon: '📈', desc: 'Compare inflation rates across different countries.', cat: 'plan' },
];

document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.getElementById('categoryTabs');
  const grid = document.getElementById('toolsGrid');

  if (!tabsContainer || !grid) return;

  tabsContainer.innerHTML = categories.map(c =>
    `<button class="category-tab${c.id === 'all' ? ' active' : ''}" data-cat="${c.id}">${c.label}</button>`
  ).join('');

  function render(catId) {
    const filtered = catId === 'all' ? tools : tools.filter(t => t.cat === catId);
    grid.innerHTML = filtered.map(t => `
      <a href="calculators/${t.id}/" class="tool-card">
        <div class="icon">${t.icon}</div>
        <h2>${t.name}</h2>
        <p>${t.desc}</p>
      </a>
    `).join('');
  }

  render('all');

  tabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;
    tabsContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    render(tab.dataset.cat);
  });
});
