import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Languages } from "lucide-react";

interface TranslateButtonProps {
  style?: React.CSSProperties;
}

export default function TranslateButton({ style }: TranslateButtonProps) {
  const { toggleLanguage, t, language } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      title={language === "en" ? "Switch to Hindi" : "Switch to English"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "10px",
        border: "1.5px solid rgba(255,255,255,0.35)",
        background: "rgba(255,255,255,0.13)",
        color: "white",
        fontWeight: 700,
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.18s",
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.55)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.13)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.35)";
      }}
    >
      <Languages style={{ width: "13px", height: "13px", flexShrink: 0 }} />
      {t("lang.toggle")}
    </button>

  );
}