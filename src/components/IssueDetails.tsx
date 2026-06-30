import React, { useState } from "react";
import { CivicIssue } from "../types";
import {
  Sparkles, MapPin, ThumbsUp, Send, CheckCircle2, Clock,
  Calendar, MessageSquare, AlertCircle, Wrench, ShieldAlert,
  Shield, AlertTriangle, Flame, User
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface IssueDetailsProps {
  issue: CivicIssue;
  onUpvote: (id: string) => void;
  onStatusChange: (id: string, newStatus: "reported" | "verified" | "assigned" | "in_progress" | "resolved") => void;
  onVerify: (id: string) => void;
  onFlagDuplicate: (id: string) => void;
  onAddComment: (id: string, author: string, text: string) => void;
  userSessionId: string;
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

export default function IssueDetails({
  issue, onUpvote, onStatusChange, onVerify, onFlagDuplicate, onAddComment, userSessionId,
}: IssueDetailsProps) {
  const { t, language } = useLanguage();
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const hasUpvoted = issue.upvotedByUserIds?.includes(userSessionId);
  const hasVerified = issue.verifiedByUserIds?.includes(userSessionId);
  const hasFlagged = issue.duplicateFlagUserIds?.includes(userSessionId);
  const verifyCount = issue.verifiedByUserIds?.length || 0;
  const duplicateCount = issue.duplicateFlagUserIds?.length || 0;
  const isCommunityVerified = verifyCount >= 3 || issue.upvotes > 10;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    await onAddComment(issue.id, commentAuthor.trim() || t("details.anonymousCitizen"), commentText.trim());
    setCommentText("");
    setIsSubmitting(false);
  };

  const formattedDate = (isoString: string) => {
    try {
      const locale = language === "hi" ? "hi-IN" : "en-US";
      return new Date(isoString).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return isoString; }
  };

  const severityConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    critical: { label: t("severity.critical"), color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: ShieldAlert },
    high:     { label: t("severity.high"),     color: T.pink,    bg: T.pinkPale, border: T.pinkBorder, icon: Flame },
    medium:   { label: t("severity.medium"),   color: T.purple,  bg: T.purplePale, border: T.purpleBorder, icon: AlertTriangle },
    low:      { label: t("severity.low"),      color: T.textLight, bg: "#F5F0FA", border: "#E8D8F4", icon: AlertCircle },
  };

  const sev = severityConfig[issue.severity] || severityConfig.low;
  const SevIcon = sev.icon;

  const categoryLabel: Record<string, string> = {
    pothole:     t("cat.pothole"),
    streetlight: t("cat.streetlight"),
    garbage:     t("cat.garbage"),
    other:       t("cat.other"),
  };

  const statusSteps = [
    { key: "reported",    label: t("status.reported"),    icon: AlertCircle,  color: "#ef4444" },
    { key: "verified",    label: t("status.verified"),    icon: CheckCircle2, color: T.purple },
    { key: "assigned",    label: t("status.assigned"),    icon: Shield,       color: T.purpleLight },
    { key: "in_progress", label: t("status.inProgress"),  icon: Wrench,       color: T.pink },
    { key: "resolved",    label: t("status.resolved"),    icon: CheckCircle2, color: "#22c55e" },
  ];
  const currentStepIndex = statusSteps.findIndex(s => s.key === issue.status);

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    background: "white", border: `2px solid ${focused ? T.purple : T.purpleBorder}`,
    color: T.textDark, outline: "none", borderRadius: "14px", padding: "10px 14px",
    fontSize: "12px", width: "100%", boxSizing: "border-box", fontWeight: 600,
    boxShadow: focused ? `0 0 0 3px rgba(107,63,160,0.1)` : "none",
    transition: "all 0.2s",
  });

  const card: React.CSSProperties = {
    borderRadius: "20px", background: "white",
    border: `1px solid ${T.purpleBorder}`,
    boxShadow: "0 3px 16px rgba(107,63,160,0.07)",
  };

  return (
    <div style={{
      borderRadius: "24px",
      overflow: "hidden",
      background: T.bg,
      border: `1px solid ${T.purpleBorder}`,
      boxShadow: "0 4px 24px rgba(107,63,160,0.1)",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
    }}>
      <div style={{ padding: "16px 16px 20px", width: "100%", boxSizing: "border-box" }}>

        {/* IMAGE */}
        <div style={{
          position: "relative", width: "100%", height: "200px", borderRadius: "18px",
          overflow: "hidden", background: T.purplePale, border: `1px solid ${T.purpleBorder}`,
          marginBottom: "16px",
        }}>
          {issue.imageUrl ? (
            <img src={issue.imageUrl} alt={issue.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "8px" }}>
              <span style={{ fontSize: "48px" }}>{issue.category === "pothole" ? "🕳️" : issue.category === "streetlight" ? "💡" : issue.category === "garbage" ? "🗑️" : "🔧"}</span>
              <p style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: 800, color: T.textLight, margin: 0, letterSpacing: "0.1em" }}>{t("details.noPhotoUploaded")}</p>
            </div>
          )}
          <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
            <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
              <SevIcon style={{ width: "11px", height: "11px" }} />{sev.label}
            </span>
            {isCommunityVerified && (
              <span style={{ padding: "3px 8px", borderRadius: "20px", background: "#dcfce7", color: "#166534", fontSize: "9px", fontWeight: 800, border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "3px" }}>
                <CheckCircle2 style={{ width: "10px", height: "10px" }} />{t("status.verified")}
              </span>
            )}
          </div>
          <div style={{ position: "absolute", bottom: "10px", left: "10px", borderRadius: "12px", padding: "5px 10px", background: "rgba(255,255,255,0.92)", fontSize: "9px", fontWeight: 700, color: T.textMid, display: "flex", alignItems: "center", gap: "4px", border: `1px solid ${T.purpleBorder}`, backdropFilter: "blur(4px)" }}>
            <Calendar style={{ width: "11px", height: "11px", color: T.pink }} />
            {formattedDate(issue.createdAt)}
          </div>
        </div>

        {/* TITLE + ADDRESS */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: 800, padding: "3px 10px", borderRadius: "8px", background: T.purplePale, color: T.purple, border: `1px solid ${T.purpleBorder}`, letterSpacing: "0.05em" }}>{categoryLabel[issue.category] || issue.category}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: T.textMid, fontWeight: 600, minWidth: 0 }}>
              <MapPin style={{ width: "12px", height: "12px", color: T.pink, flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.address}</span>
            </div>
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 900, color: T.textDark, margin: "0 0 10px", letterSpacing: "-0.3px", lineHeight: 1.3, wordBreak: "break-word" }}>{issue.title}</h2>
          <p style={{ fontSize: "12px", color: T.textMid, lineHeight: 1.7, margin: 0, padding: "12px 14px", borderRadius: "14px", background: T.purplePale, border: `1px solid ${T.purpleBorder}`, fontWeight: 500, wordBreak: "break-word" }}>
            {issue.description}
          </p>
        </div>

        {/* AI DIAGNOSTIC */}
        <div style={{ borderRadius: "18px", overflow: "hidden", border: `1px solid ${T.purpleBorder}`, marginBottom: "14px", background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: `linear-gradient(135deg, ${T.purple}10, ${T.pink}08)`, flexWrap: "wrap" }}>
            <Sparkles style={{ width: "14px", height: "14px", color: T.purple, flexShrink: 0 }} />
            <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 800, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`, display: "flex", alignItems: "center", gap: "4px" }}>
              <SevIcon style={{ width: "11px", height: "11px" }} />{sev.label}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.05em" }}>{categoryLabel[issue.category] || issue.category}</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "48px", height: "5px", borderRadius: "3px", background: T.purplePale, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: "3px", background: `linear-gradient(90deg, ${T.purple}, ${T.purpleLight})`, width: `${issue.priorityScore || 50}%` }} />
              </div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: T.purple }}>{issue.priorityScore || 50}%</span>
            </div>
          </div>
          <div style={{ padding: "10px 14px 12px", fontSize: "11px", color: T.textMid, lineHeight: 1.5, fontWeight: 500, wordBreak: "break-word" }}>
            {issue.summary || issue.description} · {t("details.dispatch")}: <span style={{ fontWeight: 800, color: T.textDark }}>{issue.suggestedDepartment || t("details.deptPublicWorks")}</span>
          </div>
          <details>
            <summary style={{ padding: "10px 14px", fontSize: "10px", fontWeight: 800, color: T.purple, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", listStyle: "none", borderTop: `1px solid ${T.purpleBorder}` }}>
              ▸ {t("details.showAiDetails")}
            </summary>
            <div style={{ padding: "12px 14px", background: T.purplePale }}>
              <p style={{ fontSize: "9px", fontWeight: 800, color: T.purple, textTransform: "uppercase", margin: "0 0 4px", letterSpacing: "0.06em" }}>{t("details.recommendedRemedy")}</p>
              <p style={{ fontSize: "11px", color: T.textMid, margin: "0 0 12px", lineHeight: 1.5, fontWeight: 500 }}>{issue.recommendedAction || t("details.defaultRemedy")}</p>
              <p style={{ fontSize: "9px", fontWeight: 800, color: T.purple, textTransform: "uppercase", margin: "0 0 6px", letterSpacing: "0.06em" }}>{t("details.aiConfidence")}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(107,63,160,0.15)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "3px", background: `linear-gradient(90deg, ${T.purple}, ${T.purpleLight})`, width: `${issue.confidenceScore || 85}%` }} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: T.purple }}>{issue.confidenceScore || 85}%</span>
              </div>
              <p style={{ fontSize: "9px", color: T.textLight, margin: "10px 0 0", fontWeight: 600 }}>gemini-2.5-flash</p>
            </div>
          </details>
        </div>

        {/* STATUS TIMELINE */}
        <div style={{ ...card, padding: "16px", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "11px", fontWeight: 800, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock style={{ width: "13px", height: "13px", color: T.pink }} />{t("details.resolutionTimeline")}
          </h3>
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", overflowX: "auto", paddingBottom: "4px" }}>
            <div style={{ position: "absolute", top: "12px", left: 0, right: 0, height: "2px", background: T.purplePale, zIndex: 0 }} />
            {statusSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "1 0 44px", position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isCurrent ? step.color : isPassed ? T.purplePale : "white",
                    border: isCurrent ? `2px solid ${step.color}` : isPassed ? `2px solid ${step.color}` : `2px solid ${T.purpleBorder}`,
                    transform: isCurrent ? "scale(1.25)" : "scale(1)",
                    boxShadow: isCurrent ? `0 0 0 4px ${step.color}25` : "none",
                    transition: "all 0.3s",
                    flexShrink: 0,
                  }}>
                    <StepIcon style={{ width: "11px", height: "11px", color: isCurrent ? "white" : isPassed ? step.color : T.textLight }} />
                  </div>
                  <p style={{ fontSize: "9px", fontWeight: 800, textAlign: "center", color: isCurrent ? step.color : isPassed ? T.textMid : T.textLight, margin: 0, whiteSpace: "nowrap" }}>{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMMUNITY CONTROLS */}
        <div style={{ ...card, padding: "16px", marginBottom: "14px" }}>
          <p style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textLight, margin: "0 0 12px" }}>{t("details.communityControls")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button type = "button" onClick={() => onUpvote(issue.id)}
              style={{
                height: "40px", borderRadius: "14px", fontSize: "11px", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                cursor: "pointer", border: "none", transition: "all 0.2s",
                background: hasUpvoted ? `linear-gradient(135deg, ${T.purple}, ${T.purpleLight})` : T.purplePale,
                color: hasUpvoted ? "white" : T.purple,
                boxShadow: hasUpvoted ? `0 4px 14px rgba(107,63,160,0.35)` : "none",
                minWidth: 0,
              }}>
              <ThumbsUp style={{ width: "13px", height: "13px", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t("details.upvote")} ({issue.upvotes})</span>
            </button>

            <button type = "button" onClick={() => onVerify(issue.id)}
              style={{
                height: "40px", borderRadius: "14px", fontSize: "11px", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                cursor: "pointer", border: "none", transition: "all 0.2s",
                background: hasVerified ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#f0fdf4",
                color: hasVerified ? "white" : "#16a34a",
                boxShadow: hasVerified ? "0 4px 14px rgba(34,197,94,0.35)" : "none",
                minWidth: 0,
              }}>
              <CheckCircle2 style={{ width: "13px", height: "13px", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t("details.verify")} ({verifyCount})</span>
            </button>

            <button type = "button" onClick={() => onFlagDuplicate(issue.id)}
              style={{
                gridColumn: "span 2", height: "40px", borderRadius: "14px", fontSize: "11px", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                cursor: "pointer", border: "none", transition: "all 0.2s",
                background: hasFlagged ? "linear-gradient(135deg, #ef4444, #dc2626)" : "#fef2f2",
                color: hasFlagged ? "white" : "#ef4444",
                boxShadow: hasFlagged ? "0 4px 14px rgba(239,68,68,0.3)" : "none",
                minWidth: 0,
              }}>
              <AlertTriangle style={{ width: "13px", height: "13px", flexShrink: 0 }} />
              {t("details.flagDuplicate")} ({duplicateCount})
            </button>
          </div>
        </div>

        {/* DISTRICT SIMULATION */}
        <div style={{ padding: "16px", borderRadius: "20px", background: `linear-gradient(135deg, ${T.purple}15, ${T.pink}08)`, border: `1px solid ${T.purpleBorder}`, marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <Shield style={{ width: "14px", height: "14px", color: T.purple, flexShrink: 0 }} />
            <p style={{ fontSize: "10px", fontWeight: 800, color: T.purple, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{t("details.districtSimPanel")}</p>
          </div>
          <p style={{ fontSize: "10px", color: T.textLight, margin: "0 0 12px", fontWeight: 600 }}>{t("details.districtSimDesc")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {statusSteps.map((step) => (
              <button type = "button" key={step.key} onClick={() => onStatusChange(issue.id, step.key as any)}
                style={{
                  height: "34px", padding: "0 14px", borderRadius: "10px", fontSize: "10px",
                  fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em",
                  cursor: "pointer", border: "none", transition: "all 0.2s",
                  background: issue.status === step.key ? `linear-gradient(135deg, ${T.purple}, ${T.purpleLight})` : "white",
                  color: issue.status === step.key ? "white" : T.textMid,
                  boxShadow: issue.status === step.key ? `0 4px 14px rgba(107,63,160,0.3)` : `0 1px 4px rgba(107,63,160,0.08)`,
                  flexShrink: 0,
                }}>
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* COMMENTS */}
        <div>
          <h3 style={{ fontSize: "11px", fontWeight: 800, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px", paddingBottom: "10px", borderBottom: `1px solid ${T.purpleBorder}`, display: "flex", alignItems: "center", gap: "6px" }}>
            <MessageSquare style={{ width: "13px", height: "13px", color: T.pink }} />
            {t("details.citizenComments")} ({issue.comments?.length || 0})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            {(!issue.comments || issue.comments.length === 0) ? (
              <p style={{ fontSize: "11px", color: T.textLight, fontStyle: "italic", padding: "8px 0", fontWeight: 500 }}>{t("details.noCommentsYet")}</p>
            ) : (
              issue.comments.map((comment) => {
                const isSystem = comment.author === "System Dispatcher";
                return (
                  <div key={comment.id} style={{
                    padding: "10px 12px", borderRadius: "14px",
                    background: isSystem ? "#EBD8F8" : T.purplePale,
                    border: `1px solid ${isSystem ? T.purpleLight + "50" : T.purpleBorder}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: isSystem ? T.purple : T.textDark, display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                        <User style={{ width: "11px", height: "11px", color: T.textLight, flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isSystem ? t("details.systemDispatcher") : comment.author}</span>
                      </span>
                      <span style={{ fontSize: "9px", color: T.textLight, fontWeight: 600, flexShrink: 0 }}>{formattedDate(comment.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: T.textMid, margin: 0, lineHeight: 1.5, paddingLeft: "15px", fontWeight: 500, wordBreak: "break-word" }}>{comment.text}</p>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleCommentSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
              <input
                type="text"
                placeholder={t("details.yourNameOptional")}
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                onFocus={() => setFocusedField("author")}
                onBlur={() => setFocusedField(null)}
                style={inputStyle(focusedField === "author")}
              />
              <textarea
                placeholder={t("details.addHelpfulDetails")}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onFocus={() => setFocusedField("text")}
                onBlur={() => setFocusedField(null)}
                rows={3}
                style={{
                  ...inputStyle(focusedField === "text"),
                  resize: "none",
                  fontFamily: "inherit",
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                height: "36px",
                borderRadius: "14px",
                border: "none",
                background: isSubmitting ? T.purpleBorder : `linear-gradient(135deg, ${T.purple}, ${T.purpleLight})`,
                color: "white",
                fontSize: "11px",
                fontWeight: 800,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s",
                boxShadow: isSubmitting ? "none" : `0 4px 12px rgba(107,63,160,0.25)`,
              }}
            >
              <Send style={{ width: "12px", height: "12px" }} />
              {isSubmitting ? t("details.sending") : t("details.addComment")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
