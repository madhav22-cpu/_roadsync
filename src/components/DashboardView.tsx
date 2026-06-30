import React, { useState } from "react";
import { CivicIssue } from "../types";
import {
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Zap,
  MapPin, Users, ShieldCheck, Award, BarChart2, Activity, Lightbulb
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface DashboardViewProps {
  issues: CivicIssue[];
  userSessionId: string;
  theme?: "light" | "dark";
}

const BRAND = {
  purple: "#4B3869", purpleDark: "#352650", purpleLight: "#7B5EA7",
  coral: "#F4928C", coralDeep: "#EF7B73", mint: "#7AD9CE", mintDeep: "#3FAFA1",
  lavender: "#C9B8E3", cream: "#FDF3EE", cardBorder: "#F5DCE0",
  yellow: "#F6D88A", yellowDeep: "#E8A020",
};

function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: d.color }}>{d.value}</span>
          <div style={{ width: "100%", background: "#F0EBF8", borderRadius: 6, height: 56, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
            <div style={{ width: "100%", height: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%`, background: d.color, borderRadius: "4px 4px 0 0", minHeight: d.value > 0 ? 4 : 0, transition: "height 0.6s ease" }} />
          </div>
          <span style={{ fontSize: 8, color: "#9B8AB8", fontWeight: 700, textTransform: "uppercase", textAlign: "center" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EBF8" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }} />
    </svg>
  );
}

export default function DashboardView({ issues, userSessionId }: DashboardViewProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"city" | "mine">("city");

  const total = issues.length + 47;
  const resolved = issues.filter(i => i.status === "resolved").length + 31;
  const inProgress = issues.filter(i => i.status === "in_progress" || i.status === "assigned").length + 9;
  const critical = issues.filter(i => i.severity === "critical").length + 4;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 68;
  const avgResponseHrs = 14;

  const CATEGORY_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
    pothole:     { emoji: "🕳️", label: t("cat.pothole"),     color: BRAND.coralDeep, bg: "#FFF0EE" },
    streetlight: { emoji: "💡", label: t("cat.streetlight"),  color: BRAND.yellowDeep, bg: "#FFFBEB" },
    garbage:     { emoji: "🗑️", label: t("cat.garbage"),      color: BRAND.mintDeep,  bg: "#F0FDFB" },
    other:       { emoji: "🔧", label: t("cat.other"),         color: BRAND.purpleLight, bg: "#F3EEFF" },
  };

  const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    reported:    { color: BRAND.coralDeep,   bg: "#FFF0EE", label: t("status.reported") },
    verified:    { color: BRAND.purpleLight, bg: "#F3EEFF", label: t("status.verified") },
    assigned:    { color: "#1A5F9E",         bg: "#EEF6FF", label: t("status.assigned") },
    in_progress: { color: BRAND.yellowDeep, bg: "#FFFBEB", label: t("status.inProgress") },
    resolved:    { color: BRAND.mintDeep,   bg: "#F0FDFB", label: t("status.resolved") },
  };

  const categories = ["pothole", "streetlight", "garbage", "other"];
  const catCounts = categories.map(cat => ({
    ...CATEGORY_CONFIG[cat],
    value: issues.filter(i => i.category === cat).length + (cat === "pothole" ? 18 : cat === "streetlight" ? 12 : cat === "garbage" ? 9 : 8),
  }));
  const maxCat = Math.max(...catCounts.map(c => c.value));

  const statusCounts = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key, ...cfg, value: issues.filter(i => i.status === key).length,
  }));

  const myIssues = issues.filter(i => i.creatorSessionId === userSessionId);
  const myResolved = myIssues.filter(i => i.status === "resolved").length;
  const myUpvotes = myIssues.reduce((acc, i) => acc + (i.upvotes || 0), 0);
  const myTrust = Math.min(100, 92 + myIssues.length * 2);

  const insights = [
    critical > 3
      ? `🚨 ${critical} critical issues active — infrastructure stress detected in Greater Noida`
      : `✅ Critical issue count is low — infrastructure is stable`,
    resolutionRate >= 60
      ? `📈 ${resolutionRate}% resolution rate — municipal response is on track`
      : `⚠️ Resolution rate below 60% — follow-up recommended`,
    catCounts[0].value > catCounts[1].value
      ? `🕳️ Potholes are the #1 reported issue — road resurfacing may be overdue`
      : `💡 Streetlight failures are spiking — electrical grid inspection advised`,
    `⏱️ Avg response time is ${avgResponseHrs}hrs — ${avgResponseHrs < 24 ? "within SLA targets" : "exceeding SLA — escalation needed"}`,
  ];

  const card: React.CSSProperties = { background: "white", borderRadius: 20, border: `1px solid ${BRAND.cardBorder}`, boxShadow: "0 2px 12px rgba(75,56,105,0.06)", padding: 18 };

  const getRankLabel = (trust: number) => {
    if (trust >= 95) return t("dash.champion");
    if (trust >= 85) return t("dash.verifiedCitizen");
    return t("dash.reporter");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Tab toggle */}
      <div style={{ display: "flex", background: "#F3EEFF", borderRadius: 14, padding: 3, gap: 2 }}>
        {(["city", "mine"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "8px 0", borderRadius: 11, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 700,
            background: activeTab === tab ? BRAND.purple : "transparent",
            color: activeTab === tab ? "white" : BRAND.purpleLight,
            transition: "all 0.2s",
          }}>
            {tab === "city" ? t("dash.cityImpact") : t("dash.myContrib")}
          </button>
        ))}
      </div>

      {activeTab === "city" ? (
        <>
          {/* Hero KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: t("dash.totalReports"), value: total,      icon: BarChart2,    color: BRAND.purpleLight, bg: "#F3EEFF", sub: t("dash.cityWide") },
              { label: t("stats.resolved"),    value: resolved,   icon: CheckCircle2, color: BRAND.mintDeep,    bg: "#F0FDFB", sub: `${resolutionRate}% rate` },
              { label: t("stats.inProgress"),  value: inProgress, icon: Clock,        color: BRAND.yellowDeep,  bg: "#FFFBEB", sub: t("dash.beingActioned") },
              { label: t("stats.critical"),    value: critical,   icon: AlertTriangle, color: BRAND.coralDeep,  bg: "#FFF0EE", sub: t("dash.needUrgent") },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 13, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 18, height: 18, color: s.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 9, color: "#B6A8C9", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, margin: 0 }}>{s.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: s.color, margin: "1px 0 0", lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 9, color: "#B6A8C9", margin: "2px 0 0", fontWeight: 600 }}>{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resolution rate donut */}
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <DonutRing pct={resolutionRate} color={BRAND.mintDeep} size={72} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: BRAND.mintDeep }}>{resolutionRate}%</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: BRAND.purple, margin: 0 }}>{t("dash.resolutionRate")}</p>
              <p style={{ fontSize: 11, color: "#8C7AA3", margin: "4px 0 0", lineHeight: 1.5 }}>
                {resolved} {t("dash.of")} {total} {t("dash.reported")} {t("dash.resolvedDesc")} <strong>{avgResponseHrs}hrs</strong>.
              </p>
            </div>
          </div>

          {/* Category breakdown */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Activity style={{ width: 15, height: 15, color: BRAND.purpleLight }} />
              <h3 style={{ fontSize: 11, fontWeight: 800, color: BRAND.purple, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{t("dash.byCategory")}</h3>
            </div>
            <BarChart data={catCounts.map(c => ({ label: c.label, value: c.value, color: c.color }))} maxVal={maxCat} />
          </div>

          {/* Status pipeline */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <TrendingUp style={{ width: 15, height: 15, color: BRAND.purpleLight }} />
              <h3 style={{ fontSize: 11, fontWeight: 800, color: BRAND.purple, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{t("dash.pipeline")}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {statusCounts.map(s => {
                const pct = total > 0 ? Math.round((s.value / (total / 5)) * 100) : 0;
                return (
                  <div key={s.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: s.color }}>{s.value}</span>
                    </div>
                    <div style={{ height: 6, background: "#F0EBF8", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: s.color, borderRadius: 999, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights */}
          <div style={{ ...card, background: `linear-gradient(135deg, ${BRAND.purpleDark}, ${BRAND.purple})`, border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lightbulb style={{ width: 14, height: 14, color: BRAND.yellow }} />
              </div>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{t("dash.aiInsights")}</h3>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0 }}>{t("dash.aiInsightsDesc")}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {insights.map((insight, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Community stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { icon: Users,      label: t("dash.citizensActive"), value: "1,247", color: BRAND.purpleLight },
              { icon: ShieldCheck, label: t("dash.verifications"), value: "3,891", color: BRAND.mintDeep },
              { icon: MapPin,     label: t("dash.areasCovered"),   value: "28",    color: BRAND.coralDeep },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ ...card, padding: "12px 10px", textAlign: "center" }}>
                  <Icon style={{ width: 18, height: 18, color: s.color, margin: "0 auto 6px" }} />
                  <p style={{ fontSize: 16, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: 8, color: "#B6A8C9", fontWeight: 700, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* My contribution hero */}
          <div style={{ background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.purpleLight} 100%)`, borderRadius: 22, padding: 20, color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: BRAND.coral, opacity: 0.12, top: -30, right: -20 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{t("dash.civicImpact")}</p>
                  <h3 style={{ fontSize: 18, fontWeight: 900, margin: "4px 0 0" }}>Greater Noida</h3>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0, fontWeight: 700, textTransform: "uppercase" }}>{t("dash.trustScore")}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: BRAND.yellow, margin: 0, lineHeight: 1 }}>{myTrust}%</p>
                </div>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${myTrust}%`, background: `linear-gradient(90deg, ${BRAND.coral}, ${BRAND.yellow})`, borderRadius: 999 }} />
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <span style={{ fontSize: 9, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "3px 10px", fontWeight: 700 }}>
                  🏆 {getRankLabel(myTrust)}
                </span>
                <span style={{ fontSize: 9, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "3px 10px", fontWeight: 700 }}>
                  {t("dash.joinedJun")}
                </span>
              </div>
            </div>
          </div>

          {/* My stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: t("dash.reportsFiled"), value: 14 + myIssues.length, color: BRAND.purpleLight, bg: "#F3EEFF" },
              { label: t("stats.resolved"),    value: 9 + myResolved,       color: BRAND.mintDeep,    bg: "#F0FDFB" },
              { label: t("dash.upvotes"),      value: 38 + myUpvotes,       color: BRAND.coralDeep,   bg: "#FFF0EE" },
            ].map(s => (
              <div key={s.label} style={{ ...card, padding: "14px 10px", textAlign: "center", background: s.bg, border: `1px solid ${BRAND.cardBorder}` }}>
                <p style={{ fontSize: 9, color: "#B6A8C9", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: s.color, margin: "4px 0 0", lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award style={{ width: 15, height: 15, color: BRAND.yellowDeep }} />
                <h3 style={{ fontSize: 11, fontWeight: 800, color: BRAND.purple, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{t("dash.badgesEarned")}</h3>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { emoji: "🕳️", title: t("badge.asphalt"), desc: t("badge.asphaltDesc"), active: true },
                { emoji: "💡", title: t("badge.grid"),    desc: t("badge.gridDesc"),    active: 9 + myResolved > 10 },
                { emoji: "🗑️", title: t("badge.clean"),   desc: t("badge.cleanDesc"),   active: true },
                { emoji: "🛡️", title: t("badge.trust"),   desc: t("badge.trustDesc"),   active: myTrust >= 90 },
              ].map(b => (
                <div key={b.title} style={{ background: b.active ? "#EDE0FF" : "#F8F5FF", borderRadius: 14, padding: "10px 12px", border: `1px solid ${b.active ? BRAND.lavender : BRAND.cardBorder}`, display: "flex", alignItems: "center", gap: 10, opacity: b.active ? 1 : 0.4, cursor: b.active ? "default" : "not-allowed" }}>
                  <span style={{ fontSize: 20 }}>{b.emoji}</span>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 800, color: BRAND.purple, margin: 0 }}>{b.title}</p>
                    <p style={{ fontSize: 9, color: "#9B8AB8", margin: "1px 0 0" }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My recent reports */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Zap style={{ width: 15, height: 15, color: BRAND.purpleLight }} />
              <h3 style={{ fontSize: 11, fontWeight: 800, color: BRAND.purple, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{t("dash.myRecentReports")}</h3>
            </div>
            {myIssues.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <p style={{ fontSize: 32, margin: 0 }}>📋</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#B6A8C9", margin: "8px 0 0" }}>{t("dash.noReports")}</p>
                <p style={{ fontSize: 10, color: "#D2C2DE", margin: "4px 0 0" }}>{t("dash.noReportsHint")}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {myIssues.slice(0, 5).map(issue => {
                  const stat = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
                  const cat = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.other;
                  return (
                    <div key={issue.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#FAF7FF", borderRadius: 12, border: `1px solid ${BRAND.cardBorder}` }}>
                      <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: BRAND.purple, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.title}</p>
                        <p style={{ fontSize: 9, color: "#B6A8C9", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.address}</p>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: stat.color, background: stat.bg, borderRadius: 999, padding: "2px 8px", flexShrink: 0, textTransform: "uppercase" }}>
                        {stat.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
