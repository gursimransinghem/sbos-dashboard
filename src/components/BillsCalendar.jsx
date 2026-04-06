import { billsSummary, fixedBills, subscriptions, installments } from '../data';

function fmt(n) {
  return `$${n.toLocaleString()}`;
}

function BillRow({ name, amount, detail, accent }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid var(--border)',
      fontSize: '0.72rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '3px',
          height: '16px',
          borderRadius: '2px',
          background: accent || 'var(--cyan)',
        }} />
        <span style={{ color: 'var(--text-primary)' }}>{name}</span>
        {detail && <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{detail}</span>}
      </div>
      <span style={{ fontWeight: 600, color: amount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {amount > 0 ? fmt(amount) : '—'}
      </span>
    </div>
  );
}

function SectionBlock({ title, items, accent, renderItem }) {
  const total = items.reduce((s, i) => s + (i.amount || 0), 0);
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '14px 16px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: accent,
        }}>
          {title}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: accent }}>
          {fmt(total)}
        </span>
      </div>
      {items.map((item, i) => renderItem(item, i))}
    </div>
  );
}

export default function BillsCalendar() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
      }}>
        <SummaryChip label="FIXED" value={fmt(billsSummary.fixed)} color="var(--cyan)" />
        <SummaryChip label="SUBS" value={fmt(billsSummary.subs)} color="var(--purple)" />
        <SummaryChip label="INSTALLMENTS" value={fmt(billsSummary.installments)} color="var(--amber)" />
      </div>

      {/* Fixed bills */}
      <SectionBlock
        title="FIXED MONTHLY"
        items={fixedBills.filter(b => b.amount > 0)}
        accent="var(--cyan)"
        renderItem={(bill) => (
          <BillRow
            key={bill.name}
            name={bill.name}
            amount={bill.amount}
            detail={bill.due ? `Due ${bill.due}th` : null}
            accent="var(--cyan)"
          />
        )}
      />

      {/* Subscriptions */}
      <SectionBlock
        title="SUBSCRIPTIONS"
        items={subscriptions}
        accent="var(--purple)"
        renderItem={(sub) => (
          <BillRow
            key={sub.name}
            name={sub.name}
            amount={sub.amount}
            detail={sub.category}
            accent="var(--purple)"
          />
        )}
      />

      {/* Installments */}
      <SectionBlock
        title="INSTALLMENTS"
        items={installments}
        accent="var(--amber)"
        renderItem={(inst) => (
          <BillRow
            key={inst.name}
            name={inst.name}
            amount={inst.amount}
            detail={`${inst.remaining} mo left`}
            accent="var(--amber)"
          />
        )}
      />
    </section>
  );
}

function SummaryChip({ label, value, color }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: '8px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
