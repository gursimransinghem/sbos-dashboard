import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../useData.js';

const basePath = import.meta.env.BASE_URL || '/';

const CATEGORIES = ["All", "Daily", "Review", "Finance"];
const CAT_COLORS = { Daily: "#f59e0b", Review: "#8b5cf6", Finance: "#22c55e" };

export function Launchpad() {
  const { data: COMMANDS, loading } = useData(`${basePath}data/launchpad-commands.json`);
  const { data: QUICK_LINKS } = useData(`${basePath}data/launchpad-links.json`);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [time, setTime] = useState(new Date());
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const handleKey = (e) => { if (e.key === "/" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener("keydown", handleKey);
    return () => { clearInterval(t); window.removeEventListener("keydown", handleKey); };
  }, []);

  const filtered = COMMANDS.filter(c => {
    const matchSearch = search === "" || c.cmd.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || c.category === cat;
    return matchSearch && matchCat;
  });

  const greeting = time.getHours() < 12 ? "Good morning" : time.getHours() < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8 fade-up">
        <div className="text-4xl mb-2">⌘</div>
        <h1 className="text-2xl font-bold text-white">SBOS Launchpad</h1>
        <p className="text-gray-500 text-sm mt-1">{greeting}, Sim — {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      <div className="search-box flex items-center px-4 py-3 mb-4 fade-up" style={{ animationDelay: ".1s" }}>
        <span className="text-gray-500 mr-3">🔍</span>
        <input ref={inputRef} type="text" placeholder="Search commands... (press / to focus)" value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent outline-none flex-1 text-sm text-white placeholder-gray-600" />
        {search && <button onClick={() => setSearch("")} className="text-gray-500 hover:text-white text-xs">✕</button>}
      </div>

      <div className="flex gap-2 mb-6 justify-center fade-up" style={{ animationDelay: ".15s" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`cat-pill ${cat === c ? "active" : ""}`}
            style={{ background: cat === c ? (CAT_COLORS[c] || "rgba(255,255,255,.1)") + "22" : "rgba(255,255,255,.04)", color: cat === c ? (CAT_COLORS[c] || "#fff") : "#6b7280" }}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {filtered.map((c, i) => (
          <a key={c.cmd} href={c.notionUrl} target="_blank" rel="noopener noreferrer"
            className="cmd-card p-5 fade-up block no-underline text-inherit" style={{ animationDelay: `${.2 + i * .05}s` }}>
            <div style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }} className="absolute top-0 left-0 right-0 h-0.5 opacity-0 transition-opacity" />
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{c.icon}</div>
              <span className="text-xs font-mono px-2 py-1 rounded-md" style={{ background: c.color + "22", color: c.color }}>{c.cmd}</span>
            </div>
            <h3 className="font-semibold text-sm text-white mb-1">{c.name}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: (CAT_COLORS[c.category] || "#6b7280") + "22", color: CAT_COLORS[c.category] || "#6b7280" }}>{c.category}</span>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>No commands match "{search}"</p>
        </div>
      )}

      <div className="fade-up" style={{ animationDelay: ".5s" }}>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Links</h3>
        <div className="grid grid-cols-6 gap-2">
          {QUICK_LINKS.map((l) => (
            <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="quick-link p-3 text-center no-underline text-inherit">
              <div className="text-xl mb-1">{l.icon}</div>
              <div className="text-xs text-gray-400">{l.name}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="text-center mt-8 text-xs text-gray-600">
        Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">/</kbd> to search
      </div>
    </div>
  );
}
