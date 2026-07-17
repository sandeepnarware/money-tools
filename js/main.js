const tools = [
  { id: 'emi', name: 'EMI Calculator', icon: '🏦', desc: 'Calculate your loan EMI, total interest, and create an amortization schedule.' },
  { id: 'sip', name: 'SIP Calculator', icon: '📈', desc: 'Estimate the future value of your systematic investment plan.' },
  { id: 'swp', name: 'SWP Calculator', icon: '💸', desc: 'Plan your systematic withdrawals and see how long your corpus lasts.' },
  { id: 'opportunity-cost', name: 'Opportunity Cost Calculator', icon: '⚖️', desc: 'Compare two investment choices and see what you give up.' },
  { id: 'inflation', name: 'Inflation Calculator', icon: '📉', desc: 'See how inflation erodes your money\'s purchasing power over time.' },
  { id: 'rent-vs-buy', name: 'Rent vs Buy', icon: '🏠', desc: 'Compare the financial impact of renting vs buying a home.' },
  { id: 'property-registration', name: 'Property Registration Cost', icon: '📋', desc: 'Estimate stamp duty, registration fees, and other property costs.' },
  { id: 'rental-yield', name: 'Rental Yield Calculator', icon: '💰', desc: 'Calculate your property\'s gross and net rental yield.' },
  { id: 'cagr', name: 'CAGR Calculator', icon: '📊', desc: 'Compute the compound annual growth rate of your investment.' },
  { id: 'xirr', name: 'XIRR Calculator', icon: '📅', desc: 'Calculate the exact returns for irregular cash flows.' },
  { id: 'income-tax', name: 'Income Tax Optimizer', icon: '🧾', desc: 'Compare old vs new tax regime and find the best tax-saving strategy.' },
  { id: 'wealth-tracker', name: 'Wealth Tracker', icon: '💼', desc: 'Track assets, liabilities, and net worth over time with charts and projections.' },
  { id: 'step-up-sip', name: 'Step-Up SIP Calculator', icon: '🚀', desc: 'See how annually increasing your SIP contribution can boost your corpus.' },
  { id: 'lumpsum', name: 'Lumpsum Calculator', icon: '💎', desc: 'Calculate the future value of a one-time investment.' },
  { id: 'fixed-deposit', name: 'Fixed Deposit Calculator', icon: '🏛️', desc: 'Estimate FD maturity amount and interest earnings.' },
  { id: 'ppf', name: 'PPF Calculator', icon: '🛡️', desc: 'Plan your Public Provident Fund investments and maturity.' },
  { id: 'home-loan-prepayment', name: 'Home Loan Prepayment Calculator', icon: '🏠', desc: 'See how much interest you save by prepaying your home loan.' },
  { id: 'hra', name: 'HRA Calculator', icon: '🏢', desc: 'Calculate your HRA exemption for tax savings.' },
  { id: 'emergency-fund', name: 'Emergency Fund Calculator', icon: '🆘', desc: 'Find out how much you need for a rainy day fund.' },
  { id: 'fire', name: 'FIRE Calculator', icon: '🔥', desc: 'Calculate when you can achieve financial independence & retire early.' },
  { id: 'nps', name: 'NPS Calculator', icon: '🏦', desc: 'Estimate your NPS corpus and monthly pension at retirement.' },
  { id: 'capital-gains-tax', name: 'Capital Gains Tax Calculator', icon: '📊', desc: 'Calculate tax on capital gains from equity, debt & property.' },
  { id: 'expense-ratio-impact', name: 'Expense Ratio Impact Calculator', icon: '📉', desc: 'See how expense ratios eat into your mutual fund returns.' },
  { id: 'financial-health-score', name: 'Financial Health Score', icon: '❤️', desc: 'Get a score out of 100 with actionable tips to improve your finances.' },
  { id: 'sip-vs-fd', name: 'SIP vs FD', icon: '⚔️', desc: 'Compare returns from SIP investing vs fixed deposits.' },
  { id: 'child-education-planner', name: 'Child Education Planner', icon: '🎓', desc: 'Plan for your child\'s future education costs.' },
  { id: 'retirement-corpus', name: 'Retirement Corpus Calculator', icon: '🏖️', desc: 'Estimate the corpus you\'ll need for a comfortable retirement.' },
  { id: 'epf', name: 'EPF Calculator', icon: '🏛️', desc: 'Calculate your Employee Provident Fund corpus at retirement.' },
  { id: 'mutual-fund-tax', name: 'Mutual Fund Tax Calculator', icon: '💹', desc: 'Calculate capital gains tax on your mutual fund investments.' },
  { id: '44ada', name: '44ADA Calculator', icon: '📋', desc: 'Compute presumptive income tax for freelancers under Section 44ADA.' },
  { id: 'advance-tax', name: 'Advance Tax Calculator', icon: '📅', desc: 'Calculate your advance tax liability and quarterly due dates.' },
  { id: 'gst', name: 'GST Calculator', icon: '🛒', desc: 'Calculate GST amount inclusive or exclusive of the price.' },
  { id: 'sip-delay-cost', name: 'SIP Delay Cost Calculator', icon: '⏰', desc: 'See how delaying your SIP by even a year can cost you.' },
  { id: 'goal-based-sip', name: 'Goal-based SIP Calculator', icon: '🎯', desc: 'Find the monthly SIP needed to reach your financial goal.' },
  { id: 'dividend-reinvest', name: 'Dividend Reinvestment Calculator', icon: '🔄', desc: 'See how reinvesting dividends can grow your portfolio.' },
  { id: 'term-insurance', name: 'Term Insurance Need Calculator', icon: '🛡️', desc: 'Calculate how much term life insurance coverage you need.' },
  { id: 'health-insurance', name: 'Health Insurance Coverage Calculator', icon: '🏥', desc: 'Estimate adequate health insurance cover for your family.' },
  { id: 'debt-avalanche', name: 'Debt Avalanche Calculator', icon: '📉', desc: 'Pay off debts faster using the avalanche method (highest interest first).' },
  { id: 'retirement-readiness', name: 'Retirement Readiness Assessment', icon: '✅', desc: 'Assess if your retirement corpus is on track for your goals.' },
  { id: 'home-loan-vs-renting', name: 'Home Loan vs Renting', icon: '🏡', desc: 'Compare the long-term cost of buying vs renting a home.' },
  { id: 'regular-vs-direct', name: 'Regular vs Direct Mutual Funds', icon: '⚖️', desc: 'Compare regular and direct mutual fund returns and costs.' },
  { id: 'monthly-expense-tracker', name: 'Monthly Expense Tracker', icon: '📊', desc: 'Track and categorize your monthly spending.' },
  { id: 'portfolio-analyzer', name: 'Investment Portfolio Analyzer', icon: '📁', desc: 'Analyze your investment portfolio allocation and performance.' },
  { id: 'expense-pattern-analyzer', name: 'Expense Pattern Analyzer', icon: '🔍', desc: 'Analyze your spending patterns and identify savings opportunities.' },
  { id: 'subscription-detector', name: 'Subscription Detector', icon: '📱', desc: 'Track all your subscriptions and see what they cost you annually.' },
  { id: 'leave-encashment', name: 'Leave Encashment Calculator', icon: '✈️', desc: 'Calculate the value of your accrued leave days.' },
  { id: 'freelancer-tax', name: 'Freelancer Tax Calculator', icon: '💼', desc: 'Estimate your tax liability as a freelancer or self-employed.' },
];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('toolsGrid');
  if (!grid) return;

  grid.innerHTML = tools.map(t => `
    <a href="calculators/${t.id}/" class="tool-card">
      <div class="icon">${t.icon}</div>
      <h2>${t.name}</h2>
      <p>${t.desc}</p>
    </a>
  `).join('');
});
