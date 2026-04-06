import DebtAvalanche from './components/DebtAvalanche';
import SpendingMonitor from './components/SpendingMonitor';
import BudgetBuilder from './components/BudgetBuilder';
import TaxOptimizer from './components/TaxOptimizer';
import BillsCalendar from './components/BillsCalendar';
import WealthDiagnostic from './components/WealthDiagnostic';
import CashFlowAnalysis from './components/CashFlowAnalysis';
import SpendingTrends from './components/SpendingTrends';
import Section from './components/Section';

export default function App() {
  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '24px 20px 48px',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-accent)',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: 'var(--cyan)',
            marginBottom: '4px',
          }}>
            SBOS // COMMAND CENTER
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}>
            Financial Operations
          </h1>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 8px var(--green)',
            animation: 'blink 3s infinite',
          }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              AVALANCHE PHASE: CC ELIMINATION
            </div>
          </div>
        </div>
      </header>

      {/* Grid layout — 2 columns on desktop, 1 on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        alignItems: 'start',
      }}>
        {/* Col 1 — Debt & Spending */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Section number="01" label="DEBT ELIMINATION" title="DEBT AVALANCHE" gradient="linear-gradient(135deg, var(--red), var(--amber))">
            <DebtAvalanche />
          </Section>
          <Section number="03" label="BUDGET ENFORCEMENT" title="SPENDING MONITOR" gradient="linear-gradient(135deg, var(--amber), var(--green))">
            <SpendingMonitor />
          </Section>
          <Section number="05" label="OBLIGATIONS" title="BILLS CALENDAR" gradient="linear-gradient(135deg, var(--cyan), var(--purple))">
            <BillsCalendar />
          </Section>
          <Section number="07" label="RAMSEY METHOD" title="BUDGET BUILDER" gradient="linear-gradient(135deg, var(--purple), var(--cyan))">
            <BudgetBuilder />
          </Section>
        </div>

        {/* Col 2 — Analytics & Wealth */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Section number="02" label="WEALTH DIAGNOSTIC" title="WEALTH DIAGNOSTIC" gradient="linear-gradient(135deg, var(--green), var(--cyan))">
            <WealthDiagnostic />
          </Section>
          <Section number="04" label="CASH FLOW" title="CASH FLOW ANALYSIS" gradient="linear-gradient(135deg, var(--cyan), var(--green))">
            <CashFlowAnalysis />
          </Section>
          <Section number="06" label="ANALYTICS" title="SPENDING TRENDS" gradient="linear-gradient(135deg, var(--purple), var(--amber))">
            <SpendingTrends />
          </Section>
          <Section number="08" label="TAX OPTIMIZATION" title="2025 TAX FILING" gradient="linear-gradient(135deg, var(--amber), var(--red))">
            <TaxOptimizer />
          </Section>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '40px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.6rem',
        color: 'var(--text-muted)',
      }}>
        <span>SBOS v2.0 — Sim&apos;s Business Operating System</span>
        <span>Data as of Mar 13, 2026 · Monarch CSV (8,720 txns)</span>
      </footer>

      <style>{`
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
