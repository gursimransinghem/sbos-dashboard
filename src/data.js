// ─── Income ──────────────────────────────────────────────────
export const income = {
  grossMonthly: 35000,
  netMonthly: 25000,
};

// ─── Debt Avalanche Data ───────────────────────────────────────
// Ordered by APR descending (avalanche method)
export const creditCards = [
  { name: 'Jess Prime',      balance: 5571.92,  apr: 27.49, limit: 12000, status: 'ATTACK',  monthlyInterest: +(5571.92 * 0.2749 / 12).toFixed(2) },
  { name: 'Cap One QS',      balance: 4649.70,  apr: 27.24, limit: 6000,  status: 'LOCKED',  monthlyInterest: +(4649.70 * 0.2724 / 12).toFixed(2) },
  { name: 'Apple Card',      balance: 6282.30,  apr: 27.00, limit: 10000, status: 'MINIMUM',  monthlyInterest: +(6282.30 * 0.27 / 12).toFixed(2) },
  { name: 'Chase Sapphire',  balance: 14644.02, apr: 26.49, limit: 24000, status: 'MINIMUM',  monthlyInterest: +(14644.02 * 0.2649 / 12).toFixed(2) },
  { name: 'Spirit CC',       balance: 32.64,    apr: 25.00, limit: 1000,  status: 'KILL',     monthlyInterest: +(32.64 * 0.25 / 12).toFixed(2) },
];

export const otherDebts = [
  { name: 'Doc2Doc Loan 1',  balance: 13494, apr: 16.74, monthlyPayment: 212.37 },
  { name: 'Doc2Doc Loan 2',  balance: 8944,  apr: 20.74, monthlyPayment: 172.83 },
  { name: 'Student Loans',   balance: 200000, apr: 6.50, monthlyPayment: 0, note: 'Forbearance' },
  { name: 'Tesla',           balance: 106896, apr: 5.99, monthlyPayment: 2314.50 },
];

export const totalCCDebt = creditCards.reduce((s, c) => s + c.balance, 0);
export const totalMonthlyInterest = creditCards.reduce((s, c) => s + c.monthlyInterest, 0);

// ─── Paid Off Cards (Celebration!) ───────────────────────────
export const paidOffCards = [
  { name: 'Spirit BOA',       paidOff: 'Dec 2025' },
  { name: 'BOA Cash Rewards', paidOff: 'Jan 2026' },
  { name: 'Delta SkyMiles',   paidOff: 'Feb 2026' },
  { name: 'Chase Prime',      paidOff: 'Feb 2026' },
  { name: 'Jess Sapphire',    paidOff: 'Feb 2026' },
  { name: 'Costco Citi',      paidOff: 'Mar 2026' },
  { name: 'Sim Prime',        paidOff: 'Mar 2026' },
];

// ─── Spending Caps (March 2026 — from Monarch CSV 2026-03-09) ──
export const spendingCategories = [
  { name: 'Food Delivery',  cap: 400,  spent: 679,  icon: '🛵', alert: true },
  { name: 'Shopping',       cap: 1500, spent: 1522, icon: '🛍', alert: true },
  { name: 'Dining Out',     cap: 500,  spent: 622,  icon: '🍽', alert: true },
  { name: 'Entertainment',  cap: 200,  spent: 141,  icon: '🎮' },
  { name: 'PlayStation',    cap: 0,    spent: 0,    icon: '🚫' },
];

// ─── Bills Calendar ────────────────────────────────────────────
export const fixedBills = [
  { name: 'Rent',              amount: 6075, due: 1 },
  { name: 'Tesla Loan',        amount: 2314.50, due: 3 },
  { name: 'Doc2Doc #1',        amount: 212.37,  due: 5 },
  { name: 'Doc2Doc #2',        amount: 172.83,  due: 5 },
  { name: 'Sim Car Insurance', amount: 310,  due: 8 },
  { name: 'Jess Car Insurance', amount: 280, due: 8 },
  { name: 'Tesla Insurance',   amount: 400,  due: 20 },
  { name: 'Electric (TECO)',   amount: 220,  due: 10 },
  { name: 'Water',             amount: 85,   due: 12 },
  { name: 'Internet (Spectrum)', amount: 80, due: 15 },
  { name: 'Phone (T-Mobile)',  amount: 185,  due: 17 },
  { name: 'HOA',               amount: 348,  due: 1 },
  { name: 'Health/Dental',     amount: 500,  due: 1 },
  { name: 'Life Insurance',    amount: 90,   due: 25 },
  { name: 'Umbrella Policy',   amount: 35,   due: 25 },
];

export const subscriptions = [
  { name: 'Claude Pro',        amount: 200,  category: 'tools' },
  { name: 'ChatGPT Plus',      amount: 200,  category: 'tools' },
  { name: 'YouTube TV',        amount: 94,   category: 'streaming' },
  { name: 'fuboTV',            amount: 108,  category: 'streaming' },
  { name: 'Apple One Premier', amount: 38,   category: 'streaming' },
  { name: 'YouTube Premium',   amount: 23,   category: 'streaming' },
  { name: 'Spotify Duo',       amount: 17,   category: 'streaming' },
  { name: 'Disney+ Bundle',    amount: 16,   category: 'streaming' },
  { name: 'Paramount+',        amount: 13,   category: 'streaming' },
  { name: 'Peacock',           amount: 9,    category: 'streaming' },
  { name: 'Crunchyroll',       amount: 8,    category: 'streaming' },
  { name: 'Xbox Game Pass',    amount: 17,   category: 'gaming' },
  { name: 'Adobe',             amount: 36,   category: 'tools' },
  { name: 'Notion',            amount: 10,   category: 'tools' },
  { name: 'iCloud+ (2TB)',     amount: 10,   category: 'tools' },
  { name: 'GitHub Pro',        amount: 4,    category: 'tools' },
  { name: 'Gym (YouFit)',      amount: 40,   category: 'health' },
  { name: 'Costco',            amount: 10,   category: 'other' },
  { name: 'Amazon Prime',      amount: 12,   category: 'other' },
];

export const installments = [
  { name: '8sleep',   amount: 369, remaining: null },
  { name: 'iPhones',  amount: 71,  remaining: null },
];

export const billsSummary = {
  fixed: fixedBills.reduce((s, b) => s + b.amount, 0),
  subs: subscriptions.reduce((s, b) => s + b.amount, 0),
  installments: installments.reduce((s, b) => s + b.amount, 0),
};
billsSummary.total = billsSummary.fixed + billsSummary.subs + billsSummary.installments;

// ─── Monthly History (from Monarch CSV — 6 months) ───────────
export const monthlyHistory = [
  { month: 'Oct 25', spent: 114307, income: 115211 },
  { month: 'Nov 25', spent: 103994, income: 90411 },
  { month: 'Dec 25', spent: 129486, income: 135862 },
  { month: 'Jan 26', spent: 75873,  income: 83052 },
  { month: 'Feb 26', spent: 78036,  income: 78869 },
  { month: 'Mar 26', spent: 40625,  income: 49579, partial: true },
];

// ─── March 2026 Spending Breakdown (from Monarch CSV) ────────
export const marchSpendingBreakdown = [
  { category: 'Transfers',         amount: 25529 },
  { category: 'Rent',              amount: 6075 },
  { category: 'Loan Repayment',    amount: 2891 },
  { category: 'Auto Payment',      amount: 2315 },
  { category: 'Shopping',          amount: 1328 },
  { category: 'Restaurants & Bars', amount: 622 },
  { category: 'Insurance',         amount: 294 },
  { category: 'Fitness',           amount: 239 },
  { category: 'Groceries',         amount: 235 },
  { category: 'Taxi & Rides',      amount: 216 },
  { category: 'CC Payment',        amount: 204 },
  { category: 'Electronics',       amount: 194 },
  { category: 'Entertainment',     amount: 141 },
  { category: 'Financial Fees',    amount: 133 },
  { category: 'Interest',          amount: 101 },
  { category: 'Other',             amount: 108 },
];

// ─── Assets & Liabilities (NO Home Equity — they rent) ────────
export const assets = [
  { name: 'Tesla Model Y',    value: 28000 },
  { name: 'Jess Car',         value: 12000 },
  { name: '401k (Fidelity)',  value: 42000 },
  { name: 'Roth IRA',         value: 8500 },
  { name: 'HSA',              value: 3200 },
  { name: 'Inspira Rollover', value: 5537 },
  { name: 'Checking',         value: 4082 },
  { name: 'Savings',          value: 2100 },
];

export const liabilities = [
  { name: 'Student Loans', value: 200000 },
  { name: 'Tesla Loan',    value: 106896 },
  { name: 'Credit Cards',  value: totalCCDebt },
  { name: 'Doc2Doc Loans', value: 22438 },
];

export const totalAssets = assets.reduce((s, a) => s + a.value, 0);
export const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
export const netWorth = totalAssets - totalLiabilities;
