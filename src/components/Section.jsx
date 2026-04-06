import { useState } from 'react';

export default function Section({ number, label, title, gradient, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Collapsible header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          transition: 'background 0.2s',
          userSelect: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div>
          {number && label && (
            <div style={{
              fontSize: '0.5rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              marginBottom: '2px',
              fontWeight: 600,
            }}>
              SEC {number} // {label}
            </div>
          )}
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 700,
            background: gradient || 'linear-gradient(135deg, var(--cyan), var(--green))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}>
            {title}
          </h2>
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}>
          ▾
        </div>
      </div>

      {/* Content */}
      {open && (
        <div style={{ padding: '16px 18px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
