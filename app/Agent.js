"use client";
import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { id: "interested", label: "💡 Interested", color: "#7eb8ff" },
  { id: "applied",    label: "📤 Applied",    color: "#f0c060" },
  { id: "interview",  label: "🎯 Interview",  color: "#63d9b4" },
  { id: "offer",      label: "🎉 Offer",      color: "#c080ff" },
];

const LEVELS = ["Any Level", "Entry-Level", "Mid-Level", "Senior", "Staff / Principal"];

const ROLE_CHIPS = [
  "AI Engineer",
  "ML Engineer",
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "DevOps Engineer",
  "UX Designer",
  "Data Analyst",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const jKey = (job) => `${job.company}||${job.role}`;
const fitColor = (s) =>
  s == null ? null : s >= 80 ? "#63d9b4" : s >= 60 ? "#f0c060" : "#ff8080";
const cacheKey = ({ role, location, level }) =>
  `${role}|${location}|${level}`.toLowerCase().trim();
const timeAgo = (ts) => {
  const d = Date.now() - ts;
  if (d < 60000) return "just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
};

// ─── ActionPanel ──────────────────────────────────────────────────────────────

const ActionPanel = ({ action, loading, content }) => {
  const [copied, setCopied] = useState(false);
  const labels = {
    "cold-dm": "✉️ Cold DM",
    "cover-letter": "📄 Cover Letter",
    "interview-prep": "🎤 Interview Prep",
  };
  return (
    <div
      style={{
        marginTop: "12px",
        padding: "14px 16px",
        background: "rgba(99,217,180,0.05)",
        border: "1px solid rgba(99,217,180,0.18)",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#63d9b4",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {labels[action]}
        </span>
        {!loading && content && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              background: "none",
              border: "none",
              color: copied ? "#63d9b4" : "#5a7a9a",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
      {loading ? (
        <div style={{ display: "flex", gap: "4px", padding: "4px 0" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#63d9b4",
                animation: `pulse 1.2s ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      ) : (
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "12.5px",
            lineHeight: 1.7,
            color: "#c0d8f0",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {content}
        </pre>
      )}
    </div>
  );
};

// ─── JobCard ──────────────────────────────────────────────────────────────────

const JobCard = ({
  job,
  index = 0,
  isSaved,
  onToggleSave,
  pipelineStage,
  onAddToPipeline,
  userProfile,
}) => {
  const [activeAction, setActiveAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionContent, setActionContent] = useState("");

  const runAction = async (action) => {
    if (activeAction === action && !actionLoading) {
      setActiveAction(null);
      return;
    }
    setActiveAction(action);
    setActionLoading(true);
    setActionContent("");
    try {
      const res = await fetch("/api/job-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, action, userProfile }),
      });
      const data = await res.json();
      setActionContent(data.content || "");
    } catch {
      setActionContent("Error generating content. Please try again.");
    }
    setActionLoading(false);
  };

  const score = job.fitScore;
  const color = fitColor(score);
  const pipelineLabel = PIPELINE_STAGES.find((s) => s.id === pipelineStage)?.label;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: isSaved
          ? "1px solid rgba(255,120,120,0.3)"
          : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "16px 20px",
        animation: `fadeSlideIn 0.4s ease ${index * 0.06}s both`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              color: "#f0f4ff",
            }}
          >
            {job.company}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#63d9b4",
              fontWeight: 500,
              marginTop: "2px",
            }}
          >
            {job.role}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexShrink: 0,
            marginLeft: "12px",
          }}
        >
          {color && (
            <div
              title={job.fitReason || ""}
              style={{
                background: `${color}15`,
                border: `1px solid ${color}35`,
                borderRadius: "20px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: 700,
                color,
                fontFamily: "'DM Mono', monospace",
                cursor: "default",
                whiteSpace: "nowrap",
              }}
            >
              {score}% fit
            </div>
          )}
          <button
            onClick={onToggleSave}
            title={isSaved ? "Remove from saved" : "Save job"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "17px",
              padding: "2px 4px",
              lineHeight: 1,
              transition: "transform 0.15s",
              outline: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isSaved ? "❤️" : "🤍"}
          </button>
          {job.link && job.link !== "#" && (
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "11px",
                color: "#7eb8ff",
                textDecoration: "none",
                background: "rgba(126,184,255,0.1)",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "1px solid rgba(126,184,255,0.2)",
                whiteSpace: "nowrap",
              }}
            >
              View →
            </a>
          )}
        </div>
      </div>

      {/* Meta */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          fontSize: "12px",
          color: "#7a8a9a",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <span>📍 {job.location}</span>
        {job.posted && <span>🕐 {job.posted}</span>}
        {job.level && <span style={{ color: "#a0b8d0" }}>🎯 {job.level}</span>}
      </div>

      {/* Fit reason */}
      {job.fitReason && (
        <div
          style={{
            fontSize: "12px",
            color: color || "#8a9ab0",
            background: `${color || "#8a9ab0"}10`,
            padding: "7px 10px",
            borderRadius: "7px",
            marginBottom: "12px",
            lineHeight: 1.5,
          }}
        >
          {job.fitReason}
        </div>
      )}

      {/* Summary (only when no fit reason) */}
      {job.summary && !job.fitReason && (
        <div
          style={{
            fontSize: "12px",
            color: "#8a9ab0",
            lineHeight: 1.6,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "10px",
            marginBottom: "10px",
          }}
        >
          {job.summary}
        </div>
      )}

      {/* Action bar */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "10px",
        }}
      >
        {[
          { id: "cold-dm", label: "✉️ Cold DM" },
          { id: "cover-letter", label: "📄 Cover Letter" },
          { id: "interview-prep", label: "🎤 Interview Prep" },
        ].map((a) => (
          <button
            key={a.id}
            onClick={() => runAction(a.id)}
            style={{
              background:
                activeAction === a.id
                  ? "rgba(99,217,180,0.12)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                activeAction === a.id
                  ? "rgba(99,217,180,0.3)"
                  : "rgba(255,255,255,0.08)"
              }`,
              borderRadius: "20px",
              padding: "5px 12px",
              fontSize: "11px",
              color: activeAction === a.id ? "#63d9b4" : "#8a9ab0",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
            }}
          >
            {a.label}
          </button>
        ))}
        <button
          onClick={() => onAddToPipeline(job)}
          style={{
            background: pipelineStage
              ? "rgba(126,184,255,0.1)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${
              pipelineStage ? "rgba(126,184,255,0.3)" : "rgba(255,255,255,0.08)"
            }`,
            borderRadius: "20px",
            padding: "5px 12px",
            fontSize: "11px",
            color: pipelineStage ? "#7eb8ff" : "#8a9ab0",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
            marginLeft: "auto",
            outline: "none",
          }}
        >
          {pipelineStage ? `📌 ${pipelineLabel}` : "+ Pipeline"}
        </button>
      </div>

      {activeAction && (
        <ActionPanel
          action={activeAction}
          loading={actionLoading}
          content={actionContent}
        />
      )}
    </div>
  );
};

// ─── PipelineBoard ────────────────────────────────────────────────────────────

const PipelineBoard = ({ pipeline, onMoveStage, onRemove }) => {
  const entries = Object.values(pipeline);

  if (entries.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#3a5a7a",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            marginBottom: "8px",
            color: "#4a6a8a",
          }}
        >
          Pipeline Empty
        </div>
        <div style={{ fontSize: "13px" }}>
          Click "+ Pipeline" on any job card to start tracking your applications
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        alignItems: "start",
      }}
    >
      {PIPELINE_STAGES.map((stage, si) => {
        const stageEntries = entries.filter((e) => e.stage === stage.id);
        return (
          <div
            key={stage.id}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  color: stage.color,
                }}
              >
                {stage.label}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#3a5a7a",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "10px",
                  padding: "2px 8px",
                }}
              >
                {stageEntries.length}
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {stageEntries.map(({ job }, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${stage.color}22`,
                    borderRadius: "10px",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#f0f4ff",
                      marginBottom: "2px",
                      lineHeight: 1.3,
                    }}
                  >
                    {job.company}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#63d9b4",
                      marginBottom: "4px",
                    }}
                  >
                    {job.role}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#4a6a8a",
                      marginBottom: "10px",
                    }}
                  >
                    📍 {job.location}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() =>
                        si > 0 && onMoveStage(job, PIPELINE_STAGES[si - 1].id)
                      }
                      disabled={si === 0}
                      title="Move back"
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        padding: "4px",
                        fontSize: "13px",
                        color: si === 0 ? "#1a2a3a" : "#6a8aa0",
                        cursor: si === 0 ? "default" : "pointer",
                        outline: "none",
                      }}
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        si < PIPELINE_STAGES.length - 1 &&
                        onMoveStage(job, PIPELINE_STAGES[si + 1].id)
                      }
                      disabled={si === PIPELINE_STAGES.length - 1}
                      title="Move forward"
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        padding: "4px",
                        fontSize: "13px",
                        color:
                          si === PIPELINE_STAGES.length - 1
                            ? "#1a2a3a"
                            : "#6a8aa0",
                        cursor:
                          si === PIPELINE_STAGES.length - 1
                            ? "default"
                            : "pointer",
                        outline: "none",
                      }}
                    >
                      →
                    </button>
                    <button
                      onClick={() => onRemove(job)}
                      title="Remove from pipeline"
                      style={{
                        background: "rgba(255,80,80,0.06)",
                        border: "1px solid rgba(255,80,80,0.15)",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "13px",
                        color: "#ff7070",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── PostDisplay ──────────────────────────────────────────────────────────────

const PostDisplay = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(99,217,180,0.06), rgba(126,184,255,0.06))",
        border: "1px solid rgba(99,217,180,0.25)",
        borderRadius: "14px",
        padding: "20px 22px",
        animation: "fadeSlideIn 0.5s ease both",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            color: "#63d9b4",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          ✨ Suggested LinkedIn Post
        </span>
        <button
          onClick={copy}
          style={{
            background: copied
              ? "rgba(99,217,180,0.2)"
              : "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: copied ? "#63d9b4" : "#a0b0c0",
            padding: "5px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
            outline: "none",
          }}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "13.5px",
          lineHeight: 1.75,
          color: "#d8e8f0",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {text}
      </pre>
    </div>
  );
};

// ─── Main Agent ───────────────────────────────────────────────────────────────

export default function Agent() {
  const [view, setView] = useState("dashboard");
  const [userProfile, setUserProfile] = useState({
    name: "",
    field: "",
    skills: "",
    experience: "",
  });
  const [searchForm, setSearchForm] = useState({
    role: "",
    location: "",
    level: "Any Level",
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCache, setSearchCache] = useState({});
  const [currentCacheKey, setCurrentCacheKey] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [cityFilter, setCityFilter] = useState("");
  const [suggestedPost, setSuggestedPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [dashboardRole, setDashboardRole] = useState("");

  // ── Persistence effects ──
  useEffect(() => {
    try {
      setSavedJobs(JSON.parse(localStorage.getItem("savedJobs") || "[]"));
    } catch {}
    try {
      setPipeline(JSON.parse(localStorage.getItem("pipeline") || "{}"));
    } catch {}
    try {
      setSearchHistory(
        JSON.parse(sessionStorage.getItem("searchHistory") || "[]")
      );
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    localStorage.setItem("pipeline", JSON.stringify(pipeline));
  }, [pipeline]);

  useEffect(() => {
    sessionStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  // ── Search ──
  const runSearch = async (params, forceRefresh = false) => {
    const key = cacheKey(params);

    if (!forceRefresh && searchCache[key]) {
      setCurrentCacheKey(key);
      setView("search");
      return;
    }

    setSearchLoading(true);
    setCurrentCacheKey(key);
    setView("search");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, userProfile }),
      });
      const data = await res.json();
      const jobs = data.jobs || [];

      setSearchCache((prev) => ({
        ...prev,
        [key]: {
          jobs,
          summary: data.summary || "",
          timestamp: Date.now(),
          params,
        },
      }));

      setSearchHistory((prev) => {
        const filtered = prev.filter((h) => h.key !== key);
        return [
          { key, params, timestamp: Date.now(), count: jobs.length },
          ...filtered,
        ].slice(0, 8);
      });
    } catch (err) {
      console.error(err);
    }
    setSearchLoading(false);
  };

  const handleSearchSubmit = () => {
    if (!searchForm.role.trim()) return;
    runSearch(searchForm);
  };

  const handleChipClick = (chipRole) => {
    const params = { ...searchForm, role: chipRole };
    setSearchForm(params);
    runSearch(params);
  };

  // ── Saved ──
  const isJobSaved = (job) => savedJobs.some((j) => jKey(j) === jKey(job));
  const toggleSaveJob = (job) => {
    setSavedJobs((prev) =>
      isJobSaved(job)
        ? prev.filter((j) => jKey(j) !== jKey(job))
        : [...prev, job]
    );
  };

  // ── Pipeline ──
  const getPipelineStage = (job) => pipeline[jKey(job)]?.stage ?? null;

  const addToPipeline = (job) => {
    const key = jKey(job);
    if (pipeline[key]) {
      setPipeline((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    } else {
      setPipeline((prev) => ({ ...prev, [key]: { stage: "interested", job } }));
      setView("pipeline");
    }
  };

  const movePipelineStage = (job, stage) => {
    const key = jKey(job);
    setPipeline((prev) => ({ ...prev, [key]: { ...prev[key], stage } }));
  };

  const removeFromPipeline = (job) => {
    setPipeline((prev) => {
      const n = { ...prev };
      delete n[jKey(job)];
      return n;
    });
  };

  // ── Filter ──
  const filterByCity = (list) =>
    cityFilter.trim()
      ? list.filter((j) =>
          j.location?.toLowerCase().includes(cityFilter.toLowerCase())
        )
      : list;

  // ── Post ──
  const generatePost = async () => {
    setPostLoading(true);
    setSuggestedPost("");
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: currentJobs, userProfile }),
      });
      const data = await res.json();
      setSuggestedPost(data.content || "");
    } catch (err) {
      console.error(err);
    }
    setPostLoading(false);
  };

  // ── History helpers ──
  const removeFromHistory = (key) => {
    setSearchHistory((prev) => prev.filter((h) => h.key !== key));
  };

  const loadHistoryItem = (item) => {
    setSearchForm(item.params);
    runSearch(item.params);
  };

  // ── Computed ──
  const currentResult = currentCacheKey ? searchCache[currentCacheKey] : null;
  const currentJobs = currentResult?.jobs || [];
  const filteredJobs = filterByCity(currentJobs);
  const filteredSaved = filterByCity(savedJobs);
  const pipelineCount = Object.keys(pipeline).length;
  const totalJobsFound = Object.values(searchCache).reduce(
    (sum, r) => sum + r.jobs.length,
    0
  );

  const isCached =
    currentResult && Date.now() - currentResult.timestamp > 30000;

  // ─── Nav items ──────────────────────────────────────────────────────────────

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "search",    icon: "🔍", label: "Search" },
    { id: "saved",     icon: "❤️",  label: "Saved",    badge: savedJobs.length || null },
    { id: "pipeline",  icon: "📋", label: "Pipeline",  badge: pipelineCount || null },
    { id: "post",      icon: "✍️",  label: "Post" },
  ];

  // ─── Shared input style ─────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "8px 10px",
    color: "#d0e0f0",
    fontSize: "12px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius:4px; }
        input, select, button, textarea { outline: none; }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          height: "100vh",
          background:
            "linear-gradient(135deg, #080e1a 0%, #0d1625 50%, #0a1520 100%)",
          fontFamily: "'DM Sans', sans-serif",
          color: "#e0eaf5",
          overflow: "hidden",
        }}
      >
        {/* ── SIDEBAR ── */}
        <aside
          style={{
            background: "rgba(0,0,0,0.2)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* Logo */}
          <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "9px",
                  background: "linear-gradient(135deg, #0077b5, #63d9b4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                💼
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: "13px",
                    color: "#f0f4ff",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Job Intelligence
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#3a5a7a",
                    letterSpacing: "0.03em",
                  }}
                >
                  Powered by Claude AI
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {navItems.map((item) => {
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    width: "100%",
                    padding: "9px 10px",
                    borderRadius: "8px",
                    border: "none",
                    background: isActive
                      ? "rgba(99,217,180,0.1)"
                      : "transparent",
                    color: isActive ? "#63d9b4" : "#5a7a9a",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                    textAlign: "left",
                    marginBottom: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: "15px", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge ? (
                    <span
                      style={{
                        background: isActive
                          ? "rgba(99,217,180,0.2)"
                          : "rgba(255,255,255,0.08)",
                        color: isActive ? "#63d9b4" : "#6a8aa0",
                        borderRadius: "10px",
                        padding: "1px 7px",
                        fontSize: "10px",
                        fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Profile */}
          <div style={{ padding: "14px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                color: "#63d9b4",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Your Profile
            </div>
            {[
              { key: "name",       placeholder: "Your name" },
              { key: "field",      placeholder: "Field / Role" },
              { key: "skills",     placeholder: "Top skills" },
              { key: "experience", placeholder: "Experience level" },
            ].map((f) => (
              <input
                key={f.key}
                value={userProfile[f.key]}
                onChange={(e) =>
                  setUserProfile((p) => ({ ...p, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                style={{ ...inputStyle, marginBottom: "6px" }}
              />
            ))}
          </div>

          {/* Recent Searches */}
          <div style={{ padding: "14px 12px", flex: 1 }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                color: "#63d9b4",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Recent Searches
            </div>
            {searchHistory.length === 0 ? (
              <div
                style={{
                  fontSize: "11px",
                  color: "#2a4a6a",
                  fontFamily: "'DM Mono', monospace",
                  lineHeight: 1.5,
                }}
              >
                No searches yet
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                {searchHistory.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <button
                      onClick={() => loadHistoryItem(item)}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "7px",
                        padding: "7px 8px",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.07)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)")
                      }
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#c0d0e0",
                          fontWeight: 500,
                          lineHeight: 1.3,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.params.role || "Any"} ·{" "}
                        {item.params.location || "Any"}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#3a5a7a",
                          marginTop: "1px",
                        }}
                      >
                        {item.count} jobs · {timeAgo(item.timestamp)}
                      </div>
                    </button>
                    <button
                      onClick={() => removeFromHistory(item.key)}
                      title="Remove"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2a4a6a",
                        cursor: "pointer",
                        fontSize: "13px",
                        padding: "4px",
                        lineHeight: 1,
                        flexShrink: 0,
                        borderRadius: "4px",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#ff7070")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#2a4a6a")
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            padding: "28px 32px",
          }}
        >
          {/* ── DASHBOARD ── */}
          {view === "dashboard" && (
            <div style={{ animation: "fadeSlideIn 0.4s ease both" }}>
              {/* Greeting */}
              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: "26px",
                    color: "#f0f4ff",
                    marginBottom: "6px",
                  }}
                >
                  {userProfile.name ? `Hi ${userProfile.name}!` : "Welcome!"}
                </div>
                <div style={{ fontSize: "14px", color: "#5a7a9a" }}>
                  Ready to find your next role?
                </div>
              </div>

              {/* Quick search bar */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "28px",
                }}
              >
                <input
                  value={dashboardRole}
                  onChange={(e) => setDashboardRole(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && dashboardRole.trim()) {
                      const params = {
                        ...searchForm,
                        role: dashboardRole.trim(),
                      };
                      setSearchForm(params);
                      runSearch(params);
                    }
                  }}
                  placeholder="Search for a role (e.g. AI Engineer, Product Manager)..."
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    color: "#d0e0f0",
                    fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    if (!dashboardRole.trim()) return;
                    const params = {
                      ...searchForm,
                      role: dashboardRole.trim(),
                    };
                    setSearchForm(params);
                    runSearch(params);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #0077b5, #63d9b4)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 22px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  Search
                </button>
              </div>

              {/* Stats cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "14px",
                  marginBottom: "28px",
                }}
              >
                {[
                  {
                    label: "Jobs Found",
                    value: totalJobsFound,
                    icon: "🔍",
                    sub: "this session",
                  },
                  {
                    label: "Saved",
                    value: savedJobs.length,
                    icon: "❤️",
                    sub: "locally stored",
                  },
                  {
                    label: "In Pipeline",
                    value: pipelineCount,
                    icon: "📋",
                    sub: "being tracked",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      padding: "18px 20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "22px",
                        marginBottom: "6px",
                      }}
                    >
                      {card.icon}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: "28px",
                        color: "#f0f4ff",
                        lineHeight: 1,
                        marginBottom: "4px",
                      }}
                    >
                      {card.value}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#c0d0e0",
                        fontWeight: 500,
                      }}
                    >
                      {card.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "#3a5a7a", marginTop: "2px" }}>
                      {card.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pipeline snapshot */}
              {pipelineCount > 0 && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    padding: "18px 20px",
                    marginBottom: "28px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#c0d0e0",
                      marginBottom: "14px",
                    }}
                  >
                    📋 Pipeline Snapshot
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {PIPELINE_STAGES.map((stage) => {
                      const count = Object.values(pipeline).filter(
                        (e) => e.stage === stage.id
                      ).length;
                      const pct = pipelineCount
                        ? Math.round((count / pipelineCount) * 100)
                        : 0;
                      return (
                        <div key={stage.id}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "5px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: stage.color,
                                fontWeight: 600,
                              }}
                            >
                              {stage.label}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#4a6a8a",
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {count}
                            </span>
                          </div>
                          <div
                            style={{
                              height: "4px",
                              background: "rgba(255,255,255,0.06)",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: stage.color,
                                borderRadius: "4px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent searches */}
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#c0d0e0",
                    marginBottom: "12px",
                  }}
                >
                  Recent Searches
                </div>
                {searchHistory.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px 20px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      color: "#3a5a7a",
                      fontSize: "13px",
                    }}
                  >
                    No searches yet — use the search tab to get started.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {searchHistory.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 700,
                            fontSize: "13px",
                            color: "#f0f4ff",
                            marginBottom: "3px",
                          }}
                        >
                          {item.params.role || "Any Role"}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#5a7a9a",
                            marginBottom: "2px",
                          }}
                        >
                          📍 {item.params.location || "Any location"} ·{" "}
                          {item.params.level !== "Any Level"
                            ? item.params.level
                            : "Any level"}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#3a5a7a",
                            marginBottom: "12px",
                          }}
                        >
                          {item.count} jobs · {timeAgo(item.timestamp)}
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => loadHistoryItem(item)}
                            style={{
                              flex: 1,
                              background: "rgba(126,184,255,0.08)",
                              border: "1px solid rgba(126,184,255,0.2)",
                              borderRadius: "6px",
                              padding: "6px",
                              fontSize: "11px",
                              color: "#7eb8ff",
                              cursor: "pointer",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              runSearch(item.params, true)
                            }
                            title="Refresh results"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              fontSize: "13px",
                              color: "#6a8aa0",
                              cursor: "pointer",
                            }}
                          >
                            ↻
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SEARCH ── */}
          {view === "search" && (
            <div style={{ animation: "fadeSlideIn 0.3s ease both" }}>
              {/* Search form */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    value={searchForm.role}
                    onChange={(e) =>
                      setSearchForm((f) => ({ ...f, role: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchSubmit();
                    }}
                    placeholder="Role / Title (e.g. AI Engineer)"
                    style={{
                      flex: 1,
                      minWidth: "160px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#d0e0f0",
                      fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                    }}
                  />
                  <input
                    value={searchForm.location}
                    onChange={(e) =>
                      setSearchForm((f) => ({
                        ...f,
                        location: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchSubmit();
                    }}
                    placeholder="City (e.g. San Francisco)"
                    style={{
                      width: "200px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#d0e0f0",
                      fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                    }}
                  />
                  <select
                    value={searchForm.level}
                    onChange={(e) =>
                      setSearchForm((f) => ({ ...f, level: e.target.value }))
                    }
                    style={{
                      width: "150px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#d0e0f0",
                      fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {LEVELS.map((l) => (
                      <option
                        key={l}
                        value={l}
                        style={{ background: "#0d1625" }}
                      >
                        {l}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSearchSubmit}
                    disabled={searchLoading || !searchForm.role.trim()}
                    style={{
                      background:
                        searchLoading || !searchForm.role.trim()
                          ? "rgba(255,255,255,0.05)"
                          : "linear-gradient(135deg, #0077b5, #63d9b4)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 22px",
                      color:
                        searchLoading || !searchForm.role.trim()
                          ? "#4a6a8a"
                          : "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor:
                        searchLoading || !searchForm.role.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {searchLoading ? "Searching..." : "Find Jobs"}
                  </button>
                </div>

                {/* Role chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {ROLE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      disabled={searchLoading}
                      style={{
                        background:
                          searchForm.role === chip
                            ? "rgba(99,217,180,0.12)"
                            : "rgba(255,255,255,0.04)",
                        border: `1px solid ${
                          searchForm.role === chip
                            ? "rgba(99,217,180,0.3)"
                            : "rgba(255,255,255,0.08)"
                        }`,
                        borderRadius: "20px",
                        padding: "5px 13px",
                        fontSize: "11px",
                        color:
                          searchForm.role === chip ? "#63d9b4" : "#8a9ab0",
                        cursor: searchLoading ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              {searchLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "80px 20px",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      border: "3px solid rgba(99,217,180,0.2)",
                      borderTopColor: "#63d9b4",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <div style={{ color: "#63d9b4", fontSize: "14px" }}>
                    Searching LinkedIn...
                  </div>
                  <div style={{ color: "#3a5a7a", fontSize: "12px" }}>
                    This may take up to 30 seconds
                  </div>
                </div>
              ) : currentResult ? (
                <div>
                  {/* Status bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "#f0f4ff",
                      }}
                    >
                      ✅ {currentJobs.length} result
                      {currentJobs.length !== 1 ? "s" : ""} for "
                      {currentResult.params.role}"
                      {currentResult.params.location
                        ? ` in "${currentResult.params.location}"`
                        : ""}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: isCached
                          ? "rgba(126,184,255,0.1)"
                          : "rgba(99,217,180,0.1)",
                        border: `1px solid ${
                          isCached
                            ? "rgba(126,184,255,0.25)"
                            : "rgba(99,217,180,0.25)"
                        }`,
                        borderRadius: "20px",
                        padding: "3px 10px",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: isCached ? "#7eb8ff" : "#63d9b4",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {isCached
                        ? `💾 cached · ${timeAgo(currentResult.timestamp)}`
                        : "✨ fresh"}
                    </span>
                    <button
                      onClick={() =>
                        runSearch(currentResult.params, true)
                      }
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "11px",
                        color: "#6a8aa0",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      ↻ Refresh
                    </button>
                  </div>

                  {/* Summary */}
                  {currentResult.summary && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#5a7a9a",
                        lineHeight: 1.6,
                        marginBottom: "16px",
                        fontStyle: "italic",
                      }}
                    >
                      {currentResult.summary}
                    </div>
                  )}

                  {/* City filter */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ position: "relative", flex: 1 }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "13px",
                          color: "#5a7a9a",
                        }}
                      >
                        📍
                      </span>
                      <input
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        placeholder="Filter by city..."
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          borderRadius: "8px",
                          padding: "8px 12px 8px 30px",
                          color: "#d0e0f0",
                          fontSize: "13px",
                          fontFamily: "'DM Sans', sans-serif",
                          outline: "none",
                        }}
                      />
                    </div>
                    {cityFilter && (
                      <button
                        onClick={() => setCityFilter("")}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          color: "#8a9ab0",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {cityFilter && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#5a7a9a",
                        marginBottom: "12px",
                      }}
                    >
                      Showing {filteredJobs.length} of {currentJobs.length} jobs
                      in "{cityFilter}"
                    </div>
                  )}

                  {filteredJobs.length === 0 && cityFilter ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#4a6a8a",
                        fontSize: "14px",
                      }}
                    >
                      No jobs match "{cityFilter}"
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {filteredJobs.map((job, i) => (
                        <JobCard
                          key={jKey(job) + i}
                          job={job}
                          index={i}
                          isSaved={isJobSaved(job)}
                          onToggleSave={() => toggleSaveJob(job)}
                          pipelineStage={getPipelineStage(job)}
                          onAddToPipeline={addToPipeline}
                          userProfile={userProfile}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 20px",
                    color: "#3a5a7a",
                  }}
                >
                  <div style={{ fontSize: "42px", marginBottom: "14px" }}>
                    🔍
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "17px",
                      color: "#4a6a8a",
                      marginBottom: "8px",
                    }}
                  >
                    Find Your Next Role
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    Enter a role above or click a chip to get started
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SAVED ── */}
          {view === "saved" && (
            <div style={{ animation: "fadeSlideIn 0.3s ease both" }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "22px",
                  color: "#f0f4ff",
                  marginBottom: "6px",
                }}
              >
                ❤️ Saved Jobs
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#5a7a9a",
                  marginBottom: "20px",
                }}
              >
                {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
                · Stored locally
              </div>

              {savedJobs.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "13px",
                        color: "#5a7a9a",
                      }}
                    >
                      📍
                    </span>
                    <input
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      placeholder="Filter by city..."
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "8px",
                        padding: "8px 12px 8px 30px",
                        color: "#d0e0f0",
                        fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif",
                        outline: "none",
                      }}
                    />
                  </div>
                  {cityFilter && (
                    <button
                      onClick={() => setCityFilter("")}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        color: "#8a9ab0",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {savedJobs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#3a5a7a",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🤍
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "16px",
                      marginBottom: "8px",
                      color: "#4a6a8a",
                    }}
                  >
                    No Saved Jobs
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    Tap the heart icon on any job card to save it here
                  </div>
                </div>
              ) : filteredSaved.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#4a6a8a",
                    fontSize: "14px",
                  }}
                >
                  No saved jobs match "{cityFilter}"
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {filteredSaved.map((job, i) => (
                    <JobCard
                      key={jKey(job) + i}
                      job={job}
                      index={i}
                      isSaved={true}
                      onToggleSave={() => toggleSaveJob(job)}
                      pipelineStage={getPipelineStage(job)}
                      onAddToPipeline={addToPipeline}
                      userProfile={userProfile}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PIPELINE ── */}
          {view === "pipeline" && (
            <div style={{ animation: "fadeSlideIn 0.3s ease both" }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "22px",
                  color: "#f0f4ff",
                  marginBottom: "6px",
                }}
              >
                📋 Application Pipeline
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#5a7a9a",
                  marginBottom: "22px",
                }}
              >
                Track from interest to offer
              </div>
              <PipelineBoard
                pipeline={pipeline}
                onMoveStage={movePipelineStage}
                onRemove={removeFromPipeline}
              />
            </div>
          )}

          {/* ── POST ── */}
          {view === "post" && (
            <div style={{ animation: "fadeSlideIn 0.3s ease both" }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "22px",
                  color: "#f0f4ff",
                  marginBottom: "6px",
                }}
              >
                ✍️ LinkedIn Post
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#5a7a9a",
                  marginBottom: "24px",
                }}
              >
                Generate a tailored post based on your job search
              </div>

              {currentJobs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "14px",
                    color: "#3a5a7a",
                  }}
                >
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>
                    🔍
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "15px",
                      color: "#4a6a8a",
                      marginBottom: "8px",
                    }}
                  >
                    No jobs searched yet
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    Search for jobs first, then generate a tailored post
                  </div>
                </div>
              ) : (
                <div>
                  {/* Profile being used */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#63d9b4",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      Profile being used
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        flexWrap: "wrap",
                        fontSize: "12px",
                        color: "#8a9ab0",
                      }}
                    >
                      {userProfile.name && (
                        <span>
                          <span style={{ color: "#5a7a9a" }}>Name: </span>
                          {userProfile.name}
                        </span>
                      )}
                      {userProfile.field && (
                        <span>
                          <span style={{ color: "#5a7a9a" }}>Field: </span>
                          {userProfile.field}
                        </span>
                      )}
                      {userProfile.skills && (
                        <span>
                          <span style={{ color: "#5a7a9a" }}>Skills: </span>
                          {userProfile.skills}
                        </span>
                      )}
                      {userProfile.experience && (
                        <span>
                          <span style={{ color: "#5a7a9a" }}>Experience: </span>
                          {userProfile.experience}
                        </span>
                      )}
                      {!userProfile.name &&
                        !userProfile.field &&
                        !userProfile.skills &&
                        !userProfile.experience && (
                          <span style={{ color: "#3a5a7a" }}>
                            No profile filled in — add details in the sidebar
                            for a more personalized post
                          </span>
                        )}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#5a7a9a",
                      marginBottom: "14px",
                    }}
                  >
                    Based on {currentJobs.length} job
                    {currentJobs.length !== 1 ? "s" : ""} from "
                    {currentResult?.params.role}" search
                  </div>

                  <button
                    onClick={generatePost}
                    disabled={postLoading}
                    style={{
                      background: postLoading
                        ? "rgba(255,255,255,0.05)"
                        : "linear-gradient(135deg, #0077b5, #63d9b4)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 24px",
                      color: postLoading ? "#4a6a8a" : "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: postLoading ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {postLoading ? (
                      <>
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid rgba(255,255,255,0.2)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        Generating...
                      </>
                    ) : suggestedPost ? (
                      "Regenerate Post"
                    ) : (
                      "Generate Post"
                    )}
                  </button>

                  {suggestedPost && <PostDisplay text={suggestedPost} />}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
