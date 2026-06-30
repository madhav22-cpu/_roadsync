import React, { useState, useRef } from "react";
import { Shield, ArrowRight, MapPin, Check } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (userData: { name: string; phone: string; area: string; avatar: string }) => void;
}

const SLIDES = [
  { emoji: "🚦", title: "Report Road Issues", desc: "Snap a photo, drop a pin, and submit in seconds.", accent: "#6B3FA0" },
  { emoji: "🤖", title: "AI Powered Analysis", desc: "Gemini AI categorizes your issue and assigns severity.", accent: "#E8759A" },
  { emoji: "👥", title: "Community Verified", desc: "Neighbors verify reports, building civic consensus.", accent: "#9B6BC8" },
  { emoji: "📊", title: "Track & Get Results", desc: "Follow from filing to resolution. Earn trust points.", accent: "#E8759A" },
];

const AVATARS = ["👨‍💼", "👩‍💼", "👨‍🔬", "👩‍🔬", "👨‍🏫", "👩‍🏫", "👨‍⚕️", "👩‍⚕️"];
const AREAS = ["Knowledge Park", "Pari Chowk", "Sector Alpha", "Sector Beta", "Sector Gamma", "Surajpur", "Kasna", "Greater Noida West"];

type Step = "splash" | "onboarding" | "login" | "otp" | "profile";

const T = {
  purple: "#4B3869",
  purpleMid: "#6B3FA0",
  purpleLight: "#9B6BC8",
  purplePale: "#F0E6FA",
  purpleBorder: "#D4B0EC",
  coral: "#F4928C",
  coralDeep: "#EF7B73",
  pink: "#E8759A",
  pinkPale: "#FDE8F0",
  cream: "#FDF3EE",
  bg: "#FDF0F5",
  textDark: "#3D1A6B",
  textMid: "#8B6AAA",
  textLight: "#C4A0D8",
};

// Left panel — always the same branding panel
function LeftPanel({ slideIdx }: { slideIdx: number }) {
  const slide = SLIDES[slideIdx];
  return (
    <div style={{
      flex: "0 0 420px",
      background: `linear-gradient(160deg, ${T.purple} 0%, ${T.purpleMid} 60%, #9B50C8 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 40px", position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(232,117,154,0.15)" }} />
      <div style={{ position: "absolute", top: "40%", left: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      {/* Logo */}
      <div style={{ position: "absolute", top: 32, left: 36, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield style={{ width: 20, height: 20, color: T.purpleMid }} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: "white", letterSpacing: "-0.3px" }}>RoadSync</span>
      </div>

      {/* Main illustration area */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
        {/* Big emoji card */}
        <div style={{
          width: 160, height: 160, borderRadius: 48,
          background: "rgba(255,255,255,0.12)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 72, margin: "0 auto 36px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)",
          transition: "all 0.4s cubic-bezier(0.34,1.4,0.64,1)",
        }}>
          {slide.emoji}
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 900, color: "white", margin: "0 0 14px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 48px", lineHeight: 1.7, fontWeight: 500 }}>
          {slide.desc}
        </p>

        {/* Slide dots */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              height: 7, borderRadius: 4,
              background: i === slideIdx ? "white" : "rgba(255,255,255,0.25)",
              width: i === slideIdx ? 24 : 7,
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div style={{ position: "absolute", bottom: 32, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Greater Noida · Civic Platform
        </p>
      </div>
    </div>
  );
}

// Shared right panel wrapper
function RightPanel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 52px", background: "white", overflowY: "auto",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {children}
      </div>
    </div>
  );
}

// Shared input
function Input({ label, type = "text", placeholder, value, onChange, prefix }: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; prefix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        {prefix}
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, padding: "13px 16px", borderRadius: 14, fontSize: 14,
            color: T.textDark, fontWeight: 600, outline: "none",
            background: focused ? "white" : "#FAFAFA",
            border: `2px solid ${focused ? T.purpleMid : "#EEE8F8"}`,
            boxShadow: focused ? `0 0 0 4px rgba(107,63,160,0.08)` : "none",
            transition: "all 0.2s", boxSizing: "border-box" as const,
          }}
        />
      </div>
    </div>
  );
}

// Primary button
function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "15px", borderRadius: 16,
      fontSize: 15, fontWeight: 800, color: "white",
      background: disabled ? "#E8D0F0" : `linear-gradient(135deg, ${T.purpleMid}, #9B50C8)`,
      border: "none", cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 10px 28px rgba(107,63,160,0.3)",
      transition: "all 0.2s", letterSpacing: "-0.2px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      {children}
    </button>
  );
}

// Outer shell — split on desktop, stacked on mobile
function Shell({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: T.bg,
      display: "flex", flexDirection: "row",
    }}>
      {/* Left panel hidden on small screens via inline media-query workaround */}
      <div className="onboarding-left" style={{ display: "flex" }}>
        {left}
      </div>
      {right}
      <style>{`
        @media (max-width: 768px) {
          .onboarding-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("splash");
  const [slideIdx, setSlideIdx] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  React.useEffect(() => {
    if (step === "splash") {
      const t = setTimeout(() => setStep("onboarding"), 2000);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Auto-advance slide
  React.useEffect(() => {
    if (step === "login" || step === "otp" || step === "profile") {
      const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 3000);
      return () => clearInterval(t);
    }
  }, [step]);

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp.join("").length < 4) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep("profile");
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 3) otpRefs[idx + 1].current?.focus();
    if (!val && idx > 0) otpRefs[idx - 1].current?.focus();
  };

  const handleComplete = () => {
    if (!name.trim()) return;
    onComplete({ name: name.trim(), phone, area, avatar });
  };

  /* ── SPLASH ── */
  if (step === "splash") return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: `linear-gradient(160deg, ${T.purple} 0%, ${T.purpleMid} 60%, #9B50C8 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", bottom: 60, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(232,117,154,0.15)" }} />
      <div style={{ animation: "splashPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", marginBottom: 28, margin: "0 auto 28px" }}>
          <Shield style={{ width: 52, height: 52, color: T.purpleMid }} />
        </div>
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: "white", margin: "0 0 8px", letterSpacing: "-0.5px" }}>RoadSync</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0, fontWeight: 500 }}>Civic Issue Platform · Greater Noida</p>
      <div style={{ position: "absolute", bottom: 52, display: "flex", gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "white" : "rgba(255,255,255,0.3)", animation: `dotPulse 1.5s ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`
        @keyframes splashPop { from { transform: scale(0.4) rotate(-10deg); opacity: 0; } to { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes dotPulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.3); } }
      `}</style>
    </div>
  );

  /* ── ONBOARDING SLIDES (mobile only, desktop goes straight to login) ── */
  if (step === "onboarding") {
    const slide = SLIDES[slideIdx];
    return (
      <>
        {/* Desktop: skip straight to login layout */}
        <div className="onboarding-desktop-skip" style={{ display: "none" }}>
          {/* auto-redirect */}
          {(() => { setTimeout(() => setStep("login"), 0); return null; })()}
        </div>
        {/* Mobile slides */}
        <div style={{ position: "fixed", inset: 0, background: T.bg, display: "flex", flexDirection: "column", zIndex: 200 }}>
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setStep("login")} style={{ fontSize: 13, fontWeight: 700, color: T.textLight, background: "none", border: "none", cursor: "pointer" }}>Skip →</button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <div style={{ width: 160, height: 160, borderRadius: 48, background: `linear-gradient(135deg, ${T.purplePale}, #FDE8F0)`, border: `2px solid ${T.purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, marginBottom: 40, boxShadow: `0 24px 60px ${slide.accent}20`, transition: "all 0.4s" }}>
              {slide.emoji}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: T.textDark, margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>{slide.title}</h2>
            <p style={{ fontSize: 15, color: T.textMid, margin: 0, maxWidth: 280, lineHeight: 1.7 }}>{slide.desc}</p>
          </div>
          <div style={{ padding: "24px 32px 52px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {SLIDES.map((_, i) => (
                <div key={i} onClick={() => setSlideIdx(i)} style={{ height: 8, borderRadius: 4, cursor: "pointer", background: i === slideIdx ? slide.accent : T.purpleBorder, width: i === slideIdx ? 28 : 8, transition: "all 0.3s" }} />
              ))}
            </div>
            <button onClick={() => slideIdx < SLIDES.length - 1 ? setSlideIdx(slideIdx + 1) : setStep("login")}
              style={{ width: 56, height: 56, borderRadius: 20, background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}CC)`, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 10px 28px ${slide.accent}40` }}>
              <ArrowRight style={{ width: 24, height: 24, color: "white" }} />
            </button>
          </div>
        </div>
        <style>{`@media (min-width: 769px) { .onboarding-desktop-skip { display: block !important; } }`}</style>
      </>
    );
  }

  /* ── LOGIN ── */
  if (step === "login") return (
    <Shell
      left={<LeftPanel slideIdx={slideIdx} />}
      right={
        <RightPanel>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: T.purplePale, border: `1px solid ${T.purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield style={{ width: 20, height: 20, color: T.purpleMid }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: T.textDark }}>RoadSync</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.textDark, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Welcome back 👋</h1>
            <p style={{ fontSize: 14, color: T.textMid, margin: 0, fontWeight: 500 }}>Sign in to report and track civic issues</p>
          </div>

          {/* Phone input */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Mobile Number</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ padding: "13px 14px", borderRadius: 14, background: T.purplePale, border: `1px solid ${T.purpleBorder}`, fontSize: 13, fontWeight: 700, color: T.textDark, flexShrink: 0, whiteSpace: "nowrap" }}>
                🇮🇳 +91
              </div>
              <input
                type="tel" placeholder="10-digit mobile number" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={{ flex: 1, padding: "13px 16px", borderRadius: 14, fontSize: 14, color: T.textDark, fontWeight: 600, outline: "none", background: "#FAFAFA", border: `2px solid #EEE8F8`, transition: "all 0.2s", boxSizing: "border-box" as const }}
                onFocus={e => { e.target.style.border = `2px solid ${T.purpleMid}`; e.target.style.background = "white"; e.target.style.boxShadow = `0 0 0 4px rgba(107,63,160,0.08)`; }}
                onBlur={e => { e.target.style.border = "2px solid #EEE8F8"; e.target.style.background = "#FAFAFA"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          <PrimaryBtn onClick={handleSendOtp} disabled={phone.length < 10 || loading}>
            {loading ? "Sending OTP..." : <><span>Send OTP</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
          </PrimaryBtn>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#EEE8F8" }} />
            <span style={{ fontSize: 12, color: T.textLight, fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#EEE8F8" }} />
          </div>

          <button onClick={() => onComplete({ name: "Guest User", phone: "0000000000", area: "Greater Noida", avatar: "👤" })}
            style={{ width: "100%", padding: "13px", borderRadius: 14, fontSize: 14, fontWeight: 700, color: T.textMid, background: "white", border: `2px solid #EEE8F8`, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.purpleBorder; (e.currentTarget as HTMLElement).style.background = T.purplePale; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#EEE8F8"; (e.currentTarget as HTMLElement).style.background = "white"; }}>
            Continue as Guest 👤
          </button>

          <p style={{ fontSize: 11, color: T.textLight, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </RightPanel>
      }
    />
  );

  /* ── OTP ── */
  if (step === "otp") return (
    <Shell
      left={<LeftPanel slideIdx={slideIdx} />}
      right={
        <RightPanel>
          <button onClick={() => setStep("login")} style={{ background: T.purplePale, border: `1px solid ${T.purpleBorder}`, color: T.purpleMid, borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 32 }}>← Back</button>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.textDark, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Verify OTP 🔐</h1>
            <p style={{ fontSize: 14, color: T.textMid, margin: 0 }}>Code sent to +91 {phone.slice(0, 5)}XXXXX</p>
          </div>

          {/* OTP boxes */}
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            {otp.map((digit, idx) => (
              <input key={idx} ref={otpRefs[idx]} type="tel" maxLength={1} value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                style={{
                  flex: 1, height: 64, borderRadius: 16, textAlign: "center",
                  fontSize: 24, fontWeight: 800, color: T.textDark, outline: "none",
                  background: digit ? T.purplePale : "#FAFAFA",
                  border: digit ? `2px solid ${T.purpleMid}` : `2px solid #EEE8F8`,
                  boxShadow: digit ? `0 4px 16px rgba(107,63,160,0.15)` : "none",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>

          <PrimaryBtn onClick={handleVerifyOtp} disabled={otp.join("").length < 4 || loading}>
            {loading ? "Verifying..." : <><span>Verify & Continue</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
          </PrimaryBtn>

          <p style={{ fontSize: 13, color: T.textMid, textAlign: "center", marginTop: 20 }}>
            Didn't receive?{" "}
            <button onClick={handleSendOtp} style={{ color: T.purpleMid, fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Resend OTP</button>
          </p>

          <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 12, background: T.pinkPale, border: `1px solid #F2B8CC` }}>
            <p style={{ fontSize: 12, color: T.pink, margin: 0, textAlign: "center", fontWeight: 600 }}>💡 Demo: enter any 4 digits to continue</p>
          </div>
        </RightPanel>
      }
    />
  );

  /* ── PROFILE ── */
  if (step === "profile") return (
    <Shell
      left={<LeftPanel slideIdx={slideIdx} />}
      right={
        <RightPanel>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.textDark, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Set Up Profile 🎉</h1>
            <p style={{ fontSize: 14, color: T.textMid, margin: 0 }}>Almost there — tell us about yourself</p>
          </div>

          {/* Avatar picker */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Choose Avatar</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {AVATARS.map(av => (
                <button key={av} onClick={() => setAvatar(av)} style={{
                  padding: "12px 8px", borderRadius: 14, fontSize: 26, cursor: "pointer",
                  background: avatar === av ? T.purplePale : "#FAFAFA",
                  border: avatar === av ? `2px solid ${T.purpleMid}` : `2px solid #EEE8F8`,
                  boxShadow: avatar === av ? `0 4px 14px rgba(107,63,160,0.15)` : "none",
                  transform: avatar === av ? "scale(1.06)" : "scale(1)",
                  transition: "all 0.18s", position: "relative",
                }}>
                  {av}
                  {avatar === av && (
                    <div style={{ position: "absolute", top: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: T.purpleMid, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check style={{ width: 8, height: 8, color: "white" }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Full Name</label>
            <input type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 14, fontSize: 14, color: T.textDark, fontWeight: 600, outline: "none", background: "#FAFAFA", border: "2px solid #EEE8F8", transition: "all 0.2s", boxSizing: "border-box" as const }}
              onFocus={e => { e.target.style.border = `2px solid ${T.purpleMid}`; e.target.style.background = "white"; e.target.style.boxShadow = `0 0 0 4px rgba(107,63,160,0.08)`; }}
              onBlur={e => { e.target.style.border = "2px solid #EEE8F8"; e.target.style.background = "#FAFAFA"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Area */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              <MapPin style={{ width: 11, height: 11, display: "inline", marginRight: 4, verticalAlign: "-1px" }} />
              Area / Sector
            </label>
            <select value={area} onChange={e => setArea(e.target.value)}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 14, fontSize: 14, color: T.textDark, fontWeight: 600, outline: "none", background: "#FAFAFA", border: "2px solid #EEE8F8", cursor: "pointer", boxSizing: "border-box" as const, transition: "all 0.2s" }}
              onFocus={e => { (e.target as HTMLElement).style.border = `2px solid ${T.purpleMid}`; }}
              onBlur={e => { (e.target as HTMLElement).style.border = "2px solid #EEE8F8"; }}>
              {AREAS.map(ar => <option key={ar} value={ar}>{ar}</option>)}
            </select>
          </div>

          <PrimaryBtn onClick={handleComplete} disabled={!name.trim()}>
            <span>Let's Go!</span>
            <span style={{ fontSize: 16 }}>🚀</span>
          </PrimaryBtn>
        </RightPanel>
      }
    />
  );

  return null;
}
