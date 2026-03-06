import React, { useState, useEffect } from 'react';

export function MenuBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const DEBT_TOTAL = 38638;
  const DEBT_REMAINING = 38640;
  const MONTHLY_INCOME = 30000;
  const DEBT_ATTACK = 8000;
  const FREEDOM_DATE = "Dec 2026";
  const TASKS = [
    { name: "Renew Florida Medical License", priority: "P1", time: "1 hr" },
    { name: "Handle Apple Trade-In", priority: "P1", time: "15 min" },
    { name: "Review Rocket Money Feb Report", priority: "P2", time: "15 min" },
  ];
  const INBOX_COUNT = 3;
  const ACTIVE_TASKS = 6;

  const paid = DEBT_TOTAL - DEBT_REMAINING;
  const pct = Math.max(0, Math.round((paid / DEBT_TOTAL) * 100));
  const monthsLeft = Math.ceil(DEBT_REMAINING / DEBT_ATTACK);
  const greeting = time.getHours() < 12 ? "Good morning" : time.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="header">
        <div className="logo">⌘ SBOS</div>
        <div className="clock">{time.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · {time.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
      </div>

      <div className="debt-hero">
        <div className="debt-label">CC Debt Remaining</div>
        <div className="debt-amount">${DEBT_REMAINING.toLocaleString()}</div>
        <div className="debt-row">
          <div className="debt-paid">${paid.toLocaleString()} paid</div>
          <div className="progress-bg"><div className="progress-fill" style={{width:`${pct}%`}}></div></div>
          <div className="debt-pct">{pct}%</div>
        </div>
        <div className="freedom">
          <span className="freedom-icon">🎯</span>
          <span className="freedom-text">Freedom: {FREEDOM_DATE}</span>
          <span className="freedom-date">~{monthsLeft} months</span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">🔴 Top Priority</div>
        {TASKS.map((t) => (
          <div key={t.name} className="task-item">
            <span className={`task-priority ${t.priority.toLowerCase()}`}>{t.priority}</span>
            <div>
              <div className="task-name">{t.name}</div>
              <div className="task-time">{t.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-row">
        <div className="stat"><div className="stat-value blue">{ACTIVE_TASKS}</div><div className="stat-label">Active Tasks</div></div>
        <div className="stat"><div className="stat-value purple">{INBOX_COUNT}</div><div className="stat-label">Inbox</div></div>
        <div className="stat"><div className="stat-value green">${(DEBT_ATTACK/1000).toFixed(0)}K</div><div className="stat-label">Debt/Mo</div></div>
        <div className="stat"><div className="stat-value red">${(MONTHLY_INCOME/1000).toFixed(0)}K</div><div className="stat-label">Income</div></div>
      </div>

      <div className="links">
        <a className="link-btn" href="https://gursimransinghem.github.io/sbos-dashboard/" target="_blank" rel="noopener noreferrer">📊 Dashboard</a>
        <a className="link-btn" href="https://gursimransinghem.github.io/sbos-dashboard/finance-dashboard.html" target="_blank" rel="noopener noreferrer">💰 Finance</a>
        <a className="link-btn" href="https://gursimransinghem.github.io/sbos-dashboard/sbos-launchpad.html" target="_blank" rel="noopener noreferrer">⌘ Launch</a>
      </div>
    </>
  );
}
