import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { monthlyHistory, marchSpendingBreakdown, income } from '../data';

function fmt(n) {
  return n < 0
    ? `-$${Math.abs(n).toLocaleString()}`
    : `$${n.toLocaleString()}`;
}

const COLORS = ['#00f0ff', '#10b981', '#a78bfa', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#64748b', '#06b6d4', '#8b5cf6', '#d946ef', '#22d3ee', '#facc15', '#fb923c'];

// Top spending categories for the pie (exclude Transfers — they're debt payments)
const discretionarySpending = marchSpendingBreakdown
  .filter(c => c.category !== 'Transfers' && c.category !== 'CC Payment')
  .slice(0, 10);

const pieData = discretionarySpending.map((c, i) => ({
  name: c.category,
  value: c.amount,
  fill: COLORS[i % COLORS.length],
}));

export default function CashFlowAnalysis() {
  const currentMonth = monthlyHistory[monthlyHistory.length - 1];
  const prevMonth = monthlyHistory[monthlyHistory.length - 2];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Income vs Spending — 6 month trend */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--cyan)', marginBottom: '12px' }}>
          INCOME vs SPENDING (6-MONTH TREND)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyHistory} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v, name) => [fmt(v), name === 'income' ? 'Income' : 'Spending']}
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '6px', fontSize: '0.7rem' }}
            />
            <Legend formatter={v => v === 'income' ? 'Income' : 'Spending'} />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="spent" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>

        {/* Net savings row */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          flexWrap: 'wrap',
        }}>
          {monthlyHistory.map(m => {
            const net = m.income - m.spent;
            return (
              <div key={m.month} style={{
                flex: 1,
                minWidth: '70px',
                padding: '6px 8px',
                background: net >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
                border: `1px solid ${net >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '0.6rem',
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>{m.month}</div>
                <div style={{ color: net >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                  {net >= 0 ? '+' : ''}{fmt(net)}
                  {m.partial && <span style={{ color: 'var(--amber)', marginLeft: '4px' }}>*</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          * March is partial (through Mar 9)
        </div>
      </div>

      {/* March Spending Breakdown Pie */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--amber)', marginBottom: '12px' }}>
          MARCH SPENDING BREAKDOWN (EXCL. TRANSFERS)
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '140px', height: '140px', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={62}
                  dataKey="value"
                  stroke="var(--bg-surface)"
                  strokeWidth={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [fmt(v), '']}
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '6px', fontSize: '0.7rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '180px' }}>
            {discretionarySpending.map((c, i) => (
              <div key={c.category} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                padding: '2px 0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    background: COLORS[i % COLORS.length],
                  }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{fmt(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Month-over-month comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
      }}>
        <StatCard
          label="FEB INCOME"
          value={fmt(prevMonth.income)}
          color="var(--green)"
        />
        <StatCard
          label="FEB SPENDING"
          value={fmt(prevMonth.spent)}
          color="var(--red)"
        />
        <StatCard
          label="MAR INCOME (partial)"
          value={fmt(currentMonth.income)}
          color="var(--green)"
        />
        <StatCard
          label="MAR SPENDING (partial)"
          value={fmt(currentMonth.spent)}
          color="var(--amber)"
        />
      </div>
    </section>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: '12px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
    </div>
  );
}
