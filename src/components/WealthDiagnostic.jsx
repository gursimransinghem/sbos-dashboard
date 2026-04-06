import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { assets, liabilities, totalAssets, totalLiabilities, netWorth, income, totalCCDebt, billsSummary, creditCards, otherDebts } from '../data';

function fmt(n) {
  return n < 0
    ? `-$${Math.abs(n).toLocaleString()}`
    : `$${n.toLocaleString()}`;
}

const COLORS = ['#00f0ff', '#10b981', '#a78bfa', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// Monthly obligations
const totalFixedBills = billsSummary.fixed;
const totalSubs = billsSummary.subs;
const totalInstallments = billsSummary.installments;
const ccMinPayments = creditCards.reduce((s, c) => s + Math.min(35, c.balance), 0);
const totalMonthlyObligations = totalFixedBills + totalSubs + totalInstallments + ccMinPayments;

// Ratios
const savingsRate = ((income.netMonthly - totalMonthlyObligations) / income.netMonthly * 100);
const totalDebt = totalLiabilities;
const dti = (totalDebt / (income.grossMonthly * 12) * 100);
const cashOnHand = (assets.find(a => a.name === 'Checking')?.value || 0) + (assets.find(a => a.name === 'Savings')?.value || 0);
const liquidityRatio = cashOnHand / (totalMonthlyObligations || 1);

// Net worth projection (12 months)
// Assume: debt payoff at ~$5k/mo average, assets grow at ~0.5%/mo for retirement
const projectionData = [];
let projNetWorth = netWorth;
for (let i = 0; i <= 12; i++) {
  projectionData.push({
    month: i === 0 ? 'Now' : `M+${i}`,
    netWorth: Math.round(projNetWorth),
  });
  // Each month: reduce debt by ~$5000, assets grow slightly
  projNetWorth += 5000 + (totalAssets * 0.004);
}

// Cash flow breakdown
const cashFlowData = [
  { name: 'Fixed Bills', value: totalFixedBills, fill: '#00f0ff' },
  { name: 'Subscriptions', value: totalSubs, fill: '#a78bfa' },
  { name: 'Installments', value: totalInstallments, fill: '#f59e0b' },
  { name: 'CC Min Payments', value: ccMinPayments, fill: '#ef4444' },
  { name: 'Available', value: Math.max(0, income.netMonthly - totalMonthlyObligations), fill: '#10b981' },
];

const assetPieData = assets.map((a, i) => ({ name: a.name, value: a.value, fill: COLORS[i % COLORS.length] }));
const liabData = liabilities.map(l => ({ name: l.name, value: l.value }));

export default function WealthDiagnostic() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Big net worth number */}
      <div style={{
        padding: '20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '4px' }}>NET WORTH</div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.2rem',
          fontWeight: 800,
          color: netWorth >= 0 ? 'var(--green)' : 'var(--red)',
          lineHeight: 1.2,
        }}>
          {fmt(netWorth)}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '12px',
          fontSize: '0.7rem',
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Assets </span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(totalAssets)}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Liabilities </span>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>{fmt(totalLiabilities)}</span>
          </div>
        </div>
      </div>

      {/* Key Ratios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        <RatioCard
          label="SAVINGS RATE"
          value={`${savingsRate.toFixed(1)}%`}
          detail={`${fmt(Math.round(income.netMonthly - totalMonthlyObligations))} free/mo`}
          color={savingsRate > 20 ? 'var(--green)' : savingsRate > 10 ? 'var(--amber)' : 'var(--red)'}
        />
        <RatioCard
          label="DEBT-TO-INCOME"
          value={`${dti.toFixed(0)}%`}
          detail={`${fmt(totalDebt)} / ${fmt(income.grossMonthly * 12)}`}
          color={dti < 100 ? 'var(--green)' : dti < 200 ? 'var(--amber)' : 'var(--red)'}
        />
        <RatioCard
          label="LIQUIDITY"
          value={`${liquidityRatio.toFixed(1)}x`}
          detail={`${fmt(cashOnHand)} cash / ${fmt(Math.round(totalMonthlyObligations))} bills`}
          color={liquidityRatio > 3 ? 'var(--green)' : liquidityRatio > 1 ? 'var(--amber)' : 'var(--red)'}
        />
        <RatioCard
          label="MONTHLY CASH FLOW"
          value={fmt(income.netMonthly)}
          detail={`${fmt(Math.round(totalMonthlyObligations))} obligated`}
          color="var(--cyan)"
        />
      </div>

      {/* Cash Flow Breakdown */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--cyan)', marginBottom: '12px' }}>
          MONTHLY CASH FLOW: {fmt(income.netMonthly)} NET
        </div>
        {cashFlowData.map(item => {
          const pct = (item.value / income.netMonthly) * 100;
          return (
            <div key={item.name} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                <span style={{ color: item.fill, fontWeight: 600 }}>{fmt(item.value)} ({pct.toFixed(1)}%)</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(pct, 100)}%`,
                  background: item.fill,
                  borderRadius: '3px',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Net Worth Trajectory */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--green)', marginBottom: '12px' }}>
          NET WORTH TRAJECTORY (12-MONTH PROJECTION)
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => {
              const abs = Math.abs(v);
              return `${v < 0 ? '-' : ''}${abs >= 1000 ? `${(abs/1000).toFixed(0)}k` : abs}`;
            }} />
            <Tooltip
              formatter={(v) => [fmt(v), 'Net Worth']}
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '6px', fontSize: '0.7rem' }}
            />
            <Line type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Asset Allocation Pie */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--green)', marginBottom: '12px' }}>
          ASSET ALLOCATION
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '130px', height: '130px', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={58}
                  dataKey="value"
                  stroke="var(--bg-surface)"
                  strokeWidth={2}
                >
                  {assetPieData.map((entry, i) => (
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
            {assets.map((a, i) => (
              <div key={a.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.68rem',
                padding: '2px 0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    background: COLORS[i % COLORS.length],
                  }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{a.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{fmt(a.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liabilities bar chart */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--red)', marginBottom: '12px' }}>
          LIABILITIES
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={liabData} layout="vertical" barCategoryGap="20%">
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              formatter={(v) => [fmt(v), 'Balance']}
              cursor={{ fill: 'rgba(239,68,68,0.05)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {liabData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#64748b'} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function RatioCard({ label, value, detail, color }) {
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
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>
        {detail}
      </div>
    </div>
  );
}
