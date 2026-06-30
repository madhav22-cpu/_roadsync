import React from "react";
import { CivicIssue } from "../types";
import { PlusCircle, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";
import { T } from "../styles/tokens";

interface DashboardMetricsProps {
  issues: CivicIssue[];
  theme?: "light" | "dark";
}

export default function DashboardMetrics({ issues }: DashboardMetricsProps) {
  const total = issues.length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;
  const totalUrgency = issues.reduce((acc, curr) => acc + (curr.priorityScore || 50), 0);
  const avgUrgency = total > 0 ? Math.round(totalUrgency / total) : 0;
  const verifiedCount = issues.filter(
    (i) =>
      i.status !== "reported" &&
      ((i.verifiedByUserIds?.length || 0) > 0 ||
        i.status === "verified" ||
        i.status === "resolved")
  ).length;
  const verificationRate = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;

  const metrics = [
    {
      label: "Total Reports",
      value: total,
      sub: "registered",
      icon: PlusCircle,
      color: T.violetMid,
      bg: "#EDE0FF",
      border: T.periwinkle,
    },
    {
      label: "Verification Rate",
      value: `${verificationRate}%`,
      sub: "audited",
      icon: ShieldCheck,
      color: "#1A5F9E",
      bg: "#DDEEFF",
      border: "#A8CCEE",
    },
    {
      label: "Avg Urgency",
      value: `${avgUrgency}%`,
      sub: "priority",
      icon: AlertTriangle,
      color: "#C0392B",
      bg: "#FFE8E8",
      border: "#F5C6C6",
    },
    {
      label: "Resolved Cases",
      value: resolvedCount,
      sub: `${total > 0 ? Math.round((resolvedCount / total) * 100) : 0}% done`,
      icon: CheckCircle,
      color: "#2E7D5E",
      bg: "#D4F5E8",
      border: "#A8E8CA",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.label}
            style={{
              background: m.bg,
              borderRadius: 20,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: `1px solid ${m.border}`,
              boxShadow: "0 2px 8px rgba(74,44,106,0.06)",
              transition: "transform 0.18s, box-shadow 0.18s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 20px rgba(74,44,106,0.13)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 2px 8px rgba(74,44,106,0.06)";
            }}
          >
            {/* Icon bubble */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: T.surface,
                border: `1px solid ${m.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon style={{ width: 18, height: 18, color: m.color }} />
            </div>

            {/* Text */}
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 9,
                  color: T.textLight,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {m.label}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: m.color,
                    lineHeight: 1,
                  }}
                >
                  {m.value}
                </span>
                <span style={{ fontSize: 9, color: T.textLight, fontWeight: 600 }}>
                  {m.sub}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
