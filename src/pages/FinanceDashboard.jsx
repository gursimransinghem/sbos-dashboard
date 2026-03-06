import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../useData.js';

const basePath = import.meta.env.BASE_URL || '/';

function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const end = value;
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(end * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function ProgressBar({ pct, color = "#10b981", height = 10 }) {
  return (
    <div className="progress-track" style={{ height }}>
      <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)` }} />
    </div>
  );
}

function MiniDonut({ pct, size = 60, color = "#10b981", label }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, offset = c * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} role="img" aria-label={`${pct}% ${label || ''}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="12" fontWeight="700">{pct}%</text>
      </svg>
      {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
    </div>
  );
}

export function FinanceDashboard() {
  const { data: DEBTS, loading } = useData(`${basePath}data/debts.json`);
  const { data: BILLS } = useData(`${basePath}data/bills.json`);
  const { data: SUBSCRIPTIONS } = useData(`${basePath}data/subscriptions.json`);
  const { data: GOALS } = useData(`${basePath}data/finance-goals.json`);
  const { data: BUDGET_DATA } = useData(`${basePath}data/budget.json`, {});
  const { data: MONTHS_DATA } = useData(`${basePath}data/months-history.json`);

  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const computed = useMemo(() => {
    if (!DEBTS.length || !BILLS.length || !SUBSCRIPTIONS.length || !BUDGET_DATA.income) return null;

    const TOTAL_DEBT = DEBTS.reduce((s, d) => s + d.balance, 0);
    const TOTAL_ORIGINAL = DEBTS.reduce((s, d) => s + d.original, 0);
    const TOTAL_MIN = DEBTS.reduce((s, d) => s + d.minPay, 0);
    const DEBT_PAID = TOTAL_ORIGINAL - TOTAL_DEBT;
    const DEBT_PCT = Math.round((DEBT_PAID / TOTAL_ORIGINAL) * 100);
    const TOTAL_SUBS = SUBSCRIPTIONS.reduce((s, sub) => s + sub.cost, 0);
    const ESSENTIAL_SUBS = SUBSCRIPTIONS.filter(s => s.essential).reduce((s, sub) => s + sub.cost, 0);
    const TOTAL_BILLS = BILLS.reduce((s, b) => s + b.amount, 0);

    const BUDGET = {
      income: BUDGET_DATA.income,
      fixed: TOTAL_BILLS,
      subscriptions: TOTAL_SUBS,
      debtAttack: BUDGET_DATA.debtAttack,
      savings: BUDGET_DATA.savings,
      lifestyle: BUDGET_DATA.lifestyle,
    };
    BUDGET.variable = BUDGET.income - BUDGET.fixed - BUDGET.subscriptions - BUDGET.debtAttack - BUDGET.savings - BUDGET.lifestyle;

    return { TOTAL_DEBT, TOTAL_ORIGINAL, TOTAL_MIN, DEBT_PAID, DEBT_PCT, TOTAL_SUBS, ESSENTIAL_SUBS, BUDGET };
  }, [DEBTS, BILLS, SUBSCRIPTIONS, BUDGET_DATA]);

  if (loading || !computed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Loading Finance Dashboard...
      </div>
    );
  }

  const { TOTAL_DEBT, TOTAL_ORIGINAL, TOTAL_MIN, DEBT_PAID, DEBT_PCT, TOTAL_SUBS, ESSENTIAL_SUBS, BUDGET } = computed;

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "debt", label: "Debt Attack", icon: "💣" },
    { id: "budget", label: "Budget", icon: "💰" },
    { id: "bills", label: "Bills & Subs", icon: "📅" },
    { id: "goals", label: "Goals", icon: "🎯" },
  ];

  function DebtThermometer() {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-green-400 font-bold">{DEBT_PCT}% PAID</span>
        <div className="debt-thermometer" style={{ height: 180 }}>
          <div className="debt-fill" style={{ height: `${DEBT_PCT}%`, background: "linear-gradient(to top, #10b981, #34d399)" }} />
        </div>
        <span className="text-xs text-gray-500">${TOTAL_ORIGINAL.toLocaleString()}</span>
      </div>
    );
  }

  function DebtWaterfall() {
    const maxDebt = Math.max(...MONTHS_DATA.map(m => m.debt));
    return (
      <div className="flex items-end gap-2" style={{ height: 140 }}>
        {MONTHS_DATA.map((m, i) => {
          const h = (m.debt / maxDebt) * 120;
          const isLast = i === MONTHS_DATA.length - 1;
          return (
            <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs text-gray-400">${(m.debt/1000).toFixed(0)}k</span>
              <div style={{ height: h, background: isLast ? "linear-gradient(to top, #ef4444, #f87171)" : "linear-gradient(to top, rgba(239,68,68,.3), rgba(239,68,68,.5))", borderRadius: 4, width: "100%" }} />
              <span className={`text-xs ${isLast ? "text-white font-bold" : "text-gray-500"}`}>{m.month}</span>
            </div>
          );
        })}
      </div>
    );
  }

  function BudgetSankey() {
    const items = [
      { label: "Fixed Bills", amount: BUDGET.fixed, color: "#ef4444", pct: (BUDGET.fixed / BUDGET.income * 100).toFixed(0) },
      { label: "Debt Attack", amount: BUDGET.debtAttack, color: "#f59e0b", pct: (BUDGET.debtAttack / BUDGET.income * 100).toFixed(0) },
      { label: "Lifestyle", amount: BUDGET.lifestyle, color: "#8b5cf6", pct: (BUDGET.lifestyle / BUDGET.income * 100).toFixed(0) },
      { label: "Subscriptions", amount: BUDGET.subscriptions, color: "#3b82f6", pct: (BUDGET.subscriptions / BUDGET.income * 100).toFixed(0) },
      { label: "Savings", amount: BUDGET.savings, color: "#10b981", pct: (BUDGET.savings / BUDGET.income * 100).toFixed(0) },
    ];
    const surplus = BUDGET.income - items.reduce((s, i) => s + i.amount, 0);
    if (surplus > 0) items.push({ label: "Surplus", amount: surplus, color: "#06b6d4", pct: (surplus / BUDGET.income * 100).toFixed(0) });

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Monthly Income</span>
          <span className="text-lg font-bold text-green-400">${BUDGET.income.toLocaleString()}</span>
        </div>
        <div className="flex rounded-lg overflow-hidden h-8">
          {items.map((item) => (
            <div key={item.label} style={{ width: `${item.pct}%`, background: item.color }} className="flex items-center justify-center" title={`${item.label}: $${item.amount.toLocaleString()}`}>
              {parseFloat(item.pct) > 8 && <span className="text-xs font-bold text-white">{item.pct}%</span>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span className="text-xs text-gray-400">{item.label}</span>
              <span className="text-xs font-semibold ml-auto">${item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function PhaseRoadmap() {
    const phases = [
      { num: 1, name: "CC Debt Free", target: "$38,638 → $0", deadline: "Dec 2026", status: "active", icon: "💣" },
      { num: 2, name: "Emergency Fund", target: "$0 → $10,000", deadline: "Jun 2027", status: "future", icon: "🛡" },
      { num: 3, name: "Loan Elimination", target: "Student + Auto", deadline: "2028", status: "future", icon: "🔓" },
      { num: 4, name: "Investing", target: "Roth IRA + Brokerage", deadline: "2028+", status: "future", icon: "📈" },
    ];
    return (
      <div className="flex gap-3">
        {phases.map((p) => (
          <div key={p.num} className={`flex-1 rounded-xl p-3 text-center ${p.status === "active" ? "phase-active" : "phase-future"}`}>
            <div className="text-2xl mb-1">{p.icon}</div>
            <div className="text-xs font-bold text-gray-300">Phase {p.num}</div>
            <div className="text-sm font-semibold mt-1">{p.name}</div>
            <div className="text-xs text-gray-500 mt-1">{p.target}</div>
            <div className="text-xs text-gray-600 mt-1">{p.deadline}</div>
          </div>
        ))}
      </div>
    );
  }

  function BillCalendar() {
    const today = new Date().getDate();
    const allBills = [...BILLS, ...DEBTS.map(d => ({ name: d.name + " (CC)", amount: d.minPay, dueDay: d.dueDay, category: "Credit Card", autopay: true, status: "current" }))];
    const sorted = allBills.sort((a, b) => a.dueDay - b.dueDay);
    const upcoming = sorted.filter(b => b.dueDay >= today).slice(0, 6);
    if (upcoming.length < 6) upcoming.push(...sorted.filter(b => b.dueDay < today).slice(0, 6 - upcoming.length));

    return (
      <div className="space-y-1">
        {upcoming.map((b, i) => {
          const daysUntil = b.dueDay >= today ? b.dueDay - today : 30 - today + b.dueDay;
          const urgent = daysUntil <= 3;
          return (
            <div key={`${b.name}-${b.dueDay}`} className="bill-row flex items-center justify-between px-3 py-2 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${urgent ? "bg-red-900 text-red-300" : "bg-gray-800 text-gray-300"}`}>{b.dueDay}</div>
                <div>
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.autopay ? "Autopay" : "Manual"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">${b.amount.toLocaleString()}</div>
                <div className={`text-xs ${urgent ? "text-red-400" : "text-gray-500"}`}>{daysUntil === 0 ? "TODAY" : `${daysUntil}d`}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function SubBreakdown() {
    const byCat = {};
    SUBSCRIPTIONS.forEach(s => { byCat[s.category] = (byCat[s.category] || 0) + s.cost; });
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const colors = { Software: "#3b82f6", Music: "#8b5cf6", Streaming: "#ec4899", Cloud: "#06b6d4", Health: "#10b981" };
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Monthly Total</span>
          <span className="font-bold text-lg">${TOTAL_SUBS}/mo</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-400">Essential: ${ESSENTIAL_SUBS}/mo</span>
          <span className="text-yellow-400">Non-essential: ${TOTAL_SUBS - ESSENTIAL_SUBS}/mo</span>
        </div>
        {cats.map(([cat, total]) => (
          <div key={cat}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{cat}</span>
              <span>${total}/mo</span>
            </div>
            <ProgressBar pct={total / TOTAL_SUBS * 100} color={colors[cat] || "#6b7280"} height={6} />
          </div>
        ))}
      </div>
    );
  }

  const currentMonth = time.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="fade-up flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #10b981, #3b82f6)" }}>
              SBOS Finance Command Center
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Phase 1 — Debt Avalanche Active</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono text-gray-300">{time.toLocaleTimeString()}</div>
          <div className="text-xs text-gray-500">{time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-white bg-opacity-10 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="card p-4 glow-red fade-up">
              <div className="text-xs text-gray-500 mb-1">Total CC Debt</div>
              <div className="text-2xl font-bold text-red-400"><AnimatedNumber value={TOTAL_DEBT} prefix="$" /></div>
              <div className="text-xs text-green-400 mt-1">{DEBT_PCT}% paid off</div>
            </div>
            <div className="card p-4 glow-green fade-up" style={{ animationDelay: ".15s" }}>
              <div className="text-xs text-gray-500 mb-1">Monthly Income</div>
              <div className="text-2xl font-bold text-green-400"><AnimatedNumber value={BUDGET.income} prefix="$" /></div>
              <div className="text-xs text-gray-400 mt-1">Take-home</div>
            </div>
            <div className="card p-4 glow-blue fade-up" style={{ animationDelay: ".2s" }}>
              <div className="text-xs text-gray-500 mb-1">Debt Attack</div>
              <div className="text-2xl font-bold text-blue-400"><AnimatedNumber value={BUDGET.debtAttack} prefix="$" /><span className="text-sm">/mo</span></div>
              <div className="text-xs text-gray-400 mt-1">{Math.round(BUDGET.debtAttack / BUDGET.income * 100)}% of income</div>
            </div>
            <div className="card p-4 glow-purple fade-up" style={{ animationDelay: ".25s" }}>
              <div className="text-xs text-gray-500 mb-1">Freedom Date</div>
              <div className="text-2xl font-bold text-purple-400">Dec '26</div>
              <div className="text-xs text-yellow-400 mt-1">~{Math.ceil(TOTAL_DEBT / BUDGET.debtAttack)} months left</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 fade-up" style={{ animationDelay: ".3s" }}>
              <h3 className="text-sm font-semibold mb-3 text-gray-300">Debt Paydown Trend</h3>
              <DebtWaterfall />
            </div>
            <div className="card p-4 fade-up" style={{ animationDelay: ".35s" }}>
              <h3 className="text-sm font-semibold mb-3 text-gray-300">4-Phase Financial Plan</h3>
              <PhaseRoadmap />
            </div>
          </div>
          <div className="card p-4 fade-up" style={{ animationDelay: ".4s" }}>
            <h3 className="text-sm font-semibold mb-3 text-gray-300">Money Flow — {currentMonth}</h3>
            <BudgetSankey />
          </div>
        </div>
      )}

      {/* DEBT */}
      {activeTab === "debt" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 card p-4 fade-up">
              <h3 className="text-sm font-semibold mb-3 text-gray-300">Avalanche Order (Highest APR First)</h3>
              <div className="space-y-3">
                {[...DEBTS].sort((a, b) => b.apr - a.apr).map((d, i) => {
                  const pct = Math.round(((d.original - d.balance) / d.original) * 100);
                  const util = Math.round((d.balance / d.limit) * 100);
                  return (
                    <div key={d.name} className="fade-up" style={{ animationDelay: `${i * .05}s` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${d.status === "active" ? "bg-red-900 text-red-300" : d.status === "queue" ? "bg-yellow-900 text-yellow-300" : "bg-gray-800 text-gray-400"}`}>{d.order}</span>
                          <span className="text-sm font-medium">{d.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-900 bg-opacity-50 text-red-300">{d.apr}% APR</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-red-400">${d.balance.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 ml-2">/ ${d.limit.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1"><ProgressBar pct={pct} color={pct > 50 ? "#10b981" : pct > 25 ? "#f59e0b" : "#ef4444"} height={6} /></div>
                        <span className="text-xs text-gray-500 w-16 text-right">{pct}% paid</span>
                        <span className={`text-xs w-16 text-right ${util > 50 ? "text-red-400" : "text-green-400"}`}>{util}% util</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card p-4 fade-up flex flex-col items-center justify-center" style={{ animationDelay: ".1s" }}>
              <h3 className="text-sm font-semibold mb-4 text-gray-300">Payoff Progress</h3>
              <DebtThermometer />
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">Total Paid</div>
                <div className="text-lg font-bold text-green-400">${DEBT_PAID.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-2">Remaining</div>
                <div className="text-lg font-bold text-red-400">${TOTAL_DEBT.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="card p-3 text-center fade-up"><div className="text-xs text-gray-500">Active Cards</div><div className="text-xl font-bold">{DEBTS.length}</div></div>
            <div className="card p-3 text-center fade-up"><div className="text-xs text-gray-500">Min Payments</div><div className="text-xl font-bold text-yellow-400">${TOTAL_MIN}/mo</div></div>
            <div className="card p-3 text-center fade-up"><div className="text-xs text-gray-500">Avg APR</div><div className="text-xl font-bold text-red-400">{(DEBTS.reduce((s,d) => s + d.apr, 0) / DEBTS.length).toFixed(1)}%</div></div>
            <div className="card p-3 text-center fade-up"><div className="text-xs text-gray-500">Avg Utilization</div><div className="text-xl font-bold text-orange-400">{Math.round(DEBTS.reduce((s,d) => s + d.balance/d.limit, 0) / DEBTS.length * 100)}%</div></div>
          </div>
        </div>
      )}

      {/* BUDGET */}
      {activeTab === "budget" && (
        <div className="space-y-4">
          <div className="card p-4 fade-up">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">{currentMonth} Budget Allocation</h3>
            <BudgetSankey />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 fade-up text-center">
              <MiniDonut pct={Math.round(BUDGET.debtAttack / BUDGET.income * 100)} color="#f59e0b" size={80} label="Debt Attack" />
              <div className="text-lg font-bold mt-2">${BUDGET.debtAttack.toLocaleString()}</div>
            </div>
            <div className="card p-4 fade-up text-center">
              <MiniDonut pct={Math.round(BUDGET.fixed / BUDGET.income * 100)} color="#ef4444" size={80} label="Fixed Bills" />
              <div className="text-lg font-bold mt-2">${BUDGET.fixed.toLocaleString()}</div>
            </div>
            <div className="card p-4 fade-up text-center">
              <MiniDonut pct={Math.round(BUDGET.lifestyle / BUDGET.income * 100)} color="#8b5cf6" size={80} label="Lifestyle" />
              <div className="text-lg font-bold mt-2">${BUDGET.lifestyle.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* BILLS */}
      {activeTab === "bills" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 fade-up">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">Upcoming Bills (Due Date Calendar)</h3>
            <BillCalendar />
          </div>
          <div className="card p-4 fade-up" style={{ animationDelay: ".1s" }}>
            <h3 className="text-sm font-semibold mb-3 text-gray-300">Subscription Breakdown</h3>
            <SubBreakdown />
            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="text-xs text-gray-500 mb-2">All Subscriptions</div>
              {SUBSCRIPTIONS.map((s) => (
                <div key={s.name} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.essential ? "bg-green-400" : "bg-yellow-400"}`} />
                    <span className="text-xs">{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold">${s.cost}/mo</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GOALS */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="card p-4 fade-up">
            <h3 className="text-sm font-semibold mb-4 text-gray-300">4-Phase Financial Roadmap</h3>
            <PhaseRoadmap />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {GOALS.map((g, i) => {
              const pct = Math.round((g.current / g.target) * 100);
              const colors = { Critical: "#ef4444", High: "#f59e0b", Medium: "#3b82f6", Low: "#6b7280" };
              return (
                <div key={g.name} className="card p-4 fade-up" style={{ animationDelay: `${i * .1}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{g.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: colors[g.priority] + "22", color: colors[g.priority] }}>{g.priority}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>${g.current.toLocaleString()} / ${g.target.toLocaleString()}</span>
                    <span>{g.deadline}</span>
                  </div>
                  <ProgressBar pct={pct} color={colors[g.priority]} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Phase {g.phase} — {g.category}</span>
                    <span className="text-xs font-bold" style={{ color: colors[g.priority] }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-center mt-6 text-xs text-gray-600">
        SBOS Finance Command Center v2.1 — Data loaded from JSON • Update data/ files to change values
      </div>
    </div>
  );
}
