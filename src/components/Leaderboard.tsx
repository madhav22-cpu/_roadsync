import React from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { T } from "../styles/tokens";
import { useLanguage } from "../contexts/LanguageContext";

interface CitizenLeader {
  rank: number;
  name: string;
  avatarInitials: string;
  reportsSubmitted: number;
  resolvedCount: number;
  trustScore: number;
  joinDate: string;
}

interface LeaderboardProps {
  theme?: "light" | "dark";
}

export default function Leaderboard({}: LeaderboardProps) {
  const { t } = useLanguage();

  const leaders: CitizenLeader[] = [
    { rank: 1,  name: "Arjun Sharma",  avatarInitials: "AS", reportsSubmitted: 24, resolvedCount: 18, trustScore: 98, joinDate: "Jan 2026" },
    { rank: 2,  name: "Priya Nair",    avatarInitials: "PN", reportsSubmitted: 19, resolvedCount: 14, trustScore: 96, joinDate: "Feb 2026" },
    { rank: 3,  name: "Vikram Goel",   avatarInitials: "VG", reportsSubmitted: 16, resolvedCount: 11, trustScore: 94, joinDate: "Nov 2025" },
    { rank: 4,  name: "Sanya Gupta",   avatarInitials: "SG", reportsSubmitted: 14, resolvedCount: 10, trustScore: 92, joinDate: "Dec 2025" },
    { rank: 5,  name: "Rahul Verma",   avatarInitials: "RV", reportsSubmitted: 12, resolvedCount: 8,  trustScore: 89, joinDate: "Jan 2026" },
    { rank: 6,  name: "Ananya Roy",    avatarInitials: "AR", reportsSubmitted: 11, resolvedCount: 7,  trustScore: 88, joinDate: "Feb 2026" },
    { rank: 7,  name: "Karan Johar",   avatarInitials: "KJ", reportsSubmitted: 9,  resolvedCount: 6,  trustScore: 85, joinDate: "Mar 2026" },
    { rank: 8,  name: "Meera Sen",     avatarInitials: "MS", reportsSubmitted: 8,  resolvedCount: 5,  trustScore: 82, joinDate: "Oct 2025" },
    { rank: 9,  name: "Deepak Joshi",  avatarInitials: "DJ", reportsSubmitted: 7,  resolvedCount: 4,  trustScore: 80, joinDate: "Jan 2026" },
    { rank: 10, name: "Neha Khanna",   avatarInitials: "NK", reportsSubmitted: 6,  resolvedCount: 3,  trustScore: 78, joinDate: "Dec 2025" },
  ];

  const podiumOrder = [leaders[1], leaders[0], leaders[2]];

  const medalGrad = [
    "linear-gradient(135deg, #C0C0C0, #A0A0A0)",  // silver (2nd)
    "linear-gradient(135deg, #FFD700, #FFA500)",   // gold   (1st)
    "linear-gradient(135deg, #CD7F32, #A0522D)",   // bronze (3rd)
  ];
  const medalLabel = [t("leaderboard.silver"), t("leaderboard.gold"), t("leaderboard.bronze")];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Hero Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.violet} 0%, ${T.violetMid} 100%)`,
          borderRadius: 24,
          padding: "20px 22px",
          position: "relative",
          overflow: "hidden",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: T.peach,
            opacity: 0.15,
            top: -40,
            right: -30,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "4px 12px",
              marginBottom: 10,
            }}
          >
            <Trophy style={{ width: 12, height: 12, color: T.peach }} />
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: T.peach }}>
              {t("leaderboard.badge")}
            </span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>{t("leaderboard.title")}</h2>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
            {t("leaderboard.subtitle")}
          </p>
        </div>
      </div>

      {/* ── Podium (Top 3) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {podiumOrder.map((leader, idx) => {
          const isFirst = leader.rank === 1;
          return (
            <div
              key={leader.name}
              style={{
                background: T.surface,
                borderRadius: 20,
                border: `1.5px solid ${isFirst ? T.violetMid : T.border}`,
                padding: "16px 10px",
                textAlign: "center",
                transform: isFirst ? "translateY(-8px)" : "none",
                boxShadow: isFirst
                  ? `0 8px 28px rgba(74,44,106,0.2)`
                  : "0 2px 8px rgba(74,44,106,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: medalGrad[idx],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#fff",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
                  marginBottom: 6,
                  position: "relative",
                }}
              >
                {leader.avatarInitials}
                <span
                  style={{
                    position: "absolute",
                    bottom: -8,
                    right: -8,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    fontSize: 9,
                    fontWeight: 800,
                    color: T.text,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  #{leader.rank}
                </span>
              </div>

              <p style={{ fontSize: 11, fontWeight: 800, color: T.text, margin: "6px 0 0" }}>
                {leader.name.split(" ")[0]}
              </p>
              <p
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: isFirst ? "#E8A020" : T.textLight,
                  margin: "1px 0 8px",
                }}
              >
                {medalLabel[idx]}
              </p>

              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, textAlign: "center" }}>
                <div>
                  <p style={{ fontSize: 8, color: T.textLight, fontWeight: 700, margin: 0 }}>{t("leaderboard.repAbbr")}</p>
                  <p style={{ fontSize: 12, fontWeight: 800, color: T.text, margin: "2px 0 0" }}>{leader.reportsSubmitted}</p>
                </div>
                <div>
                  <p style={{ fontSize: 8, color: T.textLight, fontWeight: 700, margin: 0 }}>{t("leaderboard.resAbbr")}</p>
                  <p style={{ fontSize: 12, fontWeight: 800, color: "#2E7D5E", margin: "2px 0 0" }}>{leader.resolvedCount}</p>
                </div>
                <div>
                  <p style={{ fontSize: 8, color: T.textLight, fontWeight: 700, margin: 0 }}>{t("leaderboard.trustAbbr")}</p>
                  <p style={{ fontSize: 12, fontWeight: 800, color: T.violetMid, margin: "2px 0 0" }}>{leader.trustScore}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Full Rankings Table ── */}
      <div
        style={{
          background: T.surface,
          borderRadius: 22,
          border: `1px solid ${T.border}`,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(74,44,106,0.07)",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              {t("leaderboard.top10")}
            </h3>
            <p style={{ fontSize: 9, color: T.textLight, margin: "2px 0 0" }}>{t("leaderboard.recalculated")}</p>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "#D4F5E8",
              border: "1px solid #A8E8CA",
              borderRadius: 10,
              padding: "4px 10px",
            }}
          >
            <TrendingUp style={{ width: 11, height: 11, color: "#2E7D5E" }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "#2E7D5E", textTransform: "uppercase", letterSpacing: "0.07em" }}>{t("leaderboard.live")}</span>
          </div>
        </div>

        {/* Rows */}
        {leaders.map((leader, idx) => (
          <div
            key={leader.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 18px",
              borderBottom: idx < leaders.length - 1 ? `1px solid ${T.border}` : "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = T.surfaceAlt; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {/* Rank */}
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: leader.rank <= 3 ? T.violet : T.textLight,
                width: 26,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              #{leader.rank}
            </span>

            {/* Avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                background: leader.rank <= 3
                  ? `linear-gradient(135deg, ${T.violet}, ${T.violetMid})`
                  : "#EDE0FF",
                border: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                color: leader.rank <= 3 ? "#fff" : T.violetMid,
                flexShrink: 0,
              }}
            >
              {leader.avatarInitials}
            </div>

            {/* Name + stats */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{leader.name}</p>
              <p style={{ fontSize: 9, color: T.textLight, margin: "1px 0 0" }}>
                {leader.reportsSubmitted} {t("leaderboard.reports")} · {leader.resolvedCount} {t("leaderboard.resolved")} · {t("leaderboard.joined")} {leader.joinDate}
              </p>
            </div>

            {/* Trust */}
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: T.violetMid,
                fontFamily: "monospace",
                flexShrink: 0,
              }}
            >
              {leader.trustScore}%
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
