import React, { useState, useEffect } from "react";
import {
  Shield, MapPin, Star, TrendingUp, CheckCircle2,
  FileText, Moon, Sun, RotateCw, LogOut
} from "lucide-react";

interface ProfileScreenProps {
  userReportsCount?: number;
  userResolvedCount?: number;
  userTrustScore?: number;
  theme?: "light" | "dark";
  setTheme?: (t: "light" | "dark") => void;
  onResetDatabase?: () => void;
  onLogout?: () => void;
  myIssues?: any[];
  userName?: string;
  userArea?: string;
}

const LIGHT = {
  purple: "#6B3FA0",
  purpleLight: "#9B6BC8",
  purplePale: "#F0E6FA",
  purpleBorder: "#D4B0EC",
  pink: "#E8759A",
  pinkPale: "#FDE8F0",
  pinkBorder: "#F2B8CC",
  bg: "#FDF0F5",
  white: "#FFFFFF",
  textDark: "#3D1A6B",
  textMid: "#8B6AAA",
  textLight: "#C4A0D8",
  cardBg: "#FFFFFF",
};

const DARK = {
  purple: "#B388FF",
  purpleLight: "#CE93D8",
  purplePale: "#2D1F42",
  purpleBorder: "#4A3360",
  pink: "#F48FB1",
  pinkPale: "#3B1F2E",
  pinkBorder: "#6D3050",
  bg: "#1A1025",
  white: "#FFFFFF",
  textDark: "#EDE7F6",
  textMid: "#B39DDB",
  textLight: "#7E57C2",
  cardBg: "#241535",
};

const BlobWave = () => (
  <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%" }}>
    <path d="M0,30 C80,80 160,5 240,50 C320,95 380,20 400,40 L400,100 L0,100 Z" fill="white" opacity="0.08" />
    <path d="M0,55 C60,20 140,90 220,40 C300,0 370,70 400,50 L400,100 L0,100 Z" fill="white" opacity="0.06" />
  </svg>
);

export default function ProfileScreen({
  userReportsCount = 14,
  userResolvedCount = 9,
  userTrustScore = 94,
  theme = "light",
  setTheme,
  onResetDatabase,
  onLogout,
  myIssues = [],
  userName = "Madhav Sharma",
  userArea = "Greater Noida",
}: ProfileScreenProps) {
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ FIX: derive T from prop directly — no local state needed
  // This means when parent updates theme, UI re-renders with correct colors immediately
  const T = theme === "dark" ? DARK : LIGHT;

  const toggleTheme = () => {
    setTheme?.(theme === "light" ? "dark" : "light");
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/issues/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) { onResetDatabase?.(); showToast("Database successfully restored!"); }
      else showToast("Failed to reset database.");
    } catch {
      showToast("Unable to reach servers.");
    } finally {
      setResetting(false);
    }
  };

  const handleLogoutClick = () => {
    setConfirmingLogout(true);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout?.();
    } finally {
      setLoggingOut(false);
      setConfirmingLogout(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const upvotes = 38 + myIssues.reduce((acc: number, i: any) => acc + (i.upvotes || 0), 0);
  const resolveRate = userReportsCount > 0 ? Math.round((userResolvedCount / userReportsCount) * 100) : 0;
  const rank = userTrustScore >= 90 ? "Community Champion" : userTrustScore >= 75 ? "Verified Citizen" : userTrustScore >= 40 ? "Reporter" : "Newcomer";

  const badges = [
    { icon: "🏆", label: "Champion",       earned: userTrustScore >= 90 },
    { icon: "✅", label: "Verified",        earned: userTrustScore >= 75 },
    { icon: "📍", label: "10+ Filer",      earned: userReportsCount >= 10 },
    { icon: "⚡", label: "Fast Responder",  earned: true },
    { icon: "🌟", label: "Top Upvoted",    earned: upvotes >= 30 },
    { icon: "🔒", label: "Trusted Filer",  earned: userTrustScore >= 85 },
  ];

  const card: React.CSSProperties = {
    background: T.cardBg,
    borderRadius: "24px",
    padding: "20px",
    border: `1px solid ${T.purpleBorder}`,
    boxShadow: "0 4px 20px rgba(107,63,160,0.08)",
    marginBottom: "14px",
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: T.bg, minHeight: "100vh", paddingBottom: 80 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "90px", right: "16px", zIndex: 10000,
          background: T.purple, color: "white", padding: "12px 20px",
          borderRadius: "14px", fontSize: "13px", fontWeight: 700,
          boxShadow: "0 10px 28px rgba(107,63,160,0.35)",
          display: "flex", alignItems: "center", gap: "10px",
          maxWidth: "calc(100vw - 32px)",
        }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#A8F0D4", flexShrink: 0 }} />
          {toast}
        </div>
      )}

      {/* Logout confirmation overlay */}
      {confirmingLogout && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10001,
          background: "rgba(20,8,35,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", boxSizing: "border-box",
        }}>
          <div style={{
            background: T.cardBg, borderRadius: "22px", padding: "24px",
            maxWidth: "320px", width: "100%",
            border: `1px solid ${T.purpleBorder}`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "16px",
              background: T.pinkPale, display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <LogOut style={{ width: 22, height: 22, color: T.pink }} />
            </div>
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: T.textDark, margin: "0 0 6px" }}>Sign out of RoadSync?</h4>
            <p style={{ fontSize: "12px", color: T.textMid, margin: "0 0 20px", fontWeight: 500, lineHeight: 1.5 }}>
              You'll need to sign back in to file new reports or view your activity.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setConfirmingLogout(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "12px",
                  border: `1px solid ${T.purpleBorder}`, background: T.purplePale,
                  color: T.purple, fontSize: "12px", fontWeight: 700, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                style={{
                  flex: 1, padding: "10px", borderRadius: "12px",
                  border: "none", background: T.pink,
                  color: "white", fontSize: "12px", fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}
              >
                {loggingOut ? <RotateCw style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <LogOut style={{ width: 14, height: 14 }} />}
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, #4A2C6A 0%, #2A0A4A 100%)`,
        padding: "52px 20px 72px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", top: "20px", left: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(232,117,154,0.15)" }} />
        <BlobWave />

        {/* Logout icon button, top-right of hero */}
        <button
          onClick={handleLogoutClick}
          title="Sign out"
          style={{
            position: "absolute", top: "16px", right: "16px", zIndex: 2,
            width: "36px", height: "36px", borderRadius: "12px",
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", backdropFilter: "blur(4px)",
          }}
        >
          <LogOut style={{ width: 16, height: 16, color: "white" }} />
        </button>

        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: "16px" }}>
            <div style={{
              width: "88px", height: "88px", borderRadius: "28px",
              background: "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", fontWeight: 800, color: "white",
              backdropFilter: "blur(8px)", margin: "0 auto",
              boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
            }}>
              {userName ? userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "MS"}
            </div>
            <div style={{
              position: "absolute", bottom: "-4px", right: "-4px",
              width: "26px", height: "26px", borderRadius: "50%",
              background: "#F9A8D4", border: "3px solid #2A0A4A",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px",
            }}>✓</div>
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: 900, color: "white", margin: "0 0 6px", letterSpacing: "-0.5px" }}>{userName}</h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, flexWrap: "wrap" }}>
            <MapPin style={{ width: "13px", height: "13px", flexShrink: 0 }} />
            <span>{userArea}</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <span>Citizen Advocate</span>
          </div>
          <div style={{ marginTop: "16px" }}>
            <span style={{
              padding: "6px 16px", borderRadius: "20px", fontSize: "11px", fontWeight: 800,
              background: "rgba(255,255,255,0.15)", color: "white",
              border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(4px)",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>🏆 {rank}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "640px", margin: "-32px auto 0", padding: "0 16px", position: "relative", boxSizing: "border-box" }}>

        {/* Trust Score */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>Civic Integrity</p>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: T.textDark, margin: 0 }}>Community Trust Rating</h3>
            </div>
            <span style={{ fontSize: "26px", fontWeight: 900, color: T.purple }}>{userTrustScore}%</span>
          </div>
          <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: T.purplePale, overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ width: `${userTrustScore}%`, height: "100%", borderRadius: "4px", background: `linear-gradient(90deg, ${T.purple}, ${T.purpleLight})`, transition: "width 0.8s ease-in-out" }} />
          </div>
          <p style={{ fontSize: "12px", color: T.textMid, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            Your trust score is based on report accuracy, community upvotes, and successful verifications.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "14px" }}>
          {[
            { label: "My Reports",       value: userReportsCount, icon: FileText,     color: T.purple,      bg: T.purplePale },
            { label: "Issues Resolved",  value: userResolvedCount,icon: CheckCircle2, color: "#22c55e",     bg: "#f0fdf4" },
            { label: "Upvotes Received", value: upvotes,          icon: Star,         color: T.pink,        bg: T.pinkPale },
            { label: "Resolution Rate",  value: `${resolveRate}%`,icon: TrendingUp,   color: T.purpleLight, bg: T.purplePale },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{
                background: T.cardBg, borderRadius: "20px", padding: "16px",
                border: `1px solid ${T.purpleBorder}`, boxShadow: "0 2px 10px rgba(107,63,160,0.06)",
                display: "flex", gap: "12px", alignItems: "center",
              }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "14px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: "20px", height: "20px", color: item.color }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: "20px", fontWeight: 900, color: T.textDark, margin: "2px 0 0" }}>{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges */}
        <div style={card}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: T.textDark, margin: "0 0 14px" }}>Civic Badges Earned</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {badges.map((b, i) => (
              <div key={i} style={{
                padding: "14px 6px", borderRadius: "18px",
                border: `1px solid ${b.earned ? T.purpleBorder : T.purplePale}`,
                background: b.earned ? T.purplePale : theme === "dark" ? "#1E1030" : "#FAFAFA",
                textAlign: "center", opacity: b.earned ? 1 : 0.45,
                transition: "transform 0.2s",
              }}>
                <span style={{ fontSize: "26px", display: "block", marginBottom: "6px" }}>{b.icon}</span>
                <span style={{ fontSize: "11px", fontWeight: 800, color: b.earned ? T.purple : T.textLight, display: "block" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div style={card}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: T.textDark, margin: "0 0 16px" }}>App Settings</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ✅ FIX: flexWrap so button doesn't overflow on narrow screens */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: T.textDark, margin: 0 }}>Visual Theme Mode</p>
                <p style={{ fontSize: "11px", color: T.textLight, margin: 0, fontWeight: 500 }}>Switch interface colors</p>
              </div>
              <button onClick={toggleTheme} style={{
                padding: "8px 16px", borderRadius: "12px", flexShrink: 0,
                border: `1px solid ${T.purpleBorder}`, background: T.purplePale,
                color: T.purple, fontSize: "12px", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              }}>
                {theme === "light" ? <Moon style={{ width: 14, height: 14 }} /> : <Sun style={{ width: 14, height: 14 }} />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            </div>

            <div style={{ height: "1px", background: T.purpleBorder }} />

            {/* ✅ FIX: flexWrap here too */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: T.textDark, margin: 0 }}>Restore Database Seeds</p>
                <p style={{ fontSize: "11px", color: T.textLight, margin: 0, fontWeight: 500 }}>Reset issues to original demo list</p>
              </div>
              <button onClick={handleReset} disabled={resetting} style={{
                padding: "8px 16px", borderRadius: "12px", flexShrink: 0,
                border: `1px solid ${T.pinkBorder}`, background: T.pinkPale,
                color: T.pink, fontSize: "12px", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              }}>
                <RotateCw style={{ width: 14, height: 14, animation: resetting ? "spin 1s linear infinite" : "none" }} />
                {resetting ? "Resetting..." : "Reset Data"}
              </button>
            </div>

            <div style={{ height: "1px", background: T.purpleBorder }} />

            {/* Logout row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: T.textDark, margin: 0 }}>Account Session</p>
                <p style={{ fontSize: "11px", color: T.textLight, margin: 0, fontWeight: 500 }}>Sign out of RoadSync on this device</p>
              </div>
              <button onClick={handleLogoutClick} style={{
                padding: "8px 16px", borderRadius: "12px", flexShrink: 0,
                border: `1px solid ${T.pinkBorder}`, background: T.pinkPale,
                color: T.pink, fontSize: "12px", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              }}>
                <LogOut style={{ width: 14, height: 14 }} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Charter banner */}
        <div style={{
          background: T.purplePale, border: `1px solid ${T.purpleBorder}`, borderRadius: "20px",
          padding: "16px", display: "flex", gap: "12px", alignItems: "flex-start",
        }}>
          <Shield style={{ width: "20px", height: "20px", color: T.purple, flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: "12px", fontWeight: 800, color: T.textDark, margin: "0 0 4px" }}>Uttar Pradesh Citizen Charter</h4>
            <p style={{ fontSize: "11px", color: T.textMid, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              This platform adheres to NDSAP of India. Verified issues are transmitted to the Greater Noida Authority for prompt resolution.
            </p>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
