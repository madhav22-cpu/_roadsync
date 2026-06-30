import React, { useState, useRef } from "react";
import { CivicIssue } from "../types";
import IssueList from "./IssueList";
import IssueDetails from "./IssueDetails";
import DashboardMetrics from "./DashboardMetrics";
import { RotateCw, AlertCircle } from "lucide-react";
import { T } from "../styles/tokens";
import { useLanguage } from "../contexts/LanguageContext";

interface HomeScreenProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string) => void;
  userReportsCount: number;
  userResolvedCount: number;
  userTrustScore: number;
  myIssues: CivicIssue[];
  isLoading: boolean;
  errorStatus: string | null;
  fetchIssues: () => void;
  selectedIssue: CivicIssue | null;
  handleUpvote: (id: string) => void;
  handleStatusChange: (id: string, status: any) => void;
  handleVerify: (id: string) => void;
  handleFlagDuplicate: (id: string) => void;
  handleAddComment: (id: string, author: string, text: string) => void;
  userSessionId: string;
  theme: "light" | "dark";
  card: React.CSSProperties;
  EmptyState: ({ emoji, title, desc }: { emoji: string; title: string; desc: string }) => React.ReactNode;
  userName?: string;
  userAvatar?: string;
  userArea?: string;
}

export default function HomeScreen({
  issues, selectedIssueId, setSelectedIssueId, userReportsCount, userResolvedCount,
  userTrustScore, myIssues, isLoading, errorStatus, fetchIssues, selectedIssue,
  handleUpvote, handleStatusChange, handleVerify, handleFlagDuplicate, handleAddComment,
  userSessionId, theme, card, EmptyState,
  userName = "Madhav Sharma",
}: HomeScreenProps) {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startX    = useRef(0);

  const SECTIONS = [
    { id: "feed",    label: t("home.feedTab"),    emoji: "📋" },
    { id: "detail",  label: t("home.detailTab"),  emoji: "🔍" },
    { id: "metrics", label: t("home.metricsTab"), emoji: "📊" },
  ];

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= SECTIONS.length) return;
    setActiveSection(idx);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: idx * sliderRef.current.offsetWidth, behavior: "smooth" });
    }
  };

  const onScroll = () => {
    if (!sliderRef.current) return;
    const idx = Math.round(sliderRef.current.scrollLeft / sliderRef.current.offsetWidth);
    setActiveSection(idx);
  };

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? activeSection + 1 : activeSection - 1);
  };

  const handleSelectIssue = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    goTo(1);
  };

  const slideStyle: React.CSSProperties = {
    minWidth: "100%", maxWidth: "100%", flexShrink: 0,
    scrollSnapAlign: "start", scrollSnapStop: "always",
    overflowY: "auto", overflowX: "hidden",
    padding: "0 16px 100px", boxSizing: "border-box",
  };

  const statItems = [
    { label: t("stats.reports"),  value: userReportsCount,  color: T.peach },
    { label: t("stats.resolved"), value: userResolvedCount, color: T.mint  },
    { label: t("home.rank"),      value: myIssues.length >= 5 ? t("home.pro") : t("home.citizen"), color: T.periwinkle },
  ];

  const metricItems = [
    { label: t("stats.totalIssues"),  value: issues.length,                                         color: T.violetMid, emoji: "📋" },
    { label: t("stats.resolved"),     value: issues.filter(i => i.status === "resolved").length,    color: "#2E7D5E",   emoji: "✅" },
    { label: t("stats.inProgress"),   value: issues.filter(i => i.status === "in_progress").length, color: "#1A5F9E",   emoji: "🔧" },
    { label: t("stats.critical"),     value: issues.filter(i => i.severity === "critical").length,  color: "#C0392B",   emoji: "🚨" },
    { label: t("stats.myReports"),    value: myIssues.length,                                       color: T.violet,    emoji: "👤" },
    { label: t("stats.verified"),     value: issues.filter(i => i.status === "verified").length,    color: "#E8A020",   emoji: "🛡️" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: T.bg, overflow: "hidden", fontFamily: "'Nunito', sans-serif" }}>
      {/* ── Hero ── */}
      <div style={{ padding: "12px 16px 8px", flexShrink: 0 }}>
        <div style={{ borderRadius: 24, padding: "18px 20px", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${T.violet} 0%, ${T.violetMid} 100%)`, boxShadow: "0 4px 20px rgba(74,44,106,0.25)" }}>
          <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: T.rose, opacity: 0.18, top: -50, right: -40, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.rose, textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6, margin: "0 0 4px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.rose, display: "inline-block", flexShrink: 0 }} />
                {t("home.registry")}
              </p>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2, wordBreak: "break-word" }}>
                {t("home.greeting")}, {userName.split(" ")[0]}! 👋
              </h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "4px 0 0" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
              <div style={{ padding: "5px 10px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.mint, display: "inline-block" }} />
                {userTrustScore}% {t("home.verified")}
              </div>
              <button onClick={fetchIssues} style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <RotateCw style={{ width: 14, height: 14, color: isLoading ? T.peach : "rgba(255,255,255,0.7)" }} />
              </button>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.15)", position: "relative", zIndex: 1 }}>
            {statItems.map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 8px", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)" }}>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: "2px 0 0" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section Tabs ── */}
      <div style={{ padding: "6px 16px 10px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, width: "100%", boxSizing: "border-box" }}>
        {SECTIONS.map((sec, idx) => (
          <button key={sec.id} onClick={() => goTo(idx)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            padding: "7px 6px", borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: "pointer",
            border: "none", fontFamily: "inherit", transition: "all 0.2s",
            background: activeSection === idx ? T.violet : T.surface,
            color: activeSection === idx ? "#fff" : T.textMid,
            boxShadow: activeSection === idx ? "0 3px 12px rgba(74,44,106,0.3)" : "0 1px 4px rgba(74,44,106,0.06)",
            whiteSpace: "nowrap", minWidth: 0, overflow: "hidden",
          }}>
            <span style={{ flexShrink: 0 }}>{sec.emoji}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{sec.label}</span>
          </button>
        ))}
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0, paddingLeft: 2 }}>
          {SECTIONS.map((_, idx) => (
            <button key={idx} onClick={() => goTo(idx)} style={{
              borderRadius: 999, height: 6, border: "none", cursor: "pointer", transition: "all 0.3s",
              width: activeSection === idx ? 14 : 6,
              background: activeSection === idx ? T.violet : T.border,
              padding: 0, flexShrink: 0,
            }} />
          ))}
        </div>
      </div>

      {/* ── Horizontal Slider ── */}
      <div ref={sliderRef} onScroll={onScroll} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        style={{ display: "flex", overflowX: "scroll", overflowY: "hidden", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" as any, flex: "1 1 0%", minHeight: 0, width: "100%", alignItems: "stretch", scrollbarWidth: "none", msOverflowStyle: "none" as any }}>

        {/* FEED */}
        <div style={slideStyle}>
          <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: 16, minHeight: "100%", boxShadow: "0 2px 12px rgba(74,44,106,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, marginBottom: 14, borderBottom: `1px solid ${T.border}` }}>
              <div>
                <h2 style={{ fontSize: 11, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{t("home.activeHazards")}</h2>
                <p style={{ fontSize: 10, color: T.textLight, margin: "2px 0 0" }}>{t("home.tapToDetail")}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.textMid, background: T.surfaceAlt, padding: "3px 10px", borderRadius: 10, border: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>
                {issues.length} {t("home.logged")}
              </span>
            </div>
            {isLoading && issues.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.violet, animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 12, color: T.textLight }}>{t("home.loading")}</p>
              </div>
            ) : errorStatus ? (
              <div style={{ textAlign: "center", padding: "40px 24px", borderRadius: 16, background: "#FFE8E8", border: "1px solid #F5C6C6" }}>
                <AlertCircle style={{ width: 28, height: 28, color: "#C0392B", marginBottom: 8 }} />
                <p style={{ fontSize: 12, color: "#C0392B", fontWeight: 600, margin: "0 0 12px" }}>{errorStatus}</p>
                <button onClick={fetchIssues} style={{ padding: "6px 16px", borderRadius: 10, fontSize: 11, fontWeight: 700, color: "#C0392B", border: "1px solid #F5C6C6", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>{t("home.retry")}</button>
              </div>
            ) : (
              <IssueList issues={issues} selectedIssueId={selectedIssueId} onSelectIssue={handleSelectIssue} onUpvoteIssue={handleUpvote} userSessionId={userSessionId} theme={theme} />
            )}
          </div>
        </div>

        {/* DETAIL */}
        <div style={slideStyle}>
          {selectedIssue ? (
            <IssueDetails issue={selectedIssue} onUpvote={handleUpvote} onStatusChange={handleStatusChange} onVerify={handleVerify} onFlagDuplicate={handleFlagDuplicate} onAddComment={handleAddComment} userSessionId={userSessionId} theme={theme} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center", padding: 40, background: T.surface, borderRadius: 20, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>📌</span>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.textMid, marginBottom: 6 }}>{t("home.noIssue")}</p>
              <p style={{ fontSize: 12, color: T.textLight, maxWidth: 200, lineHeight: 1.5, margin: "0 0 20px" }}>{t("home.swipeHint")}</p>
              <button onClick={() => goTo(0)} style={{ padding: "10px 22px", borderRadius: 14, fontSize: 12, fontWeight: 700, color: "#fff", background: T.violet, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 12px rgba(74,44,106,0.3)" }}>
                {t("home.goFeed")}
              </button>
            </div>
          )}
        </div>

        {/* METRICS */}
        <div style={slideStyle}>
          <DashboardMetrics issues={issues} theme={theme} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            {metricItems.map((s) => (
              <div key={s.label} style={{ background: T.surface, borderRadius: 18, padding: 16, border: `1px solid ${T.border}`, boxShadow: "0 1px 6px rgba(74,44,106,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{s.emoji}</span>
                  <span style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
                <p style={{ fontSize: 9, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
