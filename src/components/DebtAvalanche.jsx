import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { creditCards, otherDebts, totalCCDebt, totalMonthlyInterest, paidOffCards } from '../data';

const statusColor = {
  ATTACK: '#ef4444',
  LOCKED: '#f59e0b',
  MINIMUM: '#64748b',
};

const statusLabel = {
  ATTACK: 'ATTACKING',
  LOCKED: 'LOCKED',
  MINIMUM: 'MIN PAY',
};

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtExact(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Simulate avalanche payoff for given monthly payment
function simulateAvalanche(cards, monthlyPayment) {
  let balances = cards.map(c => ({ ...c, bal: c.balance }));
  let totalInterest = 0;
  let monthData = [{ month: 0, total: balances.reduce((s, c) => s + c.bal, 0) }];
  const payoffDates = {};
  const minPayPerCard = 35; // assume $35 min per active card

  for (let month = 1; month <= 60; month++) {
    // Apply interest
    balances.forEach(c => {
      if (c.bal > 0) {
        const interest = c.bal * (c.apr / 100) / 12;
        c.bal += interest;
        totalInterest += interest;
      }
    });

    // Calculate available for attack after minimum payments
    let remaining = monthlyPayment;
    balances.forEach(c => {
      if (c.bal > 0) {
        const minPay = Math.min(minPayPerCard, c.bal);
        c.bal -= minPay;
        remaining -= minPay;
        if (c.bal <= 0) {
          c.bal = 0;
          if (!payoffDates[c.name]) payoffDates[c.name] = month;
        }
      }
    });

    // Attack highest APR card first with remaining
    for (const c of balances) {
      if (c.bal > 0 && remaining > 0) {
        const payment = Math.min(remaining, c.bal);
        c.bal -= payment;
        remaining -= payment;
        if (c.bal <= 0) {
          c.bal = 0;
          if (!payoffDates[c.name]) payoffDates[c.name] = month;
        }
      }
    }

    const totalBal = balances.reduce((s, c) => s + c.bal, 0);
    monthData.push({ month, total: Math.round(totalBal) });
    if (totalBal <= 0) break;
  }

  return { monthData, totalInterest: Math.round(totalInterest), payoffDates };
}

const scenarios = [
  { label: '$2k/mo (current)', payment: 2000, color: '#ef4444' },
  { label: '$5k/mo', payment: 5000, color: '#f59e0b' },
  { label: '$10k/mo (target)', payment: 10000, color: '#10b981' },
];

const simResults = scenarios.map(s => ({
  ...s,
  ...simulateAvalanche(creditCards, s.payment),
}));

// Build chart data for trajectory comparison
const maxMonths = Math.max(...simResults.map(r => r.monthData.length));
const trajectoryData = [];
for (let i = 0; i <= Math.min(maxMonths, 36); i++) {
  const point = { month: `M${i}` };
  simResults.forEach((r, idx) => {
    const d = r.monthData.find(m => m.month === i);
    point[`s${idx}`] = d ? d.total : 0;
  });
  trajectoryData.push(point);
}

// Balance transfer analysis
const costcoCiti = creditCards[0];
const btSavings12mo = Math.round(costcoCiti.balance * (costcoCiti.apr / 100));

// Doc2Doc refinancing analysis
const doc1 = otherDebts[0];
const doc2 = otherDebts[1];
const doc1CurrentInterest = doc1.balance * (doc1.apr / 100) / 12;
const doc2CurrentInterest = doc2.balance * (doc2.apr / 100) / 12;
const doc1RefiInterest = doc1.balance * 0.09 / 12;
const doc2RefiInterest = doc2.balance * 0.09 / 12;
const refiMonthlySavings = Math.round((doc1CurrentInterest + doc2CurrentInterest) - (doc1RefiInterest + doc2RefiInterest));

const chartData = creditCards.map(c => ({
  name: c.name.split(' ').pop(),
  interest: c.monthlyInterest,
  apr: c.apr,
}));

function CardRow({ card }) {
  const pct = (card.balance / card.limit) * 100;
  const color = statusColor[card.status];
  const paidPct = ((card.limit - card.balance) / card.limit) * 100;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '8px',
      padding: '12px 16px',
      background: card.status === 'ATTACK' ? 'var(--red-dim)' : 'var(--bg-surface)',
      border: `1px solid ${card.status === 'ATTACK' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
      borderRadius: '8px',
      transition: 'all 0.2s',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
            {card.name}
          </span>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            background: `${color}22`,
            color: color,
            letterSpacing: '0.05em',
            animation: card.status === 'ATTACK' ? 'pulse 2s infinite' : 'none',
          }}>
            {statusLabel[card.status]}
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {card.apr}% APR &middot; {fmtExact(card.monthlyInterest)}/mo interest
        </div>
        {/* Utilization bar */}
        <div style={{
          marginTop: '8px',
          height: '4px',
          background: 'var(--bg-elevated)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            background: pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--amber)' : 'var(--green)',
            borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {pct.toFixed(0)}% utilized &middot; {fmt(card.limit)} limit
        </div>
        {/* Progress bar - % paid off */}
        <div style={{ marginTop: '6px' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--green)', marginBottom: '2px' }}>
            {paidPct.toFixed(1)}% paid off
          </div>
          <div style={{
            height: '3px',
            background: 'var(--bg-elevated)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${paidPct}%`,
              background: 'var(--green)',
              borderRadius: '2px',
            }} />
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: card.status === 'ATTACK' ? 'var(--red)' : 'var(--text-primary)',
        }}>
          {fmt(card.balance)}
        </div>
      </div>
    </div>
  );
}

function OtherDebtRow({ debt }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid var(--border)',
      fontSize: '0.75rem',
    }}>
      <div>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{debt.name}</span>
        <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{debt.apr}%</span>
        {debt.note && <span style={{ color: 'var(--purple)', marginLeft: '8px', fontSize: '0.65rem' }}>{debt.note}</span>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontWeight: 600 }}>{fmt(debt.balance)}</span>
        {debt.monthlyPayment > 0 && (
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{fmtExact(debt.monthlyPayment)}/mo</div>
        )}
      </div>
    </div>
  );
}

function getPayoffDate(months) {
  if (!months) return 'N/A';
  const d = new Date(2026, 2); // March 2026
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function DebtAvalanche() {
  const [showScenarios, setShowScenarios] = useState(true);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Interest burn rate badge */}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'right' }}>
        {fmtExact(totalMonthlyInterest)}/mo interest burn
      </div>

      {/* Paid Off Celebration */}
      <div style={{
        background: 'var(--green-dim)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.08em', marginBottom: '8px' }}>
          CARDS ELIMINATED
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {paidOffCards.map(c => (
            <span key={c.name} style={{
              fontSize: '0.65rem',
              padding: '3px 8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '4px',
              color: 'var(--green)',
              fontWeight: 600,
            }}>
              {c.name} ({c.paidOff})
            </span>
          ))}
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Chip label="CC TOTAL" value={fmt(totalCCDebt)} color="var(--red)" />
        <Chip label="INTEREST/MO" value={fmtExact(totalMonthlyInterest)} color="var(--amber)" />
        <Chip label="TARGET" value="~JUNE 2026" color="var(--green)" />
      </div>

      {/* Credit cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {creditCards.map(c => <CardRow key={c.name} card={c} />)}
      </div>

      {/* Monthly interest chart */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>
          MONTHLY INTEREST BY CARD
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v}`}
            />
            <Tooltip
              formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Interest/mo']}
              cursor={{ fill: 'rgba(0,240,255,0.05)' }}
            />
            <Bar dataKey="interest" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={creditCards[i].status === 'ATTACK' ? '#ef4444' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Analysis */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px',
          cursor: 'pointer',
        }} onClick={() => setShowScenarios(!showScenarios)}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            PAYOFF TRAJECTORY (3 SCENARIOS) {showScenarios ? '▾' : '▸'}
          </div>
        </div>
        {showScenarios && (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trajectoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} interval={2} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip
                  formatter={(v, name) => {
                    const labels = { s0: '$2k/mo', s1: '$5k/mo', s2: '$10k/mo' };
                    return [fmt(v), labels[name] || name];
                  }}
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '6px', fontSize: '0.7rem' }}
                />
                <Legend formatter={(value) => {
                  const labels = { s0: '$2k/mo (current)', s1: '$5k/mo', s2: '$10k/mo (target)' };
                  return labels[value] || value;
                }} />
                {simResults.map((r, i) => (
                  <Line key={i} type="monotone" dataKey={`s${i}`} stroke={r.color} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>

            {/* Scenario comparison table */}
            <div style={{ marginTop: '16px', overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.65rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Scenario</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Total Interest</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>All CCs Clear</th>
                  </tr>
                </thead>
                <tbody>
                  {simResults.map((r, i) => {
                    const lastMonth = r.monthData[r.monthData.length - 1];
                    const clearMonth = lastMonth.total <= 0 ? r.monthData.length - 1 : null;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px 8px', color: r.color, fontWeight: 600 }}>{r.label}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--amber)' }}>{fmt(r.totalInterest)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: clearMonth ? 'var(--green)' : 'var(--text-muted)' }}>
                          {clearMonth ? getPayoffDate(clearMonth) : '36+ months'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Per-card payoff dates */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.05em' }}>
                CARD-BY-CARD PAYOFF DATES
              </div>
              <table style={{ width: '100%', fontSize: '0.6rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--text-muted)' }}>Card</th>
                    {scenarios.map((s, i) => (
                      <th key={i} style={{ padding: '4px 6px', textAlign: 'right', color: s.color }}>{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {creditCards.map(card => (
                    <tr key={card.name} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}>{card.name}</td>
                      {simResults.map((r, i) => (
                        <td key={i} style={{ padding: '4px 6px', textAlign: 'right', color: r.payoffDates[card.name] ? 'var(--green)' : 'var(--text-muted)' }}>
                          {r.payoffDates[card.name] ? getPayoffDate(r.payoffDates[card.name]) : '36+ mo'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Balance Transfer Callout */}
      <div style={{
        background: 'var(--cyan-dim)',
        border: '1px solid var(--border-accent)',
        borderRadius: '8px',
        padding: '14px 16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.08em', marginBottom: '6px' }}>
          BALANCE TRANSFER OPPORTUNITY
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Costco Citi {fmt(costcoCiti.balance)} at {costcoCiti.apr}% &rarr; 0% APR BT card saves up to <span style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(btSavings12mo)}</span> in interest over 12 months.
          Look for Citi Simplicity, BofA BankAmericard, or Wells Fargo Reflect.
        </div>
      </div>

      {/* Doc2Doc Refinancing */}
      <div style={{
        background: 'var(--purple-dim)',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        borderRadius: '8px',
        padding: '14px 16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--purple)', letterSpacing: '0.08em', marginBottom: '6px' }}>
          DOC2DOC REFINANCING ANALYSIS
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Current: Loan 1 at {doc1.apr}% + Loan 2 at {doc2.apr}% = {fmtExact(doc1CurrentInterest + doc2CurrentInterest)}/mo interest<br/>
          Refi to 9%: {fmtExact(doc1RefiInterest + doc2RefiInterest)}/mo interest<br/>
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>Monthly savings: ~{fmt(refiMonthlySavings)}</span> &mdash; consider SoFi, Splash, or Laurel Road physician loans
        </div>
      </div>

      {/* Other debts */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 12px 8px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}>
          OTHER DEBTS
        </div>
        {otherDebts.map(d => <OtherDebtRow key={d.name} debt={d} />)}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}

function Chip({ label, value, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 10px',
      background: `${color}15`,
      border: `1px solid ${color}33`,
      borderRadius: '6px',
      fontSize: '0.65rem',
    }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
