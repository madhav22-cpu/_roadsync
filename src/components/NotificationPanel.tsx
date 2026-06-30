import React, { useState, useEffect, useCallback } from "react";
import { X, Bell, CheckCircle2, MessageSquare, ThumbsUp, AlertTriangle, Shield, Clock, UserPlus, MapPin, Star } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export interface Notification {
  id: string;
  type: "verified" | "resolved" | "comment" | "upvote" | "critical" | "assigned" | "friend_request" | "login";
  // titleKey/descKey are translation-dictionary keys (e.g. "notif.resolved1.title").
  // title/desc remain as a fallback for any plain-text strings not yet keyed.
  titleKey?: string;
  descKey?: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  senderName?: string;
  senderArea?: string;
  senderReports?: number;
  senderTrust?: number;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "resolved",       titleKey: "notif.resolved1.title", descKey: "notif.resolved1.desc", title: "Issue Resolved! 🎉", desc: "Deep Pothole Near Pari Chowk has been marked as resolved by the municipal team.", time: "2 min ago",  read: false },
  { id: "2", type: "verified",       titleKey: "notif.verified1.title", descKey: "notif.verified1.desc", title: "Your report was verified", desc: "3 citizens verified your report on Knowledge Park Road.", time: "15 min ago", read: false },
  { id: "3", type: "comment",        titleKey: "notif.comment1.title",  descKey: "notif.comment1.desc",  title: "New comment on your report",  desc: 'Marcus Vance commented: "Almost lost a tire here yesterday. Be very careful!"', time: "1 hr ago",  read: false },
  { id: "4", type: "friend_request", titleKey: "notif.friend1.title",   descKey: "notif.friend1.desc",   title: "Friend request from Priya M.", desc: "Priya Mehta wants to connect. She has filed 18 reports in Sector 12.", time: "2 hrs ago",  read: false,
    senderName: "Priya Mehta", senderArea: "Sector 12, Greater Noida", senderReports: 18, senderTrust: 88 },
  { id: "5", type: "critical",       titleKey: "notif.critical1.title", descKey: "notif.critical1.desc", title: "🚨 Critical issue near you",  desc: "A new critical pothole was reported at Surajpur Kasna Road, 0.3km away.", time: "2 hrs ago", read: true  },
  { id: "6", type: "upvote",         titleKey: "notif.upvote1.title",   descKey: "notif.upvote1.desc",   title: "Your report got 10 upvotes",  desc: "The community is rallying behind your report on Expressway Sector 18.", time: "3 hrs ago", read: true  },
  { id: "7", type: "assigned",       titleKey: "notif.assigned1.title", descKey: "notif.assigned1.desc", title: "Crew dispatched",             desc: "Department of Transportation assigned a crew to the streetlight issue on Gamma Road.", time: "5 hrs ago", read: true  },
  { id: "8", type: "comment",        titleKey: "notif.comment2.title",  descKey: "notif.comment2.desc",  title: "New comment on your report",  desc: 'Sarah Jenkins commented: "Reported this manually too. Glad to see it is logged here."', time: "Yesterday", read: true  },
  { id: "9", type: "verified",       titleKey: "notif.verified2.title", descKey: "notif.verified2.desc", title: "Community badge earned! 🏆",  desc: "You've reached Verified Citizen status. Your civic contributions are making a difference!", time: "Yesterday", read: true  },
];

// Pool of random auto-notifications that fire while the user is active
export const RANDOM_NOTIF_POOL: Omit<Notification, "id" | "time" | "read">[] = [
  { type: "friend_request", titleKey: "notif.auto.friend1.title", descKey: "notif.auto.friend1.desc", title: "Friend request from Arjun K.", desc: "Arjun Kumar wants to connect. He has filed 11 reports in Knowledge Park.",
    senderName: "Arjun Kumar", senderArea: "Knowledge Park, Greater Noida", senderReports: 11, senderTrust: 79 },
  { type: "comment",  titleKey: "notif.auto.comment1.title",  descKey: "notif.auto.comment1.desc",  title: "New comment on your report", desc: 'Rahul Sharma commented: "This pothole damaged my scooter too! Quick action needed."' },
  { type: "upvote",   titleKey: "notif.auto.upvote1.title",   descKey: "notif.auto.upvote1.desc",   title: "5 new upvotes on your report", desc: "Residents are upvoting your Expressway report — community pressure is building." },
  { type: "verified", titleKey: "notif.auto.verified1.title", descKey: "notif.auto.verified1.desc", title: "Another citizen verified your report", desc: "A local resident confirmed the hazard on Gamma Road. Verification count: 4." },
  { type: "friend_request", titleKey: "notif.auto.friend2.title", descKey: "notif.auto.friend2.desc", title: "Friend request from Neha S.", desc: "Neha Singh wants to connect. She has filed 7 reports in Beta 2.",
    senderName: "Neha Singh", senderArea: "Beta 2, Greater Noida", senderReports: 7, senderTrust: 72 },
  { type: "assigned", titleKey: "notif.auto.assigned1.title", descKey: "notif.auto.assigned1.desc", title: "Repair crew en route", desc: "A crew has been dispatched to the streetlight issue you reported on Delta Road." },
  { type: "critical", titleKey: "notif.auto.critical1.title", descKey: "notif.auto.critical1.desc", title: "🚨 New hazard near you", desc: "A flooded road was reported at Kasna Road intersection, 0.5km from your area." },
  { type: "resolved", titleKey: "notif.auto.resolved1.title", descKey: "notif.auto.resolved1.desc", title: "Your report was resolved! 🎉", desc: "The broken footpath on Alpha Street has been repaired by the civic team." },
  { type: "comment",  titleKey: "notif.auto.comment2.title",  descKey: "notif.auto.comment2.desc",  title: "New comment on your report", desc: 'Deepika R. commented: "I called the municipality about this. They said 3-day ETA."' },
  { type: "upvote",   titleKey: "notif.auto.upvote2.title",   descKey: "notif.auto.upvote2.desc",   title: "Your report hit 25 upvotes!", desc: "The community is rallying behind your Sector 18 expressway report." },
];

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

const typeConfig = {
  verified:       { icon: Shield,        color: T.purple,      bg: T.purplePale,  border: T.purpleBorder },
  resolved:       { icon: CheckCircle2,  color: "#22c55e",     bg: "#f0fdf4",     border: "#bbf7d0" },
  comment:        { icon: MessageSquare, color: T.purpleLight,  bg: "#EBD8F8",    border: "#C4A0DC" },
  upvote:         { icon: ThumbsUp,      color: T.pink,        bg: T.pinkPale,    border: T.pinkBorder },
  critical:       { icon: AlertTriangle, color: "#ef4444",     bg: "#fef2f2",     border: "#fecaca" },
  assigned:       { icon: Clock,         color: "#e8a020",     bg: "#fefce8",     border: "#fef08a" },
  friend_request: { icon: UserPlus,      color: "#0ea5e9",     bg: "#f0f9ff",     border: "#bae6fd" },
  login:          { icon: Shield,        color: T.purple,      bg: T.purplePale,  border: T.purpleBorder },
};

// Resolve a notification's display title/desc: prefer the translation key, fall back to raw string.
function resolveText(t: (key: string) => string, key: string | undefined, fallback: string): string {
  if (!key) return fallback;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

// Mini profile card shown when clicking a friend request
function SenderProfileCard({ notif, onClose, onAccept, onDecline }: {
  notif: Notification;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      background: "rgba(61,26,107,0.35)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: "24px", padding: "24px",
        width: "100%", maxWidth: "280px",
        border: `1px solid ${T.purpleBorder}`,
        boxShadow: "0 20px 60px rgba(107,63,160,0.25)",
      }}>
        {/* Avatar */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "22px", margin: "0 auto 12px",
            background: `linear-gradient(135deg, ${T.purple}, ${T.purpleLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", fontWeight: 800, color: "white",
          }}>
            {notif.senderName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <p style={{ fontSize: "16px", fontWeight: 800, color: T.textDark, margin: "0 0 4px" }}>{notif.senderName}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", color: T.textMid, fontSize: "12px" }}>
            <MapPin style={{ width: "12px", height: "12px" }} />
            <span>{notif.senderArea}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          <div style={{ background: T.purplePale, borderRadius: "14px", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "20px", fontWeight: 900, color: T.purple, margin: 0 }}>{notif.senderReports}</p>
            <p style={{ fontSize: "10px", fontWeight: 700, color: T.textLight, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("notif.reports")}</p>
          </div>
          <div style={{ background: T.pinkPale, borderRadius: "14px", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "20px", fontWeight: 900, color: T.pink, margin: 0 }}>{notif.senderTrust}%</p>
            <p style={{ fontSize: "10px", fontWeight: 700, color: T.textLight, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("notif.trust")}</p>
          </div>
        </div>

        {/* Rank badge */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <span style={{
            padding: "5px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
            background: T.purplePale, color: T.purple, border: `1px solid ${T.purpleBorder}`,
          }}>
            <Star style={{ width: "10px", height: "10px", display: "inline", marginRight: "4px", verticalAlign: "-1px" }} />
            {(notif.senderTrust ?? 0) >= 85 ? t("notif.trustedFiler") : (notif.senderTrust ?? 0) >= 70 ? t("notif.verifiedCitizen") : t("notif.reporter")}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onDecline} style={{
            flex: 1, padding: "10px", borderRadius: "12px", border: `1px solid ${T.purpleBorder}`,
            background: "white", color: T.textMid, fontSize: "12px", fontWeight: 700, cursor: "pointer",
          }}>{t("notif.decline")}</button>
          <button onClick={onAccept} style={{
            flex: 1, padding: "10px", borderRadius: "12px", border: "none",
            background: `linear-gradient(135deg, ${T.purple}, #4A1A7A)`,
            color: "white", fontSize: "12px", fontWeight: 700, cursor: "pointer",
          }}>{t("notif.accept")}</button>
        </div>
      </div>
    </div>
  );
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  externalNotifications?: Notification[];
  onNotificationsChange?: (notifs: Notification[]) => void;
}

export default function NotificationPanel({ isOpen, onClose, externalNotifications, onNotificationsChange }: NotificationPanelProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [viewingSender, setViewingSender] = useState<Notification | null>(null);

  // Sync with external notifications pushed from App
  useEffect(() => {
    if (externalNotifications && externalNotifications.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newOnes = externalNotifications.filter(n => !existingIds.has(n.id));
        return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
      });
    }
  }, [externalNotifications]);

  const updateAndPropagate = useCallback((updater: (prev: Notification[]) => Notification[]) => {
    setNotifications(prev => {
      const next = updater(prev);
      onNotificationsChange?.(next);
      return next;
    });
  }, [onNotificationsChange]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => updateAndPropagate(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => updateAndPropagate(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => updateAndPropagate(prev => prev.filter(n => n.id !== id));

  const handleNotifClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.type === "friend_request") setViewingSender(notif);
  };

  const handleAccept = () => {
    if (viewingSender) deleteNotif(viewingSender.id);
    setViewingSender(null);
  };
  const handleDecline = () => {
    if (viewingSender) deleteNotif(viewingSender.id);
    setViewingSender(null);
  };

  return (
    <>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0,zIndex: 1102, background: "rgba(61,26,107,0.2)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      )}

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 1103,
        width: "320px", display: "flex", flexDirection: "column",
        background: T.bg,
        borderLeft: `1px solid ${T.purpleBorder}`,
        boxShadow: isOpen ? "-12px 0 48px rgba(107,63,160,0.15)" : "none",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 16px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${T.purpleBorder}`,
          background: `linear-gradient(135deg, ${T.purple} 0%, #4A1A7A 100%)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell style={{ width: "18px", height: "18px", color: "white" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 800, color: "white", margin: 0 }}>{t("notif.title")}</h2>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", margin: 0, fontWeight: 600 }}>{unreadCount} {t("notif.unread")}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px", padding: "4px 10px", cursor: "pointer" }}>
                {t("notif.markAllRead")}
              </button>
            )}
            <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        </div>

        {/* List — positioned relative so profile overlay can anchor to it */}
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {/* Friend profile overlay */}
          {viewingSender && (
            <SenderProfileCard
              notif={viewingSender}
              onClose={() => setViewingSender(null)}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          )}

          {notifications.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px", textAlign: "center" }}>
              <span style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</span>
              <p style={{ fontSize: "14px", fontWeight: 800, color: T.textMid, margin: "0 0 4px" }}>{t("notif.allCaughtUp")}</p>
              <p style={{ fontSize: "12px", color: T.textLight, margin: 0 }}>{t("notif.noNew")}</p>
            </div>
          ) : (
            <div style={{ padding: "12px 10px" }}>
              {notifications.map((notif) => {
                const cfg = typeConfig[notif.type];
                const Icon = cfg.icon;
                const isFriendReq = notif.type === "friend_request";
                const displayTitle = resolveText(t, notif.titleKey, notif.title);
                const displayDesc = resolveText(t, notif.descKey, notif.desc);
                return (
                  <div key={notif.id} onClick={() => handleNotifClick(notif)}
                    style={{
                      borderRadius: "18px", padding: "12px 14px", marginBottom: "6px", cursor: "pointer",
                      background: notif.read ? "white" : T.purplePale,
                      border: notif.read ? `1px solid #EEE8F8` : `1px solid ${T.purpleBorder}`,
                      transition: "all 0.2s", position: "relative",
                      boxShadow: notif.read ? "0 1px 4px rgba(107,63,160,0.04)" : "0 3px 12px rgba(107,63,160,0.1)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateX(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateX(0)"; }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "12px", flexShrink: 0, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ width: "16px", height: "16px", color: cfg.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                          <p style={{ fontSize: "12px", fontWeight: 800, color: notif.read ? T.textMid : T.textDark, margin: 0, lineHeight: 1.3 }}>{displayTitle}</p>
                          {!notif.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: T.purple, flexShrink: 0, marginTop: "2px" }} />}
                        </div>
                        <p style={{ fontSize: "10px", color: T.textLight, margin: "4px 0 0", lineHeight: 1.5, fontWeight: 500 }}>{displayDesc}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                          <p style={{ fontSize: "9px", color: T.textLight, margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{notif.time}</p>
                          {isFriendReq && (
                            <span style={{ fontSize: "9px", fontWeight: 700, color: "#0ea5e9", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px", padding: "1px 6px" }}>
                              {t("notif.tapToView")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                      style={{ position: "absolute", top: "8px", right: "8px", width: "20px", height: "20px", borderRadius: "6px", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textLight, opacity: 0, transition: "opacity 0.2s" }}
                      className="notif-delete">
                      <X style={{ width: "12px", height: "12px" }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${T.purpleBorder}` }}>
          <button onClick={() => updateAndPropagate(() => [])}
            style={{ width: "100%", padding: "10px", borderRadius: "14px", fontSize: "12px", fontWeight: 700, color: T.textLight, background: "white", border: `1px solid ${T.purpleBorder}`, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#fecaca"; el.style.background = "#fef2f2"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.textLight; el.style.borderColor = T.purpleBorder; el.style.background = "white"; }}>
            {t("notif.clearAll")}
          </button>
        </div>
      </div>

      <style>{`div:hover .notif-delete { opacity: 1 !important; }`}</style>
    </>
  );
}
