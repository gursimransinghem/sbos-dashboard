import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../useData.js';

const basePath = import.meta.env.BASE_URL || '/';

const pColor = (p) => p === "P1" ? "bg-red-100 text-red-700 border-red-300" : p === "P2" ? "bg-yellow-100 text-yellow-700 border-yellow-300" : "bg-gray-100 text-gray-600 border-gray-300";
const sColor = (s) => s === "Filed" ? "bg-green-100 text-green-700" : s === "Unprocessed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
const statusDot = (s) => s === "Thriving" ? "bg-green-500" : s === "Maintaining" ? "bg-yellow-500" : "bg-gray-400";

function ProgressBar({ value, color = "bg-blue-500", h = "h-3" }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${h} overflow-hidden`}>
      <div className={`${color} ${h} rounded-full`} style={{ width: `${Math.min(value, 100)}%`, transition: "width 0.7s ease" }} />
    </div>
  );
}

function MiniDonut({ done, total, size = 80 }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  const r = 30, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={`${done} of ${total} completed`}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="40" cy="40" r={r} fill="none" stroke="#22c55e" strokeWidth="8"
        strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round"
        transform="rotate(-90 40 40)" style={{ transition: "stroke-dasharray 0.7s ease" }} />
      <text x="40" y="44" textAnchor="middle" fill="#374151" fontSize="16" fontWeight="bold">{done}/{total}</text>
    </svg>
  );
}

function LifeAreaRadar({ areas }) {
  const cx = 120, cy = 120, maxR = 95;
  const n = areas.length;

  const { points, path } = useMemo(() => {
    const pts = areas.map((a, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (a.score / 10) * maxR;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: a.icon, angle };
    });
    const p = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`).join(" ") + "Z";
    return { points: pts, path: p };
  }, [areas, n]);

  const gridLevels = [2, 4, 6, 8, 10];
  return (
    <svg width="240" height="240" viewBox="0 0 240 240" role="img" aria-label="Life areas radar chart">
      {gridLevels.map(lv => {
        const gr = (lv / 10) * maxR;
        const gPts = Array.from({ length: n }, (_, i) => {
          const a = (Math.PI * 2 * i) / n - Math.PI / 2;
          return `${cx + gr * Math.cos(a)},${cy + gr * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={lv} points={gPts} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
      })}
      {points.map((p, i) => (
        <line key={`axis-${areas[i].area}`} x1={cx} y1={cy} x2={cx + maxR * Math.cos(p.angle)} y2={cy + maxR * Math.sin(p.angle)} stroke="#e5e7eb" strokeWidth="1" />
      ))}
      <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="2" />
      {points.map((p, i) => {
        const lx = cx + (maxR + 18) * Math.cos(p.angle);
        const ly = cy + (maxR + 18) * Math.sin(p.angle);
        return <text key={`label-${areas[i].area}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="16">{p.label}</text>;
      })}
      {points.map((p, i) => <circle key={`dot-${areas[i].area}`} cx={p.x} cy={p.y} r="4" fill="#6366f1" />)}
    </svg>
  );
}

export function SBOSDashboard() {
  const { data: initialTasks, loading: tasksLoading } = useData(`${basePath}data/tasks.json`);
  const { data: INBOX } = useData(`${basePath}data/inbox.json`);
  const { data: GOALS } = useData(`${basePath}data/goals.json`);
  const { data: LIFE_AREAS } = useData(`${basePath}data/life-areas.json`);
  const { data: COMMANDS } = useData(`${basePath}data/commands.json`);

  const [tasks, setTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (initialTasks.length > 0 && tasks.length === 0) setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const activeTasks = tasks.filter(t => !t.done).sort((a, b) => a.priority < b.priority ? -1 : 1);
  const doneTasks = tasks.filter(t => t.done);
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const timeMap = { "5 min": 5, "15 min": 15, "30 min": 30, "1 hour": 60, "2+ hrs": 120 };
  const totalMin = activeTasks.reduce((s, t) => s + (timeMap[t.time] || 30), 0);
  const hrs = Math.floor(totalMin / 60), mins = totalMin % 60;
  const avgScore = LIFE_AREAS.length > 0 ? (LIFE_AREAS.reduce((s, a) => s + a.score, 0) / LIFE_AREAS.length).toFixed(1) : "0";

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading SBOS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-6xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧠 SBOS Command Center</h1>
          <p className="text-gray-500 mt-1">{dateStr} — {now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Morning Sweep Complete
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center hover-lift">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Calendar</div>
          <div className="text-xl font-bold text-green-600 mt-1">Clear</div>
          <div className="text-xs text-gray-500">No events today</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center hover-lift">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Tasks</div>
          <div className="text-xl font-bold text-red-600 mt-1">{activeTasks.length}</div>
          <div className="text-xs text-gray-500">{activeTasks.filter(t=>t.priority==="P1").length} urgent</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center hover-lift">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Inbox</div>
          <div className="text-xl font-bold text-orange-600 mt-1">{INBOX.filter(i=>i.status==="Unprocessed").length}</div>
          <div className="text-xs text-gray-500">unprocessed</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center hover-lift">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Est. Time</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">{hrs}h {mins}m</div>
          <div className="text-xs text-gray-500">today's load</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center hover-lift">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pay Day</div>
          <div className="text-xl font-bold text-green-600 mt-1">Mar 6</div>
          <div className="text-xs text-gray-500">3 days</div>
        </div>
      </div>

      {/* Priority Chart + Task Donut */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Task Distribution</div>
          <div className="space-y-3">
            {[
              { label: "P1 Urgent", count: activeTasks.filter(t=>t.priority==="P1").length, color: "bg-red-500", textColor: "text-red-600" },
              { label: "P2 Schedule", count: activeTasks.filter(t=>t.priority==="P2").length, color: "bg-yellow-400", textColor: "text-yellow-600" },
              { label: "Completed", count: doneTasks.length, color: "bg-green-500", textColor: "text-green-600" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-3">
                <span className={`text-xs w-24 text-right ${b.textColor} font-medium`}>{b.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: 28 }}>
                  <div className={`${b.color} h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-bold`}
                    style={{ width: `${Math.max((b.count / tasks.length) * 100, 8)}%`, transition: "width 0.7s ease" }}>{b.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Completion</div>
          <MiniDonut done={doneTasks.length} total={tasks.length} size={100} />
        </div>
      </div>

      {/* Active Tasks Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Active Tasks — Priority Board</h2>
          <span className="text-xs text-gray-500">{activeTasks.length} remaining</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-16">Pri</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-20">Time</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-24">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-28"></th>
              </tr>
            </thead>
            <tbody>
              {activeTasks.map((t) => (
                <React.Fragment key={t.id}>
                  <tr className="border-t border-gray-50 hover:bg-gray-50" style={{ transition: "background 0.2s" }}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} aria-label={`Complete: ${t.task}`} style={{ width: 18, height: 18, cursor: "pointer" }} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">{t.task}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{t.context}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full border ${pColor(t.priority)}`}>{t.priority}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.time}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{t.status}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedTask(expandedTask === t.id ? null : t.id)}
                        className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                        style={{ background: expandedTask === t.id ? "#4338ca" : "#4f46e5", cursor: "pointer", transition: "background 0.2s" }}>
                        {expandedTask === t.id ? "Hide Steps" : "Start This"}
                      </button>
                    </td>
                  </tr>
                  {expandedTask === t.id && (
                    <tr className="bg-indigo-50">
                      <td></td>
                      <td colSpan="5" className="px-4 py-3">
                        <div className="text-sm text-indigo-800 font-medium">Quick Start Steps:</div>
                        <div className="text-sm text-indigo-700 mt-1">{t.firstStep}</div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {doneTasks.map((t) => (
                <tr key={t.id} className="border-t border-gray-50" style={{ background: "rgba(34,197,94,0.05)" }}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} aria-label={`Undo: ${t.task}`} style={{ width: 18, height: 18, cursor: "pointer" }} />
                  </td>
                  <td className="px-4 py-3"><div className="font-medium text-sm text-gray-400" style={{ textDecoration: "line-through" }}>{t.task}</div></td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full border ${pColor(t.priority)}`}>{t.priority}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-400">{t.time}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Done</span></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goals + Life Areas Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Goals in Progress</h2>
          </div>
          <div className="p-5 space-y-5">
            {GOALS.map((g) => (
              <div key={g.goal} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{g.goal}</div>
                    <div className="text-xs text-gray-500">{g.area} — Target: {g.target}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${g.status === "On Track" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{g.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar value={g.progress} color={g.progress > 50 ? "bg-green-500" : g.progress > 25 ? "bg-blue-500" : "bg-indigo-500"} />
                  <span className="text-xs font-bold text-gray-600 w-10 text-right">{g.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Life Areas</h2>
            <span className="text-sm font-medium text-indigo-600">Avg: {avgScore}/10</span>
          </div>
          <div className="p-4 flex flex-col items-center">
            {LIFE_AREAS.length > 0 && <LifeAreaRadar areas={LIFE_AREAS} />}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-xs">
              {LIFE_AREAS.map((a) => (
                <div key={a.area} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusDot(a.status)}`}></div>
                  <span className="text-gray-600">{a.icon} {a.area}: <strong>{a.score}</strong>/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inbox + Financial Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Quick Capture Inbox</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">{INBOX.filter(i=>i.status==="Unprocessed").length} unprocessed</span>
          </div>
          <div>
            {INBOX.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50" style={{ transition: "background 0.2s" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-medium text-sm text-gray-900" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.capture}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.source} — {item.type}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ml-3 ${sColor(item.status)}`} style={{ whiteSpace: "nowrap" }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Financial Snapshot</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="rounded-xl p-4 border border-green-200" style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)" }}>
              <div className="text-xs font-medium text-green-600 uppercase">Debt Strategy</div>
              <div className="text-base font-bold text-green-800 mt-1">Avalanche Phase 1</div>
              <div className="mt-2"><ProgressBar value={15} color="bg-green-500" h="h-2" /></div>
              <div className="text-xs text-green-600 mt-1">15% — CC payoff in progress</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 border border-blue-200" style={{ background: "linear-gradient(135deg, #eff6ff, #eef2ff)" }}>
                <div className="text-xs font-medium text-blue-600 uppercase">401k</div>
                <div className="text-sm font-bold text-blue-800 mt-1">2 Transactions</div>
                <div className="text-xs text-amber-600 font-medium mt-1">Verify</div>
              </div>
              <div className="rounded-xl p-3 border border-purple-200" style={{ background: "linear-gradient(135deg, #faf5ff, #fdf2f8)" }}>
                <div className="text-xs font-medium text-purple-600 uppercase">Pay Day</div>
                <div className="text-sm font-bold text-purple-800 mt-1">March 6</div>
                <div className="text-xs text-purple-600 mt-1">Allocation ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commands */}
      <div className="rounded-xl p-5 text-white mb-6" style={{ background: "linear-gradient(135deg, #111827, #1f2937)" }}>
        <h2 className="text-lg font-semibold mb-3">SBOS Commands</h2>
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3">
          {COMMANDS.map((c) => (
            <div key={c.cmd} className="rounded-lg p-3 text-center hover-lift" style={{ background: "rgba(255,255,255,0.08)", cursor: "pointer" }}>
              <div className="font-mono font-bold text-lg" style={{ color: "#a5b4fc" }}>{c.cmd}</div>
              <div className="text-xs font-medium mt-0.5">{c.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-6 pb-4">SBOS v2.1 — Powered by Vite + React — {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
    </div>
  );
}
