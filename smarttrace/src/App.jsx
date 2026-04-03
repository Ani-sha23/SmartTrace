import { useState, useEffect, useRef, useCallback } from "react";
 
const COLORS = {
  bg: "#0a0e1a",
  surface: "#111827",
  card: "#161d2e",
  border: "#1e2a3a",
  accent: "#00d4ff",
  accentDim: "#0099bb",
  green: "#00ff9d",
  amber: "#ffb020",
  red: "#ff4560",
  purple: "#a855f7",
  textPrimary: "#e8f4fd",
  textSecondary: "#7a9ab8",
  textMuted: "#3d5470",
};
 
const ITEM_CATEGORIES = ["Laptop","ID Card","Wallet","Phone","Backpack","Keys","Earbuds"];
 
const MOCK_ITEMS = [
  { id: 1, type: "found", category: "Laptop", location: "Library, Floor 2", time: "2h ago", color: "#3b82f6", confidence: 0.94, status: "unmatched", desc: "Silver MacBook with sticker" },
  { id: 2, type: "found", category: "Wallet", location: "Cafeteria", time: "4h ago", color: "#10b981", confidence: 0.91, status: "matched", desc: "Brown leather bifold" },
  { id: 3, type: "found", category: "Phone", location: "Gate A2", time: "1h ago", color: "#f59e0b", confidence: 0.88, status: "unmatched", desc: "Black iPhone with cracked screen" },
  { id: 4, type: "found", category: "Keys", location: "Parking Lot B", time: "6h ago", color: "#8b5cf6", confidence: 0.96, status: "unmatched", desc: "Keychain with blue fob" },
  { id: 5, type: "lost", category: "Backpack", location: "Train Station", time: "3h ago", color: "#ef4444", confidence: 0.0, status: "searching", desc: "Navy blue Jansport with patches" },
  { id: 6, type: "lost", category: "ID Card", location: "Campus Gate", time: "5h ago", color: "#06b6d4", confidence: 0.0, status: "searching", desc: "Student ID - VIT Bhopal" },
  { id: 7, type: "found", category: "Earbuds", location: "Gym", time: "30m ago", color: "#ec4899", confidence: 0.79, status: "unmatched", desc: "White AirPods in case" },
  { id: 8, type: "lost", category: "Laptop", location: "Lecture Hall 3", time: "1h ago", color: "#3b82f6", confidence: 0.0, status: "matched", desc: "Black ThinkPad, engineering stickers" },
];
 
const METRICS = [
  { label: "Precision", value: 93.4, unit: "%", color: COLORS.green },
  { label: "Recall", value: 91.2, unit: "%", color: COLORS.accent },
  { label: "F1-Score", value: 92.3, unit: "%", color: COLORS.purple },
  { label: "AUC-ROC", value: 0.96, unit: "", color: COLORS.amber },
  { label: "Avg Latency", value: 0.85, unit: "s", color: "#ff6b9d" },
  { label: "Training Epochs", value: 45, unit: "", color: "#a3e635" },
];
 
const MATCH_HISTORY = [
  { id: "M001", lost: "Black iPhone", found: "Black iPhone w/ crack", score: 0.94, time: "Today 10:42", status: "confirmed" },
  { id: "M002", lost: "Brown Wallet", found: "Brown bifold", score: 0.91, time: "Today 09:15", status: "confirmed" },
  { id: "M003", lost: "Silver Laptop", found: "MacBook Air", score: 0.87, time: "Yesterday", status: "pending" },
  { id: "M004", lost: "AirPods White", found: "White earbuds case", score: 0.83, time: "Yesterday", status: "confirmed" },
];
 
const EMBEDDING_DATA = Array.from({ length: 60 }, (_, i) => ({
  x: Math.random() * 340 + 20,
  y: Math.random() * 200 + 20,
  category: ITEM_CATEGORIES[Math.floor(Math.random() * ITEM_CATEGORIES.length)],
  type: Math.random() > 0.5 ? "found" : "lost",
  cluster: Math.floor(i / 9),
}));
 
const CAT_COLORS = {
  Laptop: "#3b82f6", "ID Card": "#06b6d4", Wallet: "#10b981",
  Phone: "#f59e0b", Backpack: "#ef4444", Keys: "#8b5cf6", Earbuds: "#ec4899"
};
 
// ─── Icon Components ───────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor", stroke = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={stroke ? "none" : color}
    stroke={stroke ? color : "none"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
 
const Icons = {
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  check: "M20 6L9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  grid: "M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  chart: "M18 20V10M12 20V4M6 20v-6",
  cpu: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  map: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0",
  trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  plus: "M12 5v14M5 12h14",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};
 
// ─── Animated number ────────────────────────────────────────
function AnimNum({ target, decimals = 0, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val.toFixed(decimals)}</>;
}
 
// ─── Upload Zone ─────────────────────────────────────────────
function UploadZone({ onUpload, label }) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(null);
  const ref = useRef();
 
  const handle = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload && onUpload(file, url);
  };
 
  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      style={{
        border: `2px dashed ${drag ? COLORS.accent : COLORS.border}`,
        borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer",
        background: drag ? "rgba(0,212,255,0.05)" : "transparent",
        transition: "all 0.2s", position: "relative", minHeight: 140,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8
      }}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => handle(e.target.files[0])} />
      {preview ? (
        <>
          <img src={preview} alt="preview" style={{ maxHeight: 100, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} />
          <span style={{ fontSize: 11, color: COLORS.green }}>✓ Image loaded</span>
        </>
      ) : (
        <>
          <div style={{ color: COLORS.accent }}><Icon d={Icons.upload} size={28} /></div>
          <div style={{ color: COLORS.textSecondary, fontSize: 13 }}>{label || "Drop image or click to upload"}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 11 }}>PNG, JPG supported</div>
        </>
      )}
    </div>
  );
}
 
// ─── Similarity Bar ──────────────────────────────────────────
function SimBar({ score, animate = true }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(score * 100), 100); }, [score]);
  const color = score > 0.85 ? COLORS.green : score > 0.7 ? COLORS.amber : COLORS.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: animate ? `${w}%` : `${score * 100}%`,
          background: color, borderRadius: 3,
          transition: animate ? "width 0.8s cubic-bezier(0.4,0,0.2,1)" : "none",
          boxShadow: `0 0 8px ${color}60`
        }} />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 600, minWidth: 36 }}>{(score * 100).toFixed(0)}%</span>
    </div>
  );
}
 
// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [reportType, setReportType] = useState("lost");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");
  const [uploadedImg, setUploadedImg] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [items, setItems] = useState(MOCK_ITEMS);
  const [notification, setNotification] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [threshold, setThreshold] = useState(0.78);
  const [embAnimate, setEmbAnimate] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "High-confidence match found for your lost Wallet!", time: "2m ago", read: false, color: COLORS.green },
    { id: 2, text: "New item reported: Keys at Parking Lot B", time: "15m ago", read: false, color: COLORS.accent },
    { id: 3, text: "Your report #L-006 is being processed", time: "1h ago", read: true, color: COLORS.amber },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
 
  const toast = (msg, color = COLORS.green) => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };
 
  const runMatch = () => {
    if (!uploadedImg) { toast("Please upload an image first", COLORS.red); return; }
    setMatching(true);
    setMatchResults(null);
    setTimeout(() => {
      const results = MOCK_ITEMS.filter(i => i.type === "found").map(item => ({
        ...item,
        score: Math.min(0.5 + Math.random() * 0.47, 0.99),
      })).sort((a, b) => b.score - a.score);
      setMatchResults(results);
      setMatching(false);
      if (results[0]?.score > threshold) {
        toast(`Match found! ${results[0].category} — ${(results[0].score * 100).toFixed(0)}% confidence`);
        setNotifications(prev => [
          { id: Date.now(), text: `High-confidence match: ${results[0].desc}`, time: "just now", read: false, color: COLORS.green },
          ...prev
        ]);
      }
    }, 2200);
  };
 
  const submitReport = () => {
    if (!category || !location) { toast("Please fill category and location", COLORS.red); return; }
    const newItem = {
      id: Date.now(), type: reportType, category, location, time: "just now",
      color: CAT_COLORS[category] || COLORS.accent, confidence: 0, status: reportType === "lost" ? "searching" : "unmatched",
      desc: desc || `${category} reported`,
    };
    setItems(prev => [newItem, ...prev]);
    toast(`${reportType === "lost" ? "Lost" : "Found"} item reported successfully!`);
    setCategory(""); setLocation(""); setDesc(""); setUploadedImg(null);
    setTimeout(() => setTab("dashboard"), 1200);
  };
 
  const filtered = items.filter(i => {
    if (filterType !== "all" && i.type !== filterType) return false;
    if (searchQ && !i.category.toLowerCase().includes(searchQ.toLowerCase()) &&
        !i.location.toLowerCase().includes(searchQ.toLowerCase()) &&
        !i.desc.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });
 
  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === "lost").length,
    found: items.filter(i => i.type === "found").length,
    matched: items.filter(i => i.status === "matched").length,
  };
 
  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Icons.grid },
    { id: "report", label: "Report Item", icon: Icons.plus },
    { id: "match", label: "AI Matcher", icon: Icons.cpu },
    { id: "items", label: "Item Registry", icon: Icons.list },
    { id: "analytics", label: "Analytics", icon: Icons.chart },
    { id: "security", label: "Security", icon: Icons.lock },
  ];
 
  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.textPrimary,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${COLORS.surface}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
        input, select, textarea { font-family: inherit; background: ${COLORS.surface}; color: ${COLORS.textPrimary}; border: 1px solid ${COLORS.border}; border-radius: 8px; padding: 10px 14px; font-size: 13px; outline: none; width: 100%; transition: border 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: ${COLORS.accent}; }
        select option { background: ${COLORS.surface}; }
        button { cursor: pointer; font-family: inherit; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px ${COLORS.accent}40} 50%{box-shadow:0 0 20px ${COLORS.accent}80} }
      `}</style>
 
      {/* TOP NAV */}
      <header style={{
        background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#000", fontFamily: "'Space Mono', monospace"
          }}>ST</div>
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.3px" }}>SmartTrace</span>
          <span style={{ fontSize: 10, color: COLORS.accent, background: "rgba(0,212,255,0.1)", padding: "2px 7px", borderRadius: 4, fontFamily: "'Space Mono', monospace" }}>v1.0</span>
        </div>
 
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "rgba(0,212,255,0.12)" : "transparent",
              color: tab === t.id ? COLORS.accent : COLORS.textSecondary,
              border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
            }}>
              <Icon d={t.icon} size={13} color={tab === t.id ? COLORS.accent : COLORS.textSecondary} />
              {t.label}
            </button>
          ))}
        </div>
 
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifs(!showNotifs)} style={{
              background: "none", border: "none", color: COLORS.textSecondary, padding: 6, borderRadius: 6,
              display: "flex", alignItems: "center", position: "relative"
            }}>
              <Icon d={Icons.bell} size={18} />
              {unread > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2, width: 8, height: 8,
                  background: COLORS.red, borderRadius: "50%", animation: "pulse 2s infinite"
                }} />
              )}
            </button>
            {showNotifs && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300,
                background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
                padding: 8, zIndex: 200, animation: "fadeIn 0.15s ease"
              }}>
                <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 1 }}>NOTIFICATIONS</div>
                {notifications.map(n => (
                  <div key={n.id} onClick={() => {
                    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                    setShowNotifs(false);
                  }} style={{
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                    background: n.read ? "transparent" : "rgba(0,212,255,0.05)",
                    borderLeft: `2px solid ${n.read ? "transparent" : n.color}`,
                    marginBottom: 4, transition: "background 0.1s"
                  }}>
                    <div style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff"
          }}>AD</div>
        </div>
      </header>
 
      {/* TOAST */}
      {notification && (
        <div style={{
          position: "fixed", top: 70, right: 20, zIndex: 999,
          background: COLORS.card, border: `1px solid ${notification.color}`,
          borderRadius: 10, padding: "12px 18px", fontSize: 13,
          color: notification.color, animation: "slideIn 0.2s ease",
          boxShadow: `0 4px 24px ${notification.color}30`
        }}>{notification.msg}</div>
      )}
 
      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "24px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
 
        {/* ─── DASHBOARD ─── */}
        {tab === "dashboard" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>System Dashboard</h1>
              <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Real-time overview of SmartTrace lost & found operations</p>
            </div>
 
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Items", val: stats.total, color: COLORS.accent, icon: Icons.list },
                { label: "Lost Reports", val: stats.lost, color: COLORS.red, icon: Icons.search },
                { label: "Found Items", val: stats.found, color: COLORS.green, icon: Icons.check },
                { label: "Matches Made", val: stats.matched, color: COLORS.purple, icon: Icons.cpu },
              ].map((s, i) => (
                <div key={i} style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 12, padding: "18px 20px",
                  borderTop: `2px solid ${s.color}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.5 }}>{s.label.toUpperCase()}</div>
                      <div style={{ fontSize: 28, fontWeight: 600, color: s.color, fontFamily: "'Space Mono', monospace" }}>
                        <AnimNum target={s.val} />
                      </div>
                    </div>
                    <div style={{ color: s.color, opacity: 0.6 }}><Icon d={s.icon} size={20} /></div>
                  </div>
                </div>
              ))}
            </div>
 
            {/* Middle Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {/* Recent Activity */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: COLORS.textSecondary, letterSpacing: 0.5 }}>RECENT MATCHES</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {MATCH_HISTORY.map(m => (
                    <div key={m.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", background: COLORS.surface,
                      borderRadius: 8, border: `1px solid ${COLORS.border}`
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: m.status === "confirmed" ? COLORS.green : COLORS.amber,
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: COLORS.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.lost} → {m.found}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{m.time}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <SimBar score={m.score} animate={false} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Embedding Visualization */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 0.5 }}>EMBEDDING SPACE (2D)</h3>
                  <button onClick={() => setEmbAnimate(p => !p)} style={{
                    background: "rgba(0,212,255,0.1)", border: `1px solid ${COLORS.accent}`,
                    color: COLORS.accent, borderRadius: 6, padding: "4px 10px", fontSize: 11
                  }}>{embAnimate ? "Reset" : "Animate"}</button>
                </div>
                <svg width="100%" viewBox="0 0 380 230" style={{ display: "block" }}>
                  <defs>
                    <radialGradient id="g1" cx="50%" cy="50%">
                      <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.08" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                  {/* Grid lines */}
                  {[60, 120, 180, 240, 300].map(x => <line key={x} x1={x} y1="10" x2={x} y2="220" stroke={COLORS.border} strokeWidth="0.5" />)}
                  {[50, 100, 150, 200].map(y => <line key={y} x1="10" y1={y} x2="370" y2={y} stroke={COLORS.border} strokeWidth="0.5" />)}
                  {/* Cluster halos */}
                  {[{cx:80,cy:80,r:35},{cx:200,cy:60,r:30},{cx:310,cy:80,r:28},{cx:90,cy:170,r:30},{cx:220,cy:160,r:32},{cx:320,cy:170,r:25},{cx:160,cy:120,r:22}].map((c, i) => (
                    <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={Object.values(CAT_COLORS)[i] + "15"} stroke={Object.values(CAT_COLORS)[i] + "30"} strokeWidth="1" />
                  ))}
                  {EMBEDDING_DATA.map((pt, i) => (
                    <circle key={i}
                      cx={pt.x + (embAnimate ? (Math.random() - 0.5) * 4 : 0)}
                      cy={pt.y + (embAnimate ? (Math.random() - 0.5) * 4 : 0)}
                      r={pt.type === "lost" ? 4 : 3}
                      fill={CAT_COLORS[pt.category] || COLORS.accent}
                      opacity={pt.type === "lost" ? 1 : 0.6}
                      stroke={pt.type === "lost" ? "white" : "none"}
                      strokeWidth="0.5"
                    />
                  ))}
                </svg>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {ITEM_CATEGORIES.map(c => (
                    <span key={c} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: COLORS.textSecondary }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLORS[c], display: "inline-block" }} />{c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
 
            {/* Bottom: Performance Metrics */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 18 }}>MODEL PERFORMANCE METRICS</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
                {METRICS.map((m, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: 24, fontWeight: 700, color: m.color,
                      fontFamily: "'Space Mono', monospace", lineHeight: 1,
                      textShadow: `0 0 20px ${m.color}60`
                    }}>
                      <AnimNum target={m.value} decimals={m.unit === "s" || m.unit === "" && m.value < 2 ? 2 : 1} duration={1500 + i * 200} />
                      {m.unit}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>{m.label}</div>
                    <div style={{ height: 2, background: COLORS.border, borderRadius: 1, marginTop: 10 }}>
                      <div style={{
                        height: "100%", width: `${Math.min(m.value, 100)}%`,
                        background: m.color, borderRadius: 1,
                        boxShadow: `0 0 6px ${m.color}`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
 
        {/* ─── REPORT ITEM ─── */}
        {tab === "report" && (
          <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 680, margin: "0 auto" }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Report an Item</h1>
            <p style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 24 }}>Submit a lost or found item to the SmartTrace database</p>
 
            {/* Toggle */}
            <div style={{
              display: "flex", background: COLORS.surface, borderRadius: 10, padding: 4,
              marginBottom: 24, border: `1px solid ${COLORS.border}`
            }}>
              {["lost", "found"].map(t => (
                <button key={t} onClick={() => setReportType(t)} style={{
                  flex: 1, padding: "10px 0", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500,
                  background: reportType === t ? (t === "lost" ? COLORS.red : COLORS.green) : "transparent",
                  color: reportType === t ? (t === "lost" ? "#fff" : "#000") : COLORS.textSecondary,
                  transition: "all 0.2s",
                }}>{t === "lost" ? "🔍 I Lost Something" : "📦 I Found Something"}</button>
              ))}
            </div>
 
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Select category...</option>
                    {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Location *</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Library, Floor 2" />
                </div>
              </div>
 
              <div>
                <label style={{ fontSize: 12, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Describe color, brand, distinguishing features..."
                  rows={3} style={{ resize: "vertical" }} />
              </div>
 
              <div>
                <label style={{ fontSize: 12, color: COLORS.textSecondary, display: "block", marginBottom: 8 }}>
                  Item Photo <span style={{ color: COLORS.accent }}>(enables AI matching)</span>
                </label>
                <UploadZone onUpload={(_, url) => setUploadedImg(url)} label="Upload item photo for AI matching" />
              </div>
 
              <button onClick={submitReport} style={{
                background: reportType === "lost" ? COLORS.red : COLORS.green,
                color: reportType === "lost" ? "#fff" : "#000",
                border: "none", borderRadius: 10, padding: "14px 0", fontSize: 14, fontWeight: 600,
                width: "100%", transition: "opacity 0.2s",
              }}>
                {reportType === "lost" ? "Submit Lost Report" : "Submit Found Item"} →
              </button>
            </div>
          </div>
        )}
 
        {/* ─── AI MATCHER ─── */}
        {tab === "match" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>AI Similarity Matcher</h1>
            <p style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 24 }}>
              Upload a lost item image — SmartTrace uses deep CNN embeddings + cosine similarity to find matches
            </p>
 
            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
              {/* Config Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontSize: 12, color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 14 }}>QUERY IMAGE</h3>
                  <UploadZone onUpload={(_, url) => setUploadedImg(url)} label="Upload lost item photo" />
                </div>
 
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontSize: 12, color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 14 }}>MATCHING CONFIG</h3>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Similarity threshold τ</span>
                      <span style={{ fontSize: 12, color: COLORS.accent, fontFamily: "'Space Mono', monospace" }}>{threshold.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0.5" max="0.99" step="0.01" value={threshold}
                      onChange={e => setThreshold(parseFloat(e.target.value))}
                      style={{ width: "100%", accentColor: COLORS.accent }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
                      <span>Low (more results)</span><span>High (precise)</span>
                    </div>
                  </div>
 
                  {[
                    { label: "Top-K results", val: "5" },
                    { label: "Backbone model", val: "ResNet-50" },
                    { label: "Index type", val: "ANN/FAISS" },
                    { label: "Embedding dim", val: "512-d" },
                  ].map((cfg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none" }}>
                      <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{cfg.label}</span>
                      <span style={{ fontSize: 12, color: COLORS.textPrimary, fontFamily: "'Space Mono', monospace" }}>{cfg.val}</span>
                    </div>
                  ))}
                </div>
 
                <button onClick={runMatch} disabled={matching} style={{
                  background: matching ? COLORS.surface : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
                  color: matching ? COLORS.textMuted : "#000", border: "none",
                  borderRadius: 10, padding: "14px 0", fontSize: 14, fontWeight: 600,
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  animation: !matching && uploadedImg ? "glow 2s infinite" : "none"
                }}>
                  {matching ? (
                    <>
                      <div style={{ width: 16, height: 16, border: `2px solid ${COLORS.textMuted}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Running CNN embeddings...
                    </>
                  ) : "⚡ Run AI Matcher"}
                </button>
              </div>
 
              {/* Results */}
              <div>
                {matching && (
                  <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32, textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                    <div style={{ color: COLORS.textSecondary, fontSize: 13 }}>Extracting CNN features...</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4 }}>Computing cosine similarity in embedding space</div>
                    {/* Pipeline steps */}
                    {["Image preprocessing", "ResNet-50 forward pass", "Embedding normalization", "ANN index search", "Confidence scoring"].map((step, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10, marginTop: 14, textAlign: "left",
                        opacity: matching ? 1 : 0, animation: `fadeIn 0.3s ease ${i * 0.3}s both`
                      }}>
                        <div style={{ width: 16, height: 16, border: `2px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
 
                {!matching && !matchResults && (
                  <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                    <div style={{ color: COLORS.textSecondary, fontSize: 14 }}>Upload an image and run the matcher</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 6 }}>SmartTrace will compute deep visual embeddings and rank found items by similarity</div>
                  </div>
                )}
 
                {matchResults && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600 }}>Match Results</h3>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>Ranked by cosine similarity · τ={threshold.toFixed(2)}</span>
                    </div>
                    {matchResults.map((item, rank) => (
                      <div key={item.id} style={{
                        background: COLORS.card, border: `1px solid ${item.score > threshold ? COLORS.green + "60" : COLORS.border}`,
                        borderRadius: 12, padding: 16, display: "flex", gap: 14, alignItems: "center",
                        animation: `slideIn 0.3s ease ${rank * 0.07}s both`,
                        position: "relative", overflow: "hidden"
                      }}>
                        {item.score > threshold && (
                          <div style={{ position: "absolute", top: 10, right: 10, background: COLORS.green + "20", color: COLORS.green, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                            MATCH
                          </div>
                        )}
                        <div style={{
                          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                          background: item.color + "30", border: `1px solid ${item.color}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, fontWeight: 700, color: item.color
                        }}>#{rank + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{item.category}</span>
                            <span style={{ fontSize: 11, color: COLORS.textMuted }}>· {item.location}</span>
                          </div>
                          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 }}>{item.desc}</div>
                          <SimBar score={item.score} />
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>P(Match|S)</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: item.score > threshold ? COLORS.green : COLORS.textSecondary, fontFamily: "'Space Mono', monospace" }}>
                            {(1 / (1 + Math.exp(-10 * (item.score - threshold))) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
 
        {/* ─── ITEM REGISTRY ─── */}
        {tab === "items" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Item Registry</h1>
                <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>{filtered.length} items in database</p>
              </div>
              <button onClick={() => setTab("report")} style={{
                background: COLORS.accent, color: "#000", border: "none",
                borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6
              }}>
                <Icon d={Icons.plus} size={14} color="#000" /> New Report
              </button>
            </div>
 
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search by category, location, description..." />
              </div>
              {["all", "lost", "found"].map(f => (
                <button key={f} onClick={() => setFilterType(f)} style={{
                  background: filterType === f ? COLORS.accent : COLORS.surface,
                  color: filterType === f ? "#000" : COLORS.textSecondary,
                  border: `1px solid ${filterType === f ? COLORS.accent : COLORS.border}`,
                  borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 500, textTransform: "capitalize"
                }}>{f}</button>
              ))}
            </div>
 
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {filtered.map((item, i) => (
                <div key={item.id} onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)} style={{
                  background: COLORS.card, border: `1px solid ${selectedItem?.id === item.id ? COLORS.accent : COLORS.border}`,
                  borderRadius: 12, padding: 16, cursor: "pointer",
                  transition: "border 0.2s, transform 0.1s",
                  animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
                  borderLeft: `3px solid ${item.color}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600, letterSpacing: 0.3,
                        background: item.type === "lost" ? COLORS.red + "20" : COLORS.green + "20",
                        color: item.type === "lost" ? COLORS.red : COLORS.green,
                      }}>{item.type.toUpperCase()}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{item.category}</h4>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600,
                      background: item.status === "matched" ? COLORS.green + "20" : item.status === "searching" ? COLORS.amber + "20" : COLORS.border,
                      color: item.status === "matched" ? COLORS.green : item.status === "searching" ? COLORS.amber : COLORS.textMuted,
                    }}>{item.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>{item.desc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textMuted }}>
                    <span>📍 {item.location}</span>
                    <span>🕐 {item.time}</span>
                  </div>
                  {item.status === "matched" && item.confidence > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <SimBar score={item.confidence} />
                    </div>
                  )}
 
                  {/* Expanded detail */}
                  {selectedItem?.id === item.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.border}`, animation: "fadeIn 0.2s ease" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={e => { e.stopPropagation(); setTab("match"); }} style={{
                          flex: 1, background: COLORS.accent + "20", color: COLORS.accent,
                          border: `1px solid ${COLORS.accent}40`, borderRadius: 7, padding: "8px 0", fontSize: 12
                        }}>Find Matches</button>
                        <button onClick={e => { e.stopPropagation(); setItems(prev => prev.filter(x => x.id !== item.id)); setSelectedItem(null); toast("Item removed"); }} style={{
                          background: COLORS.red + "20", color: COLORS.red,
                          border: `1px solid ${COLORS.red}40`, borderRadius: 7, padding: "8px 12px", fontSize: 12
                        }}>
                          <Icon d={Icons.trash} size={13} color={COLORS.red} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* ─── ANALYTICS ─── */}
        {tab === "analytics" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>System Analytics</h1>
            <p style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 24 }}>Performance analysis based on SmartTrace paper results</p>
 
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Method Comparison */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 18 }}>METHOD COMPARISON</h3>
                {[
                  { label: "SmartTrace (Proposed)", precision: 0.934, recall: 0.912, f1: 0.923, color: COLORS.accent },
                  { label: "ResNet-50 (Classification)", precision: 0.88, recall: 0.85, f1: 0.86, color: COLORS.purple },
                  { label: "SIFT-Based Matching", precision: 0.72, recall: 0.66, f1: 0.69, color: COLORS.textMuted },
                ].map((m, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: m.color, fontWeight: i === 0 ? 600 : 400 }}>{m.label}</span>
                      <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'Space Mono', monospace" }}>F1: {m.f1}</span>
                    </div>
                    {[
                      { label: "Precision", val: m.precision },
                      { label: "Recall", val: m.recall },
                      { label: "F1", val: m.f1 },
                    ].map((metric, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 10, color: COLORS.textMuted, width: 50, flexShrink: 0 }}>{metric.label}</span>
                        <div style={{ flex: 1, height: 5, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${metric.val * 100}%`,
                            background: m.color, borderRadius: 2,
                            boxShadow: `0 0 6px ${m.color}60`
                          }} />
                        </div>
                        <span style={{ fontSize: 10, color: m.color, fontFamily: "'Space Mono', monospace", width: 32 }}>{(metric.val * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
 
              {/* Latency comparison */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 18 }}>RETRIEVAL LATENCY</h3>
                {[
                  { label: "Manual Matching", time: 240, unit: "s", color: COLORS.red },
                  { label: "Text-Based Filtering", time: 52, unit: "s", color: COLORS.amber },
                  { label: "SmartTrace (ANN)", time: 0.85, unit: "s", color: COLORS.green },
                ].map((m, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: COLORS.textPrimary }}>{m.label}</span>
                      <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: m.color }}>{m.time}s</span>
                    </div>
                    <div style={{ height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${(m.time / 240) * 100}%`,
                        background: m.color, borderRadius: 4, minWidth: 4,
                        boxShadow: `0 0 8px ${m.color}50`
                      }} />
                    </div>
                  </div>
                ))}
 
                <div style={{ marginTop: 24, padding: 16, background: COLORS.surface, borderRadius: 10, border: `1px solid ${COLORS.green}30` }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Speed improvement vs manual</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.green, fontFamily: "'Space Mono', monospace" }}>282×</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>faster with ANN indexing</div>
                </div>
              </div>
            </div>
 
            {/* Complexity Analysis */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 20 }}>COMPUTATIONAL COMPLEXITY SCALING</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {[100, 1000, 10000, 100000, 1000000].map((n, i) => {
                  const naive = n; const ann = Math.log2(n);
                  const maxH = 120;
                  const naiveH = Math.min((n / 1000000) * maxH + 4, maxH);
                  const annH = (ann / 20) * maxH;
                  return (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, height: maxH + 10 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <div style={{ width: 20, height: naiveH, background: COLORS.red + "80", borderRadius: "3px 3px 0 0", minHeight: 4 }} />
                          <div style={{ width: 20, height: annH, background: COLORS.green, borderRadius: "3px 3px 0 0", minHeight: 4 }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 6 }}>{n >= 1000 ? `${n / 1000}K` : n}</div>
                      <div style={{ fontSize: 9, color: COLORS.textMuted }}>items</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.textSecondary }}>
                  <span style={{ width: 12, height: 8, background: COLORS.red + "80", borderRadius: 2, display: "inline-block" }} />Brute force O(nm)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.textSecondary }}>
                  <span style={{ width: 12, height: 8, background: COLORS.green, borderRadius: 2, display: "inline-block" }} />ANN O(n log m)
                </span>
              </div>
            </div>
          </div>
        )}
 
        {/* ─── SECURITY ─── */}
        {tab === "security" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Security & Privacy</h1>
            <p style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 24 }}>SmartTrace security architecture and privacy-preserving mechanisms</p>
 
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {[
                {
                  title: "Data Encryption", icon: Icons.lock, color: COLORS.accent,
                  desc: "All images encrypted with AES-256 before storage. TLS 1.3 for transmission. C = Enc_k(I) ensures zero raw data exposure.",
                  items: ["AES-256 encryption at rest", "TLS 1.3 in transit", "Key rotation every 30 days"]
                },
                {
                  title: "Privacy-Preserving Embeddings", icon: Icons.cpu, color: COLORS.purple,
                  desc: "Raw images are never stored — only 512-dim feature vectors z = F_θ(I). Embeddings are non-invertible, preventing image reconstruction.",
                  items: ["No raw image storage", "Non-invertible embeddings", "Hashed index: h = H(z)"]
                },
                {
                  title: "Access Control (RBAC)", icon: Icons.settings, color: COLORS.amber,
                  desc: "Role-based access control ensures only authorized users can view or modify records. Multi-factor authentication available.",
                  items: ["Role-based permissions", "MFA support", "Audit logging"]
                },
                {
                  title: "Federated Learning", icon: Icons.chart, color: COLORS.green,
                  desc: "Cross-institutional deployment without sharing raw data. Local models share only weight updates θ_g = Σ w_i θ_i.",
                  items: ["On-device training", "Weight aggregation only", "Cross-institutional privacy"]
                },
              ].map((card, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, borderTop: `2px solid ${card.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ color: card.color }}><Icon d={card.icon} size={18} /></div>
                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>{card.title}</h3>
                  </div>
                  <p style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 14 }}>{card.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {card.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textPrimary }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: card.color, flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
 
            {/* Threat model */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginTop: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 16 }}>THREAT MODEL ANALYSIS</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { threat: "Unauthorized DB Access", mitigation: "RBAC + MFA", status: "mitigated", color: COLORS.green },
                  { threat: "Embedding Inversion", mitigation: "Non-invertible CNN", status: "mitigated", color: COLORS.green },
                  { threat: "Adversarial Manipulation", mitigation: "Perturbation detection ‖δ‖ < ε", status: "active", color: COLORS.amber },
                  { threat: "Data Interception", mitigation: "TLS + end-to-end encryption", status: "mitigated", color: COLORS.green },
                ].map((t, i) => (
                  <div key={i} style={{ background: COLORS.surface, borderRadius: 10, padding: 14, border: `1px solid ${t.color}30` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.color, marginBottom: 6, letterSpacing: 0.3 }}>{t.status.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: COLORS.textPrimary, marginBottom: 8, fontWeight: 500 }}>{t.threat}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{t.mitigation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
 
      </main>
 
      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: COLORS.textMuted }}>SmartTrace — AI-Powered Lost & Found · VIT Bhopal University · 2024</span>
        <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'Space Mono', monospace" }}>Deep Visual Embeddings · Cosine Similarity · ANN Retrieval</span>
      </footer>
    </div>
  );
}
