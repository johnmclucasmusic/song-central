"use client";

import { useState, useEffect } from "react";

const STAGES = [
  { id: "01", label: "To Review",        color: "#94a3b8", description: "Fresh dump" },
  { id: "02", label: "Hmm",              color: "#f59e0b", description: "Not sure yet" },
  { id: "03", label: "Tune Up?",         color: "#f97316", description: "Has promise, needs polish" },
  { id: "04", label: "In Progress",      color: "#3b82f6", description: "Actively developing" },
  { id: "05", label: "Ready to Pitch",   color: "#8b5cf6", description: "Done, waiting for home" },
  { id: "06", label: "Pitched",          color: "#ec4899", description: "Submitted — tracking response" },
  { id: "07", label: "On Hold",          color: "#06b6d4", description: "Reserved — don't pitch" },
  { id: "08", label: "Cut",              color: "#10b981", description: "Placed / released 🎉" },
  { id: "09", label: "Master Delivered", color: "#059669", description: "Final files sent" },
  { id: "99", label: "Admin Done",       color: "#1d4ed8", description: "In Disco, sync-ready" },
];

const PITCH_TARGETS = ["Korea", "Sync", "Artist"];
const ACTIVE_STAGES = ["01", "02", "03", "04", "05", "06"];

const EMPTY_SONG = {
  id: null, title: "", bpm: "", key: "", collaborators: "",
  artist: "", pitchTargets: [], splits: "", discoStatus: false,
  stage: "01", notes: "", dateAdded: "", lastUpdated: "",
};

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function StageTag({ stageId }) {
  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: stage.color + "18", color: stage.color,
      border: `1px solid ${stage.color}40`, whiteSpace: "nowrap"
    }}>
      <span style={{ fontFamily: "monospace", opacity: 0.7 }}>{stage.id}</span>
      {stage.label}
    </span>
  );
}

function StaleBadge({ days }) {
  if (days === null || days < 14) return null;
  const hot = days >= 60;
  return (
    <span style={{
      padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: hot ? "#fef2f2" : "#fffbeb",
      color: hot ? "#dc2626" : "#b45309",
      border: `1px solid ${hot ? "#fca5a5" : "#fcd34d"}`,
    }}>
      {days}d stale
    </span>
  );
}

function PitchTargetPills({ selected, onChange }) {
  const toggle = (t) => {
    if (selected.includes(t)) onChange(selected.filter(x => x !== t));
    else onChange([...selected, t]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {PITCH_TARGETS.map(t => {
        const on = selected.includes(t);
        return (
          <button key={t} type="button" onClick={() => toggle(t)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            cursor: "pointer", border: `1px solid ${on ? "#0f172a" : "#e2e8f0"}`,
            background: on ? "#0f172a" : "#fff", color: on ? "#fff" : "#64748b",
            transition: "all 0.12s"
          }}>{t}</button>
        );
      })}
    </div>
  );
}

function Modal({ song, onSave, onClose, onDelete }) {
  const [form, setForm] = useState({ ...EMPTY_SONG, ...song, pitchTargets: song.pitchTargets || [] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString().split("T")[0];
    onSave({
      ...form,
      id: form.id || Date.now(),
      dateAdded: form.dateAdded || now,
      lastUpdated: now,
    });
  };

  const inputStyle = {
    width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0",
    borderRadius: 6, fontSize: 13, fontFamily: "inherit",
    background: "#fff", color: "#0f172a", outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.05em",
    marginBottom: 4, display: "block"
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 12, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {form.id ? "Edit Song" : "Add Song"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
              {form.title || "Untitled"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20, padding: 4 }}>✕</button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Title + Stage */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Song Title *</label>
              <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Evergreen" />
            </div>
            <div>
              <label style={labelStyle}>Stage</label>
              <select style={inputStyle} value={form.stage} onChange={e => set("stage", e.target.value)}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.id} — {s.label}</option>)}
              </select>
            </div>
          </div>

          {/* BPM + Key */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>BPM</label>
              <input style={inputStyle} type="number" value={form.bpm} onChange={e => set("bpm", e.target.value)} placeholder="e.g. 120" />
            </div>
            <div>
              <label style={labelStyle}>Key</label>
              <input style={inputStyle} value={form.key} onChange={e => set("key", e.target.value)} placeholder="e.g. Am, F#, Bbm" />
            </div>
          </div>

          {/* Collabs + Artist */}
          <div>
            <label style={labelStyle}>Collaborators / Co-writers</label>
            <input style={inputStyle} value={form.collaborators} onChange={e => set("collaborators", e.target.value)} placeholder="e.g. John Doe, Jane Smith" />
          </div>
          <div>
            <label style={labelStyle}>Artist It's For</label>
            <input style={inputStyle} value={form.artist} onChange={e => set("artist", e.target.value)} placeholder="e.g. Taemin, TBD" />
          </div>

          {/* Pitch Targets — multi select pills */}
          <div>
            <label style={labelStyle}>Pitch Target</label>
            <PitchTargetPills selected={form.pitchTargets} onChange={v => set("pitchTargets", v)} />
          </div>

          {/* Splits */}
          <div>
            <label style={labelStyle}>Split / Ownership Info</label>
            <input style={inputStyle} value={form.splits} onChange={e => set("splits", e.target.value)} placeholder="e.g. You 50% / John Doe 50%" />
          </div>

          {/* Disco */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <input type="checkbox" id="disco" checked={form.discoStatus} onChange={e => set("discoStatus", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#1d4ed8" }} />
            <label htmlFor="disco" style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", cursor: "pointer" }}>
              Admin done in Disco
            </label>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Metadata uploaded, sync-ready</span>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
              value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Anything worth remembering about this one..." />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {form.id && (
              <button onClick={() => onDelete(form.id)} style={{
                background: "none", border: "1px solid #fca5a5", color: "#dc2626",
                padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600
              }}>Delete</button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{
              background: "none", border: "1px solid #e2e8f0", color: "#64748b",
              padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600
            }}>Cancel</button>
            <button onClick={handleSave} style={{
              background: "#0f172a", border: "none", color: "#fff",
              padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600
            }}>Save Song</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoCentral() {
  const [songs, setSongs] = useState([]);
  const [modal, setModal] = useState(null);
  const [filterStage, setFilterStage] = useState("all");
  const [filterPitch, setFilterPitch] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("stale");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Load from browser storage
        let browserSongs = [];
        try {
          const stored = localStorage.getItem("song-central-songs");
          if (stored) {
            const parsed = JSON.parse(stored);
            browserSongs = parsed.map(s => ({
              ...s,
              pitchTargets: s.pitchTargets || (s.pitchTarget ? [s.pitchTarget] : [])
            }));
          }
        } catch {}

        // Check for an incoming song via URL params (from the bounce prompt)
        try {
          const params = new URLSearchParams(window.location.search);
          if (params.get("import") === "1") {
            const incoming = {
              id: params.get("id") || Date.now().toString(),
              title: params.get("title") || "",
              bpm: params.get("bpm") || "",
              key: params.get("key") || "",
              stage: params.get("stage") || "01",
              collaborators: params.get("collaborators") || "",
              artist: params.get("artist") || "",
              pitchTargets: params.get("pitchTargets")
                ? params.get("pitchTargets").split(",").filter(Boolean)
                : [],
              notes: params.get("notes") || "",
              splits: "",
              disco: false,
            };
            const alreadyExists = browserSongs.some(s => s.id === incoming.id);
            if (!alreadyExists) {
              browserSongs = [incoming, ...browserSongs];
            }
            // Clean the URL so refreshing doesn't re-import
            window.history.replaceState({}, "", window.location.pathname);
          }
        } catch {}

        setSongs(browserSongs);
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("song-central-songs", JSON.stringify(songs));
    } catch {}
  }, [songs, loaded]);

  const saveSong = (song) => {
    setSongs(prev => {
      const exists = prev.find(s => s.id === song.id);
      return exists ? prev.map(s => s.id === song.id ? song : s) : [...prev, song];
    });
    setModal(null);
  };

  const deleteSong = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    setModal(null);
  };

  const filtered = songs
    .filter(s => filterStage === "all" || s.stage === filterStage)
    .filter(s => filterPitch === "all" || (s.pitchTargets || []).includes(filterPitch))
    .filter(s => !search ||
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.collaborators?.toLowerCase().includes(search.toLowerCase()) ||
      s.artist?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "stale") return (daysSince(b.lastUpdated) || 0) - (daysSince(a.lastUpdated) || 0);
      if (sortBy === "stage") return a.stage.localeCompare(b.stage, undefined, { numeric: true });
      if (sortBy === "newest") return new Date(b.dateAdded) - new Date(a.dateAdded);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const needsAction = songs.filter(s => {
    const days = daysSince(s.lastUpdated);
    return ACTIVE_STAGES.includes(s.stage) && days !== null && days >= 14;
  });

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s.id] = songs.filter(x => x.stage === s.id).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>

      {/* Top bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, background: "#0f172a", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>◈</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>Song Central</span>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{songs.length} songs</span>
        </div>
        <button onClick={() => setModal({ ...EMPTY_SONG })} style={{
          background: "#0f172a", color: "#fff", border: "none",
          padding: "7px 14px", borderRadius: 6, cursor: "pointer",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.02em"
        }}>+ Add Song</button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

        {/* Needs Action Banner */}
        {needsAction.length > 0 && (
          <div style={{
            background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10,
            padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <span style={{ fontWeight: 700, color: "#92400e", fontSize: 13 }}>
                {needsAction.length} song{needsAction.length > 1 ? "s" : ""} need attention —
              </span>
              <span style={{ color: "#b45309", fontSize: 13 }}> stuck in active stages for 14+ days</span>
            </div>
            <button onClick={() => { setFilterStage("all"); setSortBy("stale"); }}
              style={{ marginLeft: "auto", background: "#92400e", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Show oldest first
            </button>
          </div>
        )}

        {/* Pipeline summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))", gap: 8, marginBottom: 24 }}>
          {STAGES.map(s => (
            <button key={s.id} onClick={() => setFilterStage(filterStage === s.id ? "all" : s.id)}
              style={{
                background: filterStage === s.id ? s.color : "#fff",
                border: `1px solid ${filterStage === s.id ? s.color : "#e2e8f0"}`,
                borderRadius: 8, padding: "10px 8px", cursor: "pointer", textAlign: "left",
                transition: "all 0.15s"
              }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: filterStage === s.id ? "rgba(255,255,255,0.7)" : "#94a3b8", marginBottom: 2 }}>{s.id}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: filterStage === s.id ? "#fff" : s.color, lineHeight: 1 }}>{stageCounts[s.id]}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: filterStage === s.id ? "rgba(255,255,255,0.85)" : "#64748b", marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search songs, artists, collabs..."
            style={{
              flex: 1, minWidth: 200, padding: "8px 12px", border: "1px solid #e2e8f0",
              borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff"
            }} />
          <select value={filterPitch} onChange={e => setFilterPitch(e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "#fff", color: "#0f172a" }}>
            <option value="all">All targets</option>
            {PITCH_TARGETS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "#fff", color: "#0f172a" }}>
            <option value="stale">Sort: Most stale</option>
            <option value="stage">Sort: Stage 01 → 99</option>
            <option value="newest">Sort: Newest first</option>
            <option value="title">Sort: A–Z</option>
          </select>
        </div>

        {/* Song table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: "#64748b" }}>
              {songs.length === 0 ? "No songs yet" : "No songs match"}
            </div>
            <div style={{ fontSize: 13 }}>
              {songs.length === 0 ? "Hit + Add Song to get started" : "Try adjusting your filters"}
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1.2fr 90px 1fr 1.2fr 65px 55px",
              padding: "10px 16px", background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0", gap: 12
            }}>
              {["Title", "Stage", "BPM / Key", "Collaborators", "Targets", "Stale", "Disco"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
              ))}
            </div>

            {filtered.map((song, i) => {
              const days = daysSince(song.lastUpdated);
              const isStale = days !== null && days >= 14;
              const activeStage = ACTIVE_STAGES.includes(song.stage);
              const targets = song.pitchTargets || [];
              return (
                <div key={song.id} onClick={() => setModal(song)}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1.2fr 90px 1fr 1.2fr 65px 55px",
                    padding: "12px 16px", gap: 12, alignItems: "center",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                    cursor: "pointer", background: isStale && activeStage ? "#fffdf5" : "#fff",
                    transition: "background 0.1s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = isStale && activeStage ? "#fffdf5" : "#fff"}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{song.title || "Untitled"}</div>
                    {song.artist && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>for {song.artist}</div>}
                  </div>
                  <div><StageTag stageId={song.stage} /></div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {song.bpm && <span style={{ fontFamily: "monospace" }}>{song.bpm}</span>}
                    {song.bpm && song.key && <span style={{ color: "#cbd5e1" }}> / </span>}
                    {song.key && <span>{song.key}</span>}
                    {!song.bpm && !song.key && <span style={{ color: "#cbd5e1" }}>—</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {song.collaborators || <span style={{ color: "#cbd5e1" }}>—</span>}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {targets.length === 0
                      ? <span style={{ color: "#cbd5e1", fontSize: 11 }}>—</span>
                      : targets.map(t => (
                        <span key={t} style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 10,
                          background: "#f1f5f9", color: "#475569"
                        }}>{t}</span>
                      ))}
                  </div>
                  <div><StaleBadge days={days} /></div>
                  <div style={{ textAlign: "center" }}>
                    {song.discoStatus
                      ? <span style={{ fontSize: 14, color: "#1d4ed8" }}>✓</span>
                      : <span style={{ color: "#e2e8f0", fontSize: 14 }}>○</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 11, color: "#cbd5e1", textAlign: "center" }}>
          Your data is saved automatically in this browser · Your songs, your pipeline.
        </div>
      </div>

      {modal && (
        <Modal song={modal} onSave={saveSong} onClose={() => setModal(null)} onDelete={deleteSong} />
      )}
    </div>
  );
}
