import { useState } from "react";
import { CivicIssue } from "../types";
import { Search, ThumbsUp, MapPin } from "lucide-react";
import { T, sevStyle, statStyle, catIcon } from "../styles/tokens";
import { useLanguage } from "../contexts/LanguageContext";

interface IssueListProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: CivicIssue) => void;
  onUpvoteIssue: (id: string) => void;
  userSessionId: string;
  theme?: "light" | "dark";
}

export default function IssueList({
  issues,
  selectedIssueId,
  onSelectIssue,
  onUpvoteIssue,
  userSessionId,
}: IssueListProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm]           = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus]     = useState("all");

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch &&
      (selectedCategory === "all" || issue.category === selectedCategory) &&
      (selectedSeverity === "all" || issue.severity === selectedSeverity) &&
      (selectedStatus === "all" || issue.status === selectedStatus)
    );
  });

  // Translated label maps — falls back to the raw key if a translation is missing
  const categoryLabel: Record<string, string> = {
    all:         t("cat.all"),
    pothole:     t("cat.pothole"),
    streetlight: t("cat.streetlight"),
    garbage:     t("cat.garbage"),
    other:       t("cat.other"),
  };

  const statusLabel: Record<string, string> = {
    reported:    t("status.reported"),
    verified:    t("status.verified"),
    assigned:    t("status.assigned"),
    in_progress: t("status.inProgress"),
    resolved:    t("status.resolved"),
  };

  const severityLabel: Record<string, string> = {
    critical: t("severity.critical"),
    high:     t("severity.high"),
    medium:   t("severity.medium"),
    low:      t("severity.low"),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            width: 14,
            height: 14,
            color: T.textLight,
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("issueList.searchPlaceholder")}
          style={{
            width: "100%",
            borderRadius: 14,
            border: `1px solid ${T.border}`,
            padding: "10px 14px 10px 36px",
            fontSize: 12,
            color: T.text,
            background: T.surfaceAlt,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.violetMid; e.currentTarget.style.background = T.surface; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = T.border;    e.currentTarget.style.background = T.surfaceAlt; }}
        />
      </div>

      {/* Category chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {["all", "pothole", "streetlight", "garbage", "other"].map((cat) => (
          <button type = "button"
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              borderRadius: 999,
              padding: "5px 14px",
              fontSize: 10,
              fontWeight: 700,
              whiteSpace: "nowrap",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: selectedCategory === cat ? T.violet : T.surfaceAlt,
              color: selectedCategory === cat ? "#fff" : T.textMid,
              transition: "all 0.15s",
            }}
          >
            {cat !== "all" && `${catIcon[cat]} `}
            {categoryLabel[cat]}
          </button>
        ))}
      </div>

      {/* Dropdowns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          {
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
              ["all", t("issueList.allStatuses")],
              ["reported", statusLabel.reported],
              ["verified", statusLabel.verified],
              ["assigned", statusLabel.assigned],
              ["in_progress", statusLabel.in_progress],
              ["resolved", statusLabel.resolved],
            ],
          },
          {
            value: selectedSeverity,
            onChange: setSelectedSeverity,
            options: [
              ["all", t("issueList.allSeverities")],
              ["critical", severityLabel.critical],
              ["high", severityLabel.high],
              ["medium", severityLabel.medium],
              ["low", severityLabel.low],
            ],
          },
        ].map((sel, idx) => (
          <select
            key={idx}
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            style={{
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 12,
              padding: "8px 10px",
              background: T.surfaceAlt,
              color: T.textMid,
              border: `1px solid ${T.border}`,
              outline: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {sel.options.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Issue Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredIssues.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              borderRadius: 20,
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
            }}
          >
            <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>🔍</span>
            <p style={{ fontSize: 12, color: T.textLight, fontWeight: 600, margin: 0 }}>{t("issueList.noIssuesFound")}</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isSelected    = selectedIssueId === issue.id;
            const hasUpvoted    = issue.upvotedByUserIds?.includes(userSessionId);
            const verifiedCount = issue.verifiedByUserIds?.length || 0;
            const sev  = sevStyle[issue.severity]  || sevStyle.low;
            const stat = statStyle[issue.status]   || statStyle.reported;

            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                style={{
                  background: isSelected ? T.surfaceAlt : T.surface,
                  borderRadius: 20,
                  border: `1.5px solid ${isSelected ? T.violetMid : T.border}`,
                  padding: "12px 14px",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  boxShadow: isSelected
                    ? "0 4px 18px rgba(123,79,166,0.18)"
                    : "0 1px 4px rgba(74,44,106,0.06)",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(74,44,106,0.12)";
                    (e.currentTarget as HTMLElement).style.transform  = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(74,44,106,0.06)";
                    (e.currentTarget as HTMLElement).style.transform  = "translateY(0)";
                  }
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: sev.bg,
                    border: `1px solid ${sev.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {issue.imageUrl ? (
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    catIcon[issue.category] || "🔧"
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: sev.color,
                        background: sev.bg,
                        border: `1px solid ${sev.border}`,
                        borderRadius: 999,
                        padding: "2px 7px",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {severityLabel[issue.severity] || issue.severity}
                    </span>
                    {verifiedCount > 0 && (
                      <span style={{ fontSize: 9, color: "#2E7D5E", fontWeight: 700 }}>
                        ✓ {verifiedCount}
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.text,
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {issue.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <MapPin style={{ width: 10, height: 10, color: T.textLight, flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: 10,
                        color: T.textLight,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {issue.address}
                    </span>
                  </div>
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: stat.color,
                      background: stat.bg,
                      border: `1px solid ${stat.border}`,
                      borderRadius: 999,
                      padding: "2px 8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {statusLabel[issue.status] || stat.label}
                  </span>
                  <button
  type="button"
  onClick={(e) => { e.stopPropagation(); onUpvoteIssue(issue.id); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                      background: hasUpvoted ? "#EDE0FF" : T.surfaceAlt,
                      color:      hasUpvoted ? T.violetMid : T.textLight,
                    }}
                    onMouseEnter={(e) => {
                      if (!hasUpvoted) {
                        (e.currentTarget as HTMLElement).style.background = "#EDE0FF";
                        (e.currentTarget as HTMLElement).style.color = T.violetMid;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!hasUpvoted) {
                        (e.currentTarget as HTMLElement).style.background = T.surfaceAlt;
                        (e.currentTarget as HTMLElement).style.color = T.textLight;
                      }
                    }}
                  >
                    <ThumbsUp style={{ width: 11, height: 11, fill: hasUpvoted ? T.violetMid : "none" }} />
                    <span>{issue.upvotes}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

