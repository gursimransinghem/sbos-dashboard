import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { spendingCategories } from '../data';

function fmt(n) {
  return `$${n.toLocaleString()}`;
}

function GaugeRing({ spent, cap, color, size = 80 }) {
  if (cap === 0) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid var(--red)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        opacity: 0.6,
      }}>
        🚫
      </div>
    );
  }

  const pct = Math.min((spent / cap) * 100, 100);
  const remaining = 100 - pct;
  const data = [
    { value: pct },
    { value: remaining },
  ];

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="var(--bg-elevated)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 700,
        color,
      }}>
        {pct.toFixed(0)}%
      </div>
    </div>
  );
}

function SpendRow({ cat }) {
  const pct = cat.cap > 0 ? (cat.spent / cat.cap) * 100 : 0;
  const color = cat.cap === 0
    ? 'var(--red)'
    : pct > 90
      ? 'var(--red)'
      : pct > 70
        ? 'var(--amber)'
        : 'var(--green)';

  const remaining = cat.cap - cat.spent;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '16px',
      alignItems: 'center',
      padding: '12px 16px',
      background: pct > 90 ? 'var(--red-dim)' : 'var(--bg-surface)',
      border: `1px solid ${pct > 90 ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
      borderRadius: '8px',
    }}>
      <GaugeRing spent={cat.spent} cap={cat.cap} color={color} size={56} />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontSize: '1rem' }}>{cat.icon}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem' }}>
            {cat.name}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          height: '3px',
          background: 'var(--bg-elevated)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '4px',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            background: color,
            borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {fmt(cat.spent)} of {fmt(cat.cap)} cap
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: remaining < 0 ? 'var(--red)' : 'var(--green)',
        }}>
          {remaining >= 0 ? fmt(remaining) : `-${fmt(Math.abs(remaining))}`}
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
          {remaining >= 0 ? 'remaining' : 'over budget'}
        </div>
      </div>
    </div>
  );
}

export default function SpendingMonitor() {
  const totalSpent = spendingCategories.reduce((s, c) => s + c.spent, 0);
  const totalCap = spendingCategories.reduce((s, c) => s + c.cap, 0);
  const overallPct = totalCap > 0 ? ((totalSpent / totalCap) * 100).toFixed(0) : 0;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Month indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'var(--cyan-dim)',
        border: '1px solid var(--border-accent)',
        borderRadius: '6px',
        fontSize: '0.7rem',
      }}>
        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>MAR 2026</span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Day 13 of 31 · {fmt(totalSpent)} spent of {fmt(totalCap)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {spendingCategories.map(cat => <SpendRow key={cat.name} cat={cat} />)}
      </div>
    </section>
  );
}
