import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Tax optimization data for Dr. Sim (2025 filing, due Apr 15, 2026)
const taxData = {
  filingStatus: 'Single',
  estimatedBracket: 32,
  estimatedAGI: 420000, // ~35k gross monthly
  standardDeduction: 14600, // 2025 standard deduction for single filers
  hsaMaxContribution: 4150, // 2025 HSA contribution limit for singles
  studentLoanInterestMax: 2500, // Annual deduction cap
  saltCap: 10000, // State and local tax deduction cap
};

const taxDocs = [
  { doc: 'W-2 (HCA Healthcare)', status: 'pending', priority: 'high', category: 'income' },
  { doc: '1099-DIV (Fidelity 401k)', status: 'pending', priority: 'high', category: 'investment' },
  { doc: '1099-B (Coinbase)', status: 'pending', priority: 'medium', category: 'crypto' },
  { doc: '1099-INT (Interest)', status: 'pending', priority: 'medium', category: 'interest' },
  { doc: '1098-E (Student Loan Interest)', status: 'pending', priority: 'high', category: 'deduction' },
  { doc: 'HSA Statements', status: 'pending', priority: 'medium', category: 'deduction' },
  { doc: 'Charitable Contributions', status: 'pending', priority: 'low', category: 'deduction' },
  { doc: 'Medical Expenses', status: 'pending', priority: 'low', category: 'deduction' },
];

const potentialDeductions = [
  {
    deduction: 'Student Loan Interest',
    maxAmount: 2500,
    estimatedValue: 2500,
    savings: 2500 * 0.32, // 32% bracket
    required: '1098-E form',
    priority: 'high'
  },
  {
    deduction: 'State/Local Taxes (SALT)',
    maxAmount: 10000,
    estimatedValue: 10000,
    savings: 10000 * 0.32,
    required: 'State tax returns, property tax',
    priority: 'high'
  },
  {
    deduction: 'Charitable Contributions',
    maxAmount: null,
    estimatedValue: 1200, // Estimated
    savings: 1200 * 0.32,
    required: 'Receipts, org verification',
    priority: 'medium'
  },
  {
    deduction: 'Medical Expenses',
    maxAmount: null,
    estimatedValue: 800, // Above 7.5% AGI threshold (~31,500)
    savings: 800 * 0.32,
    required: 'Medical receipts, insurance statements',
    priority: 'low'
  }
];

const hsaProjection = [
  { scenario: 'Current (No HSA)', contribution: 0, taxSavings: 0, description: 'Status quo' },
  { scenario: 'Max HSA Contribution', contribution: 4150, taxSavings: 1328, description: 'Full 2025 limit' },
];

// Calculate countdown to April 15, 2026
function getCountdown() {
  const deadline = new Date('2026-04-15T23:59:59');
  const now = new Date('2026-03-13'); // Current date from system
  const diff = deadline - now;

  if (diff <= 0) return { expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return { days, hours, expired: false };
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-accent)',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
      }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
        <div style={{ color: 'var(--text-primary)' }}>
          ${payload[0].value?.toLocaleString()}
          {data.savings && <div style={{ color: 'var(--green)', fontSize: '0.7rem', marginTop: '2px' }}>
            Tax Savings: ${data.savings?.toLocaleString()}
          </div>}
        </div>
      </div>
    );
  }
  return null;
}

function StatusIcon({ status, priority }) {
  if (status === 'complete') return <span style={{ color: 'var(--green)' }}>✓</span>;
  if (priority === 'high') return <span style={{ color: 'var(--red)' }}>🔴</span>;
  if (priority === 'medium') return <span style={{ color: 'var(--amber)' }}>🟡</span>;
  return <span style={{ color: 'var(--text-muted)' }}>⚪</span>;
}

export default function TaxOptimizer() {
  const countdown = getCountdown();
  const totalPotentialSavings = potentialDeductions.reduce((sum, ded) => sum + ded.savings, 0);
  const completedDocs = taxDocs.filter(doc => doc.status === 'complete').length;
  const completionRate = Math.round((completedDocs / taxDocs.length) * 100);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      '@media print': {
        background: 'white !important',
        color: 'black !important',
      }
    }}>

      {/* Countdown Timer */}
      <div style={{
        background: countdown.expired ? 'var(--red)' : (countdown.days <= 14 ? 'var(--amber)' : 'var(--cyan)'),
        border: `1px solid ${countdown.expired ? 'var(--red)' : (countdown.days <= 14 ? 'var(--amber)' : 'var(--cyan)')}`,
        borderRadius: '12px',
        padding: '16px 20px',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${countdown.expired ? 'var(--red)' : (countdown.days <= 14 ? 'var(--amber)' : 'var(--cyan)')}, rgba(255, 255, 255, 0.1))`
      }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: 'var(--text-primary)',
          marginBottom: '6px'
        }}>
          2025 TAX FILING DEADLINE
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}>
          {countdown.expired ? 'DEADLINE PASSED' : `${countdown.days} DAYS, ${countdown.hours} HOURS`}
        </div>
        <div style={{
          fontSize: '0.65rem',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)'
        }}>
          April 15, 2026 • TurboTax • Single Filer • Est. 32% Bracket
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Tax Document Checklist */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--cyan)',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}>
              DOCUMENT GATHERING
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: completionRate >= 80 ? 'var(--green)' : completionRate >= 50 ? 'var(--amber)' : 'var(--red)',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)'
            }}>
              {completionRate}% COMPLETE
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {taxDocs.map((doc, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: '6px',
                border: `1px solid ${doc.priority === 'high' ? 'var(--red)' : doc.priority === 'medium' ? 'var(--amber)' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusIcon status={doc.status} priority={doc.priority} />
                  <div>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      {doc.doc}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {doc.category}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '0.6rem',
                  color: doc.priority === 'high' ? 'var(--red)' : doc.priority === 'medium' ? 'var(--amber)' : 'var(--text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {doc.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Deductions */}
        <div>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--green)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            POTENTIAL DEDUCTIONS (32% BRACKET)
          </div>

          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={potentialDeductions} margin={{ left: 0, right: 0 }}>
                <XAxis
                  dataKey="deduction"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="savings"
                  fill="var(--green)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, var(--green), rgba(16, 185, 129, 0.1))',
            borderRadius: '6px',
            border: '1px solid var(--green)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)'
            }}>
              TOTAL POTENTIAL SAVINGS: ${totalPotentialSavings.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* HSA Strategy Callout */}
      <div style={{
        background: 'linear-gradient(135deg, var(--purple), rgba(167, 139, 250, 0.1))',
        border: '1px solid var(--purple)',
        borderRadius: '12px',
        padding: '16px 20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            🏥 HSA OPTIMIZATION OPPORTUNITY
          </div>
          <div style={{
            fontSize: '0.65rem',
            color: 'var(--purple)',
            fontWeight: 600
          }}>
            NOT CURRENTLY CONTRIBUTING
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {hsaProjection.map((scenario, idx) => (
            <div key={idx} style={{
              padding: '12px 14px',
              background: idx === 0 ? 'var(--bg-surface)' : 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: `1px solid ${idx === 0 ? 'var(--border)' : 'var(--green)'}`,
            }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px'
              }}>
                {scenario.scenario}
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}>
                {scenario.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--cyan)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  ${scenario.contribution.toLocaleString()}/yr
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: idx === 0 ? 'var(--text-muted)' : 'var(--green)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600
                }}>
                  ${scenario.taxSavings.toLocaleString()} saved
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '12px',
          fontSize: '0.65rem',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          HSA contributions are triple tax-advantaged: deductible now, growth tax-free, qualified withdrawals tax-free
        </div>
      </div>

      {/* Filing Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        '@media print': {
          gridTemplateColumns: 'repeat(2, 1fr)',
        }
      }}>
        <div style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            FILING STATUS
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {taxData.filingStatus}
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            EST. BRACKET
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cyan)' }}>
            {taxData.estimatedBracket}%
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            EST. AGI
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--amber)',
            fontFamily: 'var(--font-mono)'
          }}>
            ${(taxData.estimatedAGI / 1000).toFixed(0)}k
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            STANDARD DED.
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--green)',
            fontFamily: 'var(--font-mono)'
          }}>
            ${(taxData.standardDeduction / 1000).toFixed(1)}k
          </div>
        </div>
      </div>
    </div>
  );
}