import React, { useState } from 'react';
import { useData } from '../useData.js';

const basePath = import.meta.env.BASE_URL || '/';

const CAT_COLORS = { Financial: "#10b981", Work: "#3b82f6", Personal: "#f59e0b", System: "#6b7280", Travel: "#8b5cf6" };
const CAT_ICONS = { Financial: "💰", Work: "💼", Personal: "🧠", System: "⚙️", Travel: "✈️" };

export function DecisionTimeline() {
  const { data: DECISIONS, loading } = useData(`${basePath}data/decisions.json`);
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Object.keys(CAT_COLORS)];
  const filtered = filter === "All" ? DECISIONS : DECISIONS.filter(d => d.category === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-8 fade-up">
        <div className="text-3xl mb-2">📝</div>
        <h1 className="text-2xl font-bold">Decision Timeline</h1>
        <p className="text-gray-500 text-sm mt-1">Every decision shapes your trajectory — track them, learn from them</p>
      </div>

      <div className="flex gap-2 justify-center mb-8 fade-up" style={{ animationDelay: ".1s" }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`filter-btn ${filter === c ? "active" : ""}`}
            style={filter === c ? { background: (CAT_COLORS[c] || "rgba(255,255,255,.15)") + "22", borderColor: CAT_COLORS[c] || "rgba(255,255,255,.2)" } : {}}>
            {CAT_ICONS[c] || "🔍"} {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3 mb-8 fade-up" style={{ animationDelay: ".15s" }}>
        {Object.entries(CAT_COLORS).map(([cat, color]) => {
          const count = DECISIONS.filter(d => d.category === cat).length;
          return (
            <div key={cat} className="text-center p-3 rounded-xl" style={{ background: color + "11", border: `1px solid ${color}33` }}>
              <div className="text-lg">{CAT_ICONS[cat]}</div>
              <div className="text-xl font-bold" style={{ color }}>{count}</div>
              <div className="text-xs text-gray-500">{cat}</div>
            </div>
          );
        })}
      </div>

      <div className="relative" style={{ minHeight: sorted.length * 180 }}>
        <div className="timeline-line" />
        {sorted.map((d, i) => {
          const isLeft = i % 2 === 0;
          const color = CAT_COLORS[d.category] || "#6b7280";
          const dateStr = new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          return (
            <div key={d.id} className="relative fade-up" style={{ animationDelay: `${.2 + i * .08}s`, marginBottom: 32 }}>
              <div className="node" style={{ borderColor: color, top: 24 }} />
              <div className="absolute text-xs font-mono px-2 py-1 rounded-full" style={{
                left: "50%", transform: "translateX(-50%)", top: -8,
                background: color + "22", color, border: `1px solid ${color}44`
              }}>{dateStr}</div>
              <div className={`decision-card p-4 ${isLeft ? "mr-auto" : "ml-auto"}`} style={{ marginTop: 16, [isLeft ? "marginRight" : "marginLeft"]: "calc(50% + 32px)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{CAT_ICONS[d.category]}</span>
                  <span className="cat-badge" style={{ background: color + "22", color }}>{d.category}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2">{d.decision}</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold">WHY:</span>
                    <p className="text-xs text-gray-400 mt-0.5">{d.why}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold" style={{ color }}>IMPACT:</span>
                    <p className="text-xs text-gray-300 mt-0.5">{d.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8 text-xs text-gray-600">
        SBOS Decision Timeline v2.1 — {DECISIONS.length} decisions logged
      </div>
    </div>
  );
}
