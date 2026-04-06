import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { assets, liabilities, totalAssets, totalLiabilities, netWorth } from '../data';

function fmt(n) {
  return n < 0
    ? `-$${Math.abs(n).toLocaleString()}`
    : `$${n.toLocaleString()}`;
}

const COLORS = ['#00f0ff', '#10b981', '#a78bfa', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

export default function NetWorth() {
  const pieData = assets.map((a, i) => ({ name: a.name, value: a.value, fill: COLORS[i % COLORS.length] }));
  const liabData = liabilities.map(l => ({ name: l.name, value: l.value }));

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--green), var(--cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          NET WORTH
        </h2>
      </div>

      {/* Big number */}
      <div style={{
        padding: '20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
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

      {/* Assets breakdown */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--green)', marginBottom: '12px' }}>
          ASSETS BREAKDOWN
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
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
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
        <ResponsiveContainer width="100%" height={180}>
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
