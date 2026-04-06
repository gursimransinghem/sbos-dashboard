import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';

function fmt(n) {
  return `$${n.toLocaleString()}`;
}

// Monthly category trends from Monarch CSV (6 months)
const categoryTrends = [
  { month: 'Oct 25', shopping: 1828, dining: 3076, groceries: 2669, entertainment: 1245, electronics: 2055, rides: 101 },
  { month: 'Nov 25', shopping: 15929, dining: 3145, groceries: 526, entertainment: 337, electronics: 435, rides: 225 },
  { month: 'Dec 25', shopping: 9184, dining: 1756, groceries: 892, entertainment: 1280, electronics: 269, rides: 265 },
  { month: 'Jan 26', shopping: 1121, dining: 1840, groceries: 425, entertainment: 1365, electronics: 94, rides: 599 },
  { month: 'Feb 26', shopping: 3632, dining: 2003, groceries: 983, entertainment: 2194, electronics: 473, rides: 131 },
  { month: 'Mar 26', shopping: 1328, dining: 622, groceries: 235, entertainment: 141, electronics: 194, rides: 216 },
];

const categories = [
  { key: 'shopping', label: 'Shopping', color: '#a78bfa' },
  { key: 'dining', label: 'Dining', color: '#f59e0b' },
  { key: 'groceries', label: 'Groceries', color: '#10b981' },
  { key: 'entertainment', label: 'Entertainment', color: '#ef4444' },
  { key: 'electronics', label: 'Electronics', color: '#00f0ff' },
  { key: 'rides', label: 'Rides', color: '#ec4899' },
];

// Compute totals per month for the line overlay
const trendWithTotals = categoryTrends.map(m => ({
  ...m,
  total: categories.reduce((s, c) => s + m[c.key], 0),
}));

export default function SpendingTrends() {
  const [showBreakdown, setShowBreakdown] = useState(true);

  // Month-over-month changes
  const latest = categoryTrends[categoryTrends.length - 1];
  const prev = categoryTrends[categoryTrends.length - 2];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stacked bar chart — category breakdown by month */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px',
          cursor: 'pointer',
        }} onClick={() => setShowBreakdown(!showBreakdown)}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--purple)' }}>
            DISCRETIONARY SPENDING BY CATEGORY {showBreakdown ? '▾' : '▸'}
          </div>
        </div>
        {showBreakdown && (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendWithTotals} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v, name) => {
                  const cat = categories.find(c => c.key === name);
                  return [fmt(v), cat ? cat.label : name];
                }}
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '6px', fontSize: '0.7rem' }}
              />
              <Legend formatter={v => {
                const cat = categories.find(c => c.key === v);
                return cat ? cat.label : v;
              }} />
              {categories.map(c => (
                <Bar key={c.key} dataKey={c.key} stackId="a" fill={c.color} opacity={0.8} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Total discretionary line chart */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--amber)', marginBottom: '12px' }}>
          TOTAL DISCRETIONARY TREND
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={trendWithTotals}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v) => [fmt(v), 'Discretionary']}
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '6px', fontSize: '0.7rem' }}
            />
            <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MoM Change Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {categories.slice(0, 3).map(cat => {
          const curr = latest[cat.key];
          const previous = prev[cat.key];
          const change = previous > 0 ? ((curr - previous) / previous * 100) : 0;
          return (
            <div key={cat.key} style={{
              padding: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '4px' }}>
                {cat.label.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: cat.color }}>
                {fmt(curr)}
              </div>
              <div style={{
                fontSize: '0.6rem',
                fontWeight: 600,
                color: change <= 0 ? 'var(--green)' : 'var(--red)',
                marginTop: '2px',
              }}>
                {change <= 0 ? '↓' : '↑'} {Math.abs(change).toFixed(0)}% vs Feb
              </div>
            </div>
          );
        })}
      </div>

      {/* Note about partial month */}
      <div style={{
        padding: '8px 12px',
        background: 'var(--amber-dim)',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: '6px',
        fontSize: '0.6rem',
        color: 'var(--text-secondary)',
      }}>
        March data is partial (through Mar 9). MoM comparisons will normalize as the month progresses.
      </div>
    </section>
  );
}
