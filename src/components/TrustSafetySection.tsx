import React from "react";
import { ShieldCheck, Users, Eye, MapPin, AlertOctagon } from "lucide-react";

interface TrustSafetySectionProps {
  theme?: "light" | "dark";
}

const T = {
  purple: "#6B3FA0",
  purpleLight: "#9B6BC8",
  purplePale: "#F0E6FA",
  purpleBorder: "#D4B0EC",
  pink: "#E8759A",
  pinkPale: "#FDE8F0",
  pinkBorder: "#F2B8CC",
  bg: "#FDF0F5",
  textDark: "#3D1A6B",
  textMid: "#8B6AAA",
  textLight: "#C4A0D8",
};

export default function TrustSafetySection({ theme = "light" }: TrustSafetySectionProps) {
  return (
    <div style={{
      borderRadius: "24px", padding: "20px",
      background: "white", border: `1px solid ${T.purpleBorder}`,
      boxShadow: "0 4px 20px rgba(107,63,160,0.08)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "140px", height: "140px", borderRadius: "50%", background: `${T.purple}06`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20px", left: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: `${T.pink}08`, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "14px", borderBottom: `1px solid ${T.purpleBorder}`, marginBottom: "16px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "12px",
          background: `linear-gradient(135deg, ${T.purple}, ${T.purpleLight})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 12px rgba(107,63,160,0.3)`,
        }}>
          <ShieldCheck style={{ width: "18px", height: "18px", color: "white" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 900, color: T.textDark, margin: 0, letterSpacing: "-0.2px" }}>Trust & Safety Guidelines</h2>
          <p style={{ fontSize: "10px", color: T.textLight, fontWeight: 600, margin: 0 }}>How RoadSync ensures data integrity and prevents false reporting</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>

        {/* Verification Threshold */}
        <div style={{ padding: "14px", borderRadius: "18px", background: T.purplePale, border: `1px solid ${T.purpleBorder}`, display: "flex", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "white", border: `1px solid ${T.purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users style={{ width: "16px", height: "16px", color: T.purple }} />
          </div>
          <div>
            <h3 style={{ fontSize: "11px", fontWeight: 900, color: T.textDark, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Citizen Audit Threshold</h3>
            <p style={{ fontSize: "11px", lineHeight: 1.6, color: T.textMid, margin: 0, fontWeight: 500 }}>
              Issues are only upgraded to <span style={{ color: T.purple, fontWeight: 800 }}>Verified</span> when at least <strong style={{ color: T.textDark }}>3 unique citizens</strong> vote to verify them.
            </p>
          </div>
        </div>

        {/* AI Anomaly */}
        <div style={{ padding: "14px", borderRadius: "18px", background: "#EBD8F8", border: `1px solid ${T.purpleLight}40`, display: "flex", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "white", border: `1px solid ${T.purpleLight}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Eye style={{ width: "16px", height: "16px", color: T.purpleLight }} />
          </div>
          <div>
            <h3 style={{ fontSize: "11px", fontWeight: 900, color: T.textDark, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>AI Anomaly Verification</h3>
            <p style={{ fontSize: "11px", lineHeight: 1.6, color: T.textMid, margin: 0, fontWeight: 500 }}>
              Gemini Vision analyzes photo metadata and description context to flag impossible issues or synthetic images.
            </p>
          </div>
        </div>

        {/* Duplicate Protection */}
        <div style={{ padding: "14px", borderRadius: "18px", background: T.pinkPale, border: `1px solid ${T.pinkBorder}`, display: "flex", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "white", border: `1px solid ${T.pinkBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MapPin style={{ width: "16px", height: "16px", color: T.pink }} />
          </div>
          <div>
            <h3 style={{ fontSize: "11px", fontWeight: 900, color: T.textDark, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Radius Duplicate Filter</h3>
            <p style={{ fontSize: "11px", lineHeight: 1.6, color: T.textMid, margin: 0, fontWeight: 500 }}>
              The system prevents filing multiple reports for the same category within a <strong style={{ color: T.textDark }}>50-meter radius</strong>.
            </p>
          </div>
        </div>

        {/* Penalty Notice */}
        <div style={{ padding: "14px", borderRadius: "18px", background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "12px", background: "white", border: "1px solid #FECACA",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            animation: "pulseRed 2s infinite",
          }}>
            <AlertOctagon style={{ width: "16px", height: "16px", color: "#ef4444" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "11px", fontWeight: 900, color: "#991B1B", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Penalty Notice (Section 42)</h3>
            <p style={{ fontSize: "11px", lineHeight: 1.6, color: "#B91C1C", margin: 0, fontWeight: 500 }}>
              Fraudulent or fake civic claims violate Municipal Code Section 42 and are subject to civil fines.
            </p>
          </div>
        </div>

      </div>
      <style>{`@keyframes pulseRed { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0.12); } }`}</style>
    </div>
  );
}

