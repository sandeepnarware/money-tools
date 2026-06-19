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
