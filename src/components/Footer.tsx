import React from "react";
import { Phone, Shield, Cpu, HelpCircle, FileText } from "lucide-react";
import { T } from "../styles/tokens";

interface FooterProps {
  theme?: "light" | "dark";
}

export default function Footer({}: FooterProps) {
  const emergencyHelplines = [
    { label: "Police",         phone: "100" },
    { label: "Ambulance",      phone: "108" },
    { label: "Fire Corps",     phone: "101" },
    { label: "Municipal Desk", phone: "1916" },
  ];

  return (
    <footer
      style={{
        background: T.violet,
        borderRadius: "24px 24px 0 0",
        padding: "28px 24px 40px",
        marginTop: 32,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: T.violetMid,
          opacity: 0.3,
          top: -80,
          right: -60,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: T.rose,
          opacity: 0.12,
          bottom: 20,
          left: -20,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 28,
        }}
      >
        {/* About */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Shield style={{ width: 15, height: 15, color: T.mint }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              RoadSync Citizen Platform
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 380,
            }}
          >
            Greater Noida's municipal dashboard bridging the feedback loop between civic observers and local public works. Claims are classified via Gemini AI and routed to authorized repair personnel.
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "10px 0 0", fontWeight: 600 }}>
            © {new Date().getFullYear()} Municipal Corporation · Government of Uttar Pradesh
          </p>
        </div>

        {/* Emergency Helplines */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Phone style={{ width: 14, height: 14, color: "#ff6b6b" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Emergency Helplines
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {emergencyHelplines.map((h) => (
              <a
                key={h.label}
                href={`tel:${h.phone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 14,
                  padding: "9px 14px",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              >
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{h.label}</span>
                <span style={{ fontSize: 12, color: T.rose, fontWeight: 800, fontFamily: "monospace" }}>{h.phone}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Resources + AI badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 20 }}>
            <a
              href="#about"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
            >
              <HelpCircle style={{ width: 12, height: 12 }} />
              About
            </a>
            <a
              href="#privacy"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
            >
              <FileText style={{ width: 12, height: 12 }} />
              Privacy Policy
            </a>
          </div>

          {/* Gemini AI badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 12,
              padding: "6px 14px",
            }}
          >
            <Cpu style={{ width: 13, height: 13, color: T.periwinkle }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: T.periwinkle, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Powered by Gemini AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}