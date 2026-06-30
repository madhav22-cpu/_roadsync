import React from "react";
import { Shield, Home, PlusCircle, Map, FolderGit2, BarChart3, Award, Sliders, X, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import TranslateButton from "./TranslateButton";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userReportsCount: number;
  userResolvedCount: number;
  userTrustScore: number;
  theme?: "light" | "dark";
}

export default function Sidebar({
  activeTab, setActiveTab, isOpen, setIsOpen,
  userReportsCount, userResolvedCount, userTrustScore, theme = "light",
}: SidebarProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: "home",        label: t("nav.home"),        icon: Home },
    { id: "report",      label: t("nav.report"),      icon: PlusCircle },
    { id: "map",         label: t("nav.liveMap"),     icon: Map },
    { id: "my-reports",  label: t("nav.myReports"),   icon: FolderGit2 },
    { id: "dashboard",   label: t("nav.dashboard"),   icon: BarChart3 },
    { id: "leaderboard", label: t("nav.leaderboard"), icon: Award },
    { id: "admin",       label: t("nav.admin"),       icon: Sliders },
  ];

  const getCivicRank = (score: number) => {
    if (score >= 90) return t("dash.champion");
    if (score >= 75) return t("dash.verifiedCitizen");
    if (score >= 40) return t("dash.reporter");
    return t("dash.newcomer");
  };

  return (
    <aside
      className="hidden lg:flex lg:flex-col"
      style={{
        width: "240px", flexShrink: 0, height: "100%",
        background: "#FDF0F5", borderRight: "1px solid #F2C4D8",
        overflowY: "auto", position: "relative", zIndex: 10, isolation: "isolate",
      }}
    >
      {/* Branding */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #F2C4D8", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "14px", background: "linear-gradient(135deg, #6B3FA0, #9B6BC8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(107,63,160,0.35)", flexShrink: 0 }}>
          <Shield style={{ width: "20px", height: "20px", color: "white" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#3D1A6B", margin: 0, letterSpacing: "-0.3px" }}>{t("app.name")}</h2>
          <p style={{ fontSize: "10px", color: "#B088C8", fontWeight: 600, margin: 0 }}>{t("app.subtitle")}</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "14px", marginBottom: "2px",
                fontSize: "12px", fontWeight: 700,
                background: isActive ? "linear-gradient(135deg, #6B3FA0, #9B6BC8)" : "transparent",
                color: isActive ? "white" : "#9070B0",
                border: isActive ? "none" : "1px solid transparent",
                cursor: "pointer", textAlign: "left",
                boxShadow: isActive ? "0 4px 14px rgba(107,63,160,0.35)" : "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(107,63,160,0.08)"; (e.currentTarget as HTMLElement).style.color = "#6B3FA0"; }}}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#9070B0"; }}}
            >
              <Icon style={{ width: "16px", height: "16px", flexShrink: 0, color: isActive ? "white" : "#B898D0" }} />
              <span>{item.label}</span>
              {isActive && <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.7)" }} />}
            </button>
          );
        })}
      </nav>

      {/* Translate button in sidebar */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid #F2C4D8" }}>
        <TranslateButton
          style={{
            width: "100%",
            justifyContent: "center",
            background: "linear-gradient(135deg, #6B3FA0, #9B6BC8)",
            border: "none",
            borderRadius: "14px",
            padding: "9px 12px",
            boxShadow: "0 4px 14px rgba(107,63,160,0.35)",
          }}
        />
      </div>

      {/* User card */}
      <div style={{ padding: "10px 10px 16px" }}>
        <div style={{ borderRadius: "18px", padding: "14px", background: "linear-gradient(135deg, #6B3FA0, #9B6BC8)", boxShadow: "0 6px 20px rgba(107,63,160,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "white" }}>MS</div>
              <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "14px", height: "14px", borderRadius: "50%", background: "#F9A8D4", border: "2px solid #6B3FA0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 style={{ width: "8px", height: "8px", color: "#6B3FA0" }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "white", margin: 0 }}>Madhav Sharma</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: 600, margin: 0 }}>🏆 {getCivicRank(userTrustScore)}</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px", textAlign: "center" }}>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, margin: 0 }}>{t("sidebar.reportsLabel")}</p>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "white", margin: "2px 0 0" }}>{userReportsCount}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px", textAlign: "center" }}>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, margin: 0 }}>{t("sidebar.resolvedLabel")}</p>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "#F9A8D4", margin: "2px 0 0" }}>{userResolvedCount}</p>
            </div>
          </div>
          <div style={{ marginTop: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("sidebar.trustLabel")}</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#F9A8D4" }}>{userTrustScore}/100</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
