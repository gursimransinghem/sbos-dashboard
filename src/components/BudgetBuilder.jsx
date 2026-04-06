import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line } from 'recharts';
import { income, billsSummary, totalCCDebt } from '../data';

// Zero-based budget data driven by real data
const budgetData = {
  netIncome: income.netMonthly,
  fixedBills: billsSummary.fixed,
  subscriptions: billsSummary.subs,
  installments: billsSummary.installments,
  plannedDebtAttack: 10000, // Target
  actualDebtAttack: 2000, // Current reality
  debtGap: 8000, // The critical shortfall
};

const totalObligated = budgetData.fixedBills + budgetData.subscriptions + budgetData.installments;
const surplus = budgetData.netIncome - totalObligated - budgetData.actualDebtAttack - budgetData.debtGap;

const allocationData = [
  { category: 'Fixed Bills', amount: budgetData.fixedBills, color: 'var(--red)', type: 'necessity' },
  { category: 'Subscriptions', amount: budgetData.subscriptions, color: 'var(--amber)', type: 'variable' },
  { category: 'Installments', amount: budgetData.installments, color: 'var(--purple)', type: 'necessity' },
  { category: 'Debt Attack (Actual)', amount: 2000, color: 'var(--cyan)', type: 'debt' },
  { category: 'Debt Gap', amount: 8000, color: 'rgba(255, 255, 255, 0.1)', type: 'missing' },
  { category: 'Surplus/Buffer', amount: Math.max(0, surplus), color: 'var(--green)', type: 'surplus' },
];

const spendingCaps = [
  { category: 'Food Delivery', cap: 400, color: 'var(--amber)' },
  { category: 'Shopping', cap: 1500, color: 'var(--purple)' },
  { category: 'Dining Out', cap: 500, color: 'var(--cyan)' },
  { category: 'Entertainment', cap: 200, color: 'var(--green)' },
  { category: 'PlayStation', cap: 0, color: 'var(--red)' },
];

const subscriptionWaste = [
  { service: 'YouTube TV + fuboTV', overlap: 'Sports overlap', waste: 108, action: 'Pick one' },
  { service: 'Paramount+ + Peacock', usage: 'Low usage', waste: 22, action: 'Cancel both?' },
];

// Build debt projection dynamically from real CC total
const debtProjection = [];
for (let i = 0; i < 6; i++) {
  const monthNames = ['Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26'];
  debtProjection.push({
    month: monthNames[i],
    actual: 2000,
    planned: 10000,
    balance: Math.max(0, totalCCDebt - (i * 2000)),
  });
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
          {data.type && <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
            ({data.type})
          </span>}
        </div>
      </div>
    );
  }
  return null;
}

export default function BudgetBuilder() {
  const debtGapPercentage = ((budgetData.debtGap / budgetData.netIncome) * 100).toFixed(1);
  const allocationEfficiency = ((budgetData.actualDebtAttack / budgetData.plannedDebtAttack) * 100).toFixed(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Critical Alert: Debt Gap */}
      <div style={{
        background: 'linear-gradient(135deg, var(--red), rgba(239, 68, 68, 0.1))',
        border: '1px solid var(--red)',
        borderRadius: '8px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ fontSize: '1.2rem' }}>🚨</div>
        <div>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '2px'
          }}>
            DEBT ATTACK SHORTFALL: ${budgetData.debtGap.toLocaleString()}/mo ({debtGapPercentage}% of income)
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            Allocation efficiency: {allocationEfficiency}% • Target: $10k/mo • Current: ${budgetData.actualDebtAttack.toLocaleString()}/mo
          </div>
        </div>
      </div>

      {/* Zero-Based Budget Allocation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Allocation Breakdown */}
        <div>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--cyan)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            ZERO-BASED ALLOCATION
          </div>

          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationData} layout="horizontal" margin={{ left: 0, right: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="var(--cyan)" radius={[0, 4, 4, 0]}>
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Caps Enforcement */}
        <div>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--amber)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            SPENDING CAP ENFORCEMENT
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {spendingCaps.map((cap, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: '6px',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  {cap.category}
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: cap.cap === 0 ? 'var(--red)' : cap.color,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {cap.cap === 0 ? 'BLOCKED' : `$${cap.cap}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Waste Analysis */}
      <div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--purple)',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          SUBSCRIPTION WASTE ANALYSIS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {subscriptionWaste.map((waste, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              background: 'var(--bg-elevated)',
              borderRadius: '8px',
              border: '1px solid var(--amber)',
            }}>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '2px'
                }}>
                  {waste.service}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  {waste.overlap || waste.usage}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--amber)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  -${waste.waste}/mo
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--cyan)' }}>
                  {waste.action}
                </div>
              </div>
            </div>
          ))}

          {/* Total Potential Savings */}
          <div style={{
            marginTop: '8px',
            padding: '10px 14px',
            background: 'linear-gradient(135deg, var(--green), rgba(16, 185, 129, 0.1))',
            borderRadius: '8px',
            border: '1px solid var(--green)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              POTENTIAL MONTHLY SAVINGS: $130
            </div>
          </div>
        </div>
      </div>

      {/* Debt Payoff Projection */}
      <div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--green)',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          DEBT PAYOFF PROJECTION: ACTUAL vs PLANNED
        </div>

        <div style={{ height: '160px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={debtProjection} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--red)"
                strokeWidth={2}
                dot={{ fill: 'var(--red)', strokeWidth: 0, r: 4 }}
                name="Actual Pace"
              />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="var(--cyan)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'var(--cyan)', strokeWidth: 0, r: 4 }}
                name="Planned Pace"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          fontSize: '0.65rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginTop: '8px'
        }}>
          Current pace: CC debt eliminated by <span style={{color: 'var(--red)'}}>Mar 2028</span> •
          Target pace: <span style={{color: 'var(--cyan)'}}>Jun 2026</span>
        </div>
      </div>
    </div>
  );
}