import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CivicIssue } from "./types";
import MapContainer from "./components/MapContainer";
import ReportForm from "./components/ReportForm";
import IssueList from "./components/IssueList";
import IssueDetails from "./components/IssueDetails";
import DashboardMetrics from "./components/DashboardMetrics";
import TrustSafetySection from "./components/TrustSafetySection";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Leaderboard from "./components/Leaderboard";
import DashboardView from "./components/DashboardView";
import HomeScreen from "./components/HomeScreen";
import NotificationPanel, { RANDOM_NOTIF_POOL } from "./components/NotificationPanel";
import type { Notification } from "./components/NotificationPanel";
import OnboardingFlow from "./components/OnboardingFlow";
import ProfileScreen from "./components/ProfileScreen";
import CalendarPicker, { formatDateKey } from "./components/CalendarPicker";
import TranslateButton from "./components/TranslateButton";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { Plus, List, Map as MapIcon, RotateCw, AlertCircle, Home, User, Bell, Menu, X, ChevronLeft, CalendarDays } from "lucide-react";

const getOrCreateSessionId = (): string => {
  try {
    let sid = localStorage.getItem("roadsync_session_id");
    if (!sid) { sid = "user-" + Math.random().toString(36).substring(2, 15); localStorage.setItem("roadsync_session_id", sid); }
    return sid;
  } catch { return "user-fallback-session"; }
};

const BRAND = {
  purple: "#4B3869",
  purpleDark: "#352650",
  coral: "#F4928C",
  coralDeep: "#EF7B73",
  mint: "#7AD9CE",
  lavender: "#C9B8E3",
  cream: "#FDF3EE",
  cardBorder: "#F5DCE0",
};

const card: React.CSSProperties = { background: "white", border: `1px solid ${BRAND.cardBorder}`, boxShadow: "0 2px 14px rgba(75,56,105,0.06)", borderRadius: "20px" };
const inputStyle: React.CSSProperties = { background: BRAND.cream, border: `1px solid ${BRAND.cardBorder}`, color: "#3A2C52", outline: "none", borderRadius: "14px", padding: "8px 12px", fontSize: "12px", width: "100%" };
const selectStyle: React.CSSProperties = { background: BRAND.cream, border: `1px solid ${BRAND.cardBorder}`, color: "#8C7AA3", outline: "none", borderRadius: "14px", padding: "8px 10px", fontSize: "12px", width: "100%", cursor: "pointer" };
const orangeBtn: React.CSSProperties = { background: BRAND.coralDeep, color: "white", border: "none", borderRadius: "14px", cursor: "pointer", fontWeight: 700, fontSize: "12px", boxShadow: `0 4px 14px ${BRAND.coral}55` };

type TabType = "home" | "report" | "map" | "my-reports" | "calendar" | "dashboard" | "leaderboard" | "admin" | "profile";
const TAB_ORDER: TabType[] = ["home", "map", "report", "my-reports", "calendar", "profile"];

let notifCounter = 100;
function makeAutoNotif(): Notification {
  const pool = RANDOM_NOTIF_POOL;
  const template = pool[Math.floor(Math.random() * pool.length)];
  notifCounter++;
  return { ...template, id: `auto-${notifCounter}-${Date.now()}`, time: "just now", read: false };
}

function makeLoginNotif(name: string): Notification {
  return {
    id: `login-${Date.now()}`,
    type: "login",
    title: `Welcome back, ${name.split(" ")[0]}! 👋`,
    desc: "You have 3 unread notifications and 1 pending friend request since your last visit.",
    time: "just now",
    read: false,
  };
}

// ── Inner app that can use useLanguage ──
function AppInner() {
  const { t } = useLanguage();

  const TAB_LABELS: Record<string, string> = {
    home: t("nav.home"),
    map: t("nav.map"),
    report: t("nav.report"),
    "my-reports": t("nav.myReports"),
    calendar: t("nav.calendar"),
    profile: t("nav.profile"),
    dashboard: t("nav.dashboard"),
    leaderboard: t("nav.leaderboard"),
    admin: t("nav.admin"),
  };

  const NAV_ITEMS: { tab: TabType; icon: React.ComponentType<any>; label: string }[] = [
    { tab: "home",       icon: Home,         label: t("nav.home") },
    { tab: "map",        icon: MapIcon,      label: t("nav.map") },
    { tab: "report",     icon: Plus,         label: t("nav.report") },
    { tab: "my-reports", icon: List,         label: t("nav.myReports") },
    { tab: "calendar",   icon: CalendarDays, label: t("nav.calendar") },
    { tab: "profile",    icon: User,         label: t("nav.profile") },
  ];

  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [userSessionId] = useState<string>(getOrCreateSessionId());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportingLocation, setReportingLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isSelectingLocationMode, setIsSelectingLocationMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [prevTab, setPrevTab] = useState<TabType>("home");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [adminSelectedIssueId, setAdminSelectedIssueId] = useState<string | null>(null);
  const [adminStatus, setAdminStatus] = useState("");
  const [adminDept, setAdminDept] = useState("");
  const [adminResolutionNote, setAdminResolutionNote] = useState("");
  const [isAdminSaving, setIsAdminSaving] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userData, setUserData] = useState<{ name: string; phone: string; area: string; avatar: string } | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  const issuesByDateKey = useMemo(() => {
    const map: Record<string, number> = {};
    issues.forEach((i: any) => {
      const raw = i.createdAt || i.timestamp || i.date;
      if (!raw) return;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return;
      const key = formatDateKey(d);
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [issues]);

  const issuesOnSelectedDate = useMemo(() => {
    const targetKey = formatDateKey(selectedCalendarDate);
    return issues.filter((i: any) => {
      const raw = i.createdAt || i.timestamp || i.date;
      if (!raw) return false;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return false;
      return formatDateKey(d) === targetKey;
    });
  }, [issues, selectedCalendarDate]);

  const [pendingNotifs, setPendingNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(3);

  const screenRef = useRef<HTMLDivElement>(null);
  const autoNotifRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNextAutoNotif = useCallback(() => {
    const delay = 30_000 + Math.random() * 60_000;
    autoNotifRef.current = setTimeout(() => {
      const notif = makeAutoNotif();
      setPendingNotifs(prev => [notif, ...prev]);
      setUnreadCount(c => c + 1);
      if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification("RoadSync – " + notif.title, { body: notif.desc, icon: "/favicon.ico" }); } catch {}
      }
      scheduleNextAutoNotif();
    }, delay);
  }, []);

  const handleOnboardingComplete = (data: { name: string; phone: string; area: string; avatar: string }) => {
    setUserData(data);
    setIsOnboarded(true);
    const loginNotif = makeLoginNotif(data.name);
    setPendingNotifs([loginNotif]);
    setUnreadCount(prev => prev + 1);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Welcome to RoadSync! 🛣️", { body: `Hey ${data.name.split(" ")[0]}, you're all set.`, icon: "/favicon.ico" });
        }
      });
    }
    scheduleNextAutoNotif();
  };

  const handleLogout = () => {
    if (autoNotifRef.current) { clearTimeout(autoNotifRef.current); autoNotifRef.current = null; }
    try { localStorage.removeItem("roadsync_session_id"); } catch {}
    setUserData(null); setIssues([]); setSelectedIssueId(null); setReportingLocation(null);
    setIsSelectingLocationMode(false); setPendingNotifs([]); setUnreadCount(0);
    setDrawerOpen(false); setActiveTab("home"); setPrevTab("home");
    setIsOnboarded(false);
    window.location.reload();
  };

  useEffect(() => { return () => { if (autoNotifRef.current) clearTimeout(autoNotifRef.current); }; }, []);

  const navigateTo = (newTab: TabType) => {
    if (newTab === activeTab || isAnimating) return;
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    const direction = newIndex > currentIndex ? "left" : "right";
    setSlideDirection(direction); setIsAnimating(true); setPrevTab(activeTab); setActiveTab(newTab);
    setTimeout(() => setIsAnimating(false), 350);
    setDrawerOpen(false);
  };

  const fetchIssues = async () => {
    setIsLoading(true); setErrorStatus(null);
    try {
      const res = await fetch("/api/issues");
      const data = await res.json();
      if (data.success && data.issues) {
        setIssues(data.issues);
        if (data.issues.length > 0 && !selectedIssueId) setSelectedIssueId(data.issues[0].id);
      } else setErrorStatus("The civic service responded with an error.");
    } catch { setErrorStatus("Failed to contact the civic issue database."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchIssues(); }, []);
  useEffect(() => {
    if (adminSelectedIssueId) {
      const s = issues.find((i) => i.id === adminSelectedIssueId);
      if (s) { setAdminStatus(s.status); setAdminDept(s.suggestedDepartment || "Department of Public Works"); setAdminResolutionNote(s.resolutionNote || ""); }
    }
  }, [adminSelectedIssueId, issues]);

  const handleUpvote = async (id: string) => {
    try {
      const res = await fetch(`/api/issues/${id}/upvote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: userSessionId }) });
      const data = await res.json();
      if (data.success) setIssues((prev) => prev.map((i) => i.id === id ? { ...i, upvotes: data.upvotes, upvotedByUserIds: data.upvotedByUserIds } : i));
    } catch {}
  };
  const handleStatusChange = async (id: string, newStatus: "reported"|"verified"|"assigned"|"in_progress"|"resolved") => {
    try {
      const res = await fetch(`/api/issues/${id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      const data = await res.json();
      if (data.success) setIssues((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus, comments: data.comments } : i));
    } catch {}
  };
  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/issues/${id}/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: userSessionId }) });
      const data = await res.json();
      if (data.success) setIssues((prev) => prev.map((i) => i.id === id ? { ...i, verifiedByUserIds: data.verifiedByUserIds, status: data.status || i.status, comments: data.comments || i.comments } : i));
    } catch {}
  };
  const handleFlagDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/issues/${id}/flag-duplicate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: userSessionId }) });
      const data = await res.json();
      if (data.success) setIssues((prev) => prev.map((i) => i.id === id ? { ...i, duplicateFlagUserIds: data.duplicateFlagUserIds } : i));
    } catch {}
  };
  const handleAddComment = async (id: string, author: string, text: string) => {
    try {
      const res = await fetch(`/api/issues/${id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ author, text }) });
      const data = await res.json();
      if (data.success) setIssues((prev) => prev.map((i) => i.id === id ? { ...i, comments: data.comments } : i));
    } catch {}
  };
  const handleReportSubmitted = (newIssue: CivicIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    navigateTo("home");
    setReportingLocation(null);
    setIsSelectingLocationMode(false);
  };
  const handleAdminOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSelectedIssueId) return;
    setIsAdminSaving(true); setAdminSuccessMsg(null);
    try {
      const res = await fetch(`/api/issues/${adminSelectedIssueId}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: adminStatus, suggestedDepartment: adminDept, resolutionNote: adminResolutionNote.trim() || undefined }) });
      const data = await res.json();
      if (data.success) {
        setIssues((prev) => prev.map((i) => i.id === adminSelectedIssueId ? { ...i, status: data.status, suggestedDepartment: data.suggestedDepartment, resolutionNote: data.resolutionNote, comments: data.comments } : i));
        setAdminSuccessMsg(t("admin.success"));
        setTimeout(() => setAdminSuccessMsg(null), 3000);
      }
    } catch {}
    finally { setIsAdminSaving(false); }
  };

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || null;
  const myIssues = issues.filter((i) => i.creatorSessionId === userSessionId);
  const userReportsCount = 14 + myIssues.length;
  const userResolvedCount = 9 + myIssues.filter((i) => i.status === "resolved").length;
  const userTrustScore = Math.min(100, 92 + myIssues.length * 2);

  const EmptyState = ({ emoji, title, desc }: { emoji: string; title: string; desc: string }) => (
    <div className="p-6 py-16 text-center flex flex-col items-center justify-center min-h-[280px]" style={card}>
      <span className="text-3xl mb-3">{emoji}</span>
      <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#B6A8C9" }}>{title}</p>
      <p className="text-[11px] max-w-[240px] leading-relaxed" style={{ color: "#D2C2DE" }}>{desc}</p>
    </div>
  );

  const getSlideStyle = (entering: boolean): React.CSSProperties => ({
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    animation: isAnimating
      ? entering
        ? `slideIn${slideDirection === "left" ? "Right" : "Left"} 0.32s cubic-bezier(0.4,0,0.2,1) forwards`
        : `slideOut${slideDirection === "left" ? "Right" : "Left"} 0.32s cubic-bezier(0.4,0,0.2,1) forwards`
      : undefined,
    overflowY: "auto", overflowX: "hidden",
  });

  const renderScreen = (tab: TabType) => {
    switch (tab) {
      case "home": return (
        <HomeScreen
          issues={issues} selectedIssueId={selectedIssueId} setSelectedIssueId={setSelectedIssueId}
          userReportsCount={userReportsCount} userResolvedCount={userResolvedCount} userTrustScore={userTrustScore}
          myIssues={myIssues} isLoading={isLoading} errorStatus={errorStatus} fetchIssues={fetchIssues}
          selectedIssue={selectedIssue} handleUpvote={handleUpvote} handleStatusChange={handleStatusChange}
          handleVerify={handleVerify} handleFlagDuplicate={handleFlagDuplicate} handleAddComment={handleAddComment}
          userSessionId={userSessionId} theme={theme} card={card} EmptyState={EmptyState}
          userName={userData?.name || "Madhav Sharma"} userAvatar={userData?.avatar || "👨‍💼"} userArea={userData?.area || "Greater Noida"}
        />
      );
      case "map": return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8" style={{ height: "500px" }}>
              <MapContainer issues={issues} selectedIssueId={selectedIssueId} onSelectIssue={(issue) => setSelectedIssueId(issue.id)} reportingLocation={reportingLocation} onSelectReportingLocation={(loc) => setReportingLocation(loc)} isSelectingLocationMode={isSelectingLocationMode} />
            </div>
            <div className="lg:col-span-4">
              {selectedIssue
                ? <div className="rounded-2xl overflow-hidden" style={card}><IssueDetails issue={selectedIssue} onUpvote={handleUpvote} onStatusChange={handleStatusChange} onVerify={handleVerify} onFlagDuplicate={handleFlagDuplicate} onAddComment={handleAddComment} userSessionId={userSessionId} theme={theme} /></div>
                : <EmptyState emoji="📍" title={t("map.selectPin")} desc={t("map.pinDesc")} />}
            </div>
          </div>
        </div>
      );
      case "report": return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6">
              <ReportForm
                onReportSubmitted={handleReportSubmitted} reportingLocation={reportingLocation}
                isSelectingLocation={isSelectingLocationMode}
                onStartSelectingLocation={() => setIsSelectingLocationMode(true)}
                onCancelSelectingLocation={() => { setIsSelectingLocationMode(false); setReportingLocation(null); }}
                onLocationSelected={(loc) => setReportingLocation(loc)}
                userSessionId={userSessionId} theme={theme}
              />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${BRAND.cream}, #FBE4EC)`, border: `1px solid ${BRAND.cardBorder}` }}>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg uppercase tracking-wider" style={{ background: `${BRAND.lavender}33`, color: BRAND.purple, border: `1px solid ${BRAND.lavender}55` }}>{t("report.aiAssessment")}</span>
                <h3 className="text-sm font-bold mt-2.5" style={{ color: "#3A2C52" }}>{t("report.aiTitle")}</h3>
                <p className="text-[11px] leading-relaxed mt-1" style={{ color: "#8C7AA3" }}>{t("report.aiDesc")}</p>
              </div>
              <TrustSafetySection theme={theme} />
            </div>
          </div>
        </div>
      );
      case "my-reports": return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5">
              <div className="p-4 min-h-[380px] flex flex-col" style={card}>
                <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: `1px solid ${BRAND.cardBorder}` }}>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3A2C52" }}>{t("myreports.submissions")}</h2>
                    <p className="text-[10px] mt-0.5" style={{ color: "#D2C2DE" }}>{t("myreports.hazardLogs")}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: BRAND.coralDeep, border: `1px solid ${BRAND.coral}55`, background: `${BRAND.coral}14` }}>{myIssues.length} {t("myreports.active")}</span>
                </div>
                {myIssues.length === 0
                  ? <div className="flex-1 flex flex-col items-center justify-center text-center"><span className="text-3xl mb-3">📋</span><p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#D2C2DE" }}>{t("myreports.noReports")}</p></div>
                  : <IssueList issues={myIssues} selectedIssueId={selectedIssueId} onSelectIssue={(issue) => setSelectedIssueId(issue.id)} onUpvoteIssue={handleUpvote} userSessionId={userSessionId} theme={theme} />}
              </div>
            </div>
            <div className="lg:col-span-7">
              {selectedIssue && selectedIssue.creatorSessionId === userSessionId
                ? <IssueDetails issue={selectedIssue} onUpvote={handleUpvote} onStatusChange={handleStatusChange} onVerify={handleVerify} onFlagDuplicate={handleFlagDuplicate} onAddComment={handleAddComment} userSessionId={userSessionId} theme={theme} />
                : <EmptyState emoji="🔍" title={t("myreports.emptyTitle")} desc={t("myreports.emptyDesc")} />}
            </div>
          </div>
        </div>
      );
      case "profile": return (
        <ProfileScreen
          userReportsCount={userReportsCount} userResolvedCount={userResolvedCount} userTrustScore={userTrustScore}
          theme={theme} setTheme={setTheme} onResetDatabase={fetchIssues} onLogout={handleLogout}
          myIssues={myIssues} userName={userData?.name || "Madhav Sharma"} userArea={userData?.area || "Greater Noida"}
        />
      );
      case "calendar": return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 space-y-4">
              <CalendarPicker selectedDate={selectedCalendarDate} onSelectDate={setSelectedCalendarDate} markedDates={issuesByDateKey} theme={theme} />
              <div className="p-4 min-h-[180px] flex flex-col" style={card}>
                <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: `1px solid ${BRAND.cardBorder}` }}>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3A2C52" }}>
                      {selectedCalendarDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                    </h2>
                    <p className="text-[10px] mt-0.5" style={{ color: "#D2C2DE" }}>{t("cal.reportsThisDay")}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: BRAND.coralDeep, border: `1px solid ${BRAND.coral}55`, background: `${BRAND.coral}14` }}>
                    {issuesOnSelectedDate.length}
                  </span>
                </div>
                {issuesOnSelectedDate.length === 0
                  ? <div className="flex-1 flex flex-col items-center justify-center text-center py-6"><span className="text-3xl mb-3">🗓️</span><p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#D2C2DE" }}>{t("cal.noReports")}</p></div>
                  : <IssueList issues={issuesOnSelectedDate} selectedIssueId={selectedIssueId} onSelectIssue={(issue) => setSelectedIssueId(issue.id)} onUpvoteIssue={handleUpvote} userSessionId={userSessionId} theme={theme} />}
              </div>
            </div>
            <div className="lg:col-span-7">
              {selectedIssue && issuesOnSelectedDate.some((i) => i.id === selectedIssue.id)
                ? <IssueDetails issue={selectedIssue} onUpvote={handleUpvote} onStatusChange={handleStatusChange} onVerify={handleVerify} onFlagDuplicate={handleFlagDuplicate} onAddComment={handleAddComment} userSessionId={userSessionId} theme={theme} />
                : <EmptyState emoji="📅" title={t("cal.emptyTitle")} desc={t("cal.emptyDesc")} />}
            </div>
          </div>
        </div>
      );
      case "dashboard": return (
        <div className="p-4 md:p-6 lg:p-8">
          <DashboardView issues={issues} userSessionId={userSessionId} theme={theme} />
        </div>
      );
      case "leaderboard": return (
        <div className="p-4 md:p-6 lg:p-8">
          <Leaderboard theme={theme} />
        </div>
      );
      case "admin": return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
          <div style={card} className="p-5">
            <h2 className="text-sm font-bold mb-4" style={{ color: "#3A2C52" }}>{t("admin.title")}</h2>
            <select value={adminSelectedIssueId || ""} onChange={e => setAdminSelectedIssueId(e.target.value)} style={selectStyle}>
              <option value="">{t("admin.selectIssue")}</option>
              {issues.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
            {adminSelectedIssueId && (
              <div className="mt-4 space-y-3">
                <select value={adminStatus} onChange={e => setAdminStatus(e.target.value)} style={selectStyle}>
                  <option value="reported">{t("status.reported")}</option>
                  <option value="verified">{t("status.verified")}</option>
                  <option value="assigned">{t("status.assigned")}</option>
                  <option value="in_progress">{t("status.inProgress")}</option>
                  <option value="resolved">{t("status.resolved")}</option>
                </select>
                <input value={adminDept} onChange={e => setAdminDept(e.target.value)} placeholder={t("admin.department")} style={inputStyle} />
                <textarea value={adminResolutionNote} onChange={e => setAdminResolutionNote(e.target.value)} placeholder={t("admin.resolutionNote")} rows={3} style={{ ...inputStyle, resize: "none" }} />
                <button onClick={handleAdminOverrideSubmit} disabled={isAdminSaving} style={{ ...orangeBtn, padding: "10px 20px" }}>
                  {isAdminSaving ? t("admin.saving") : t("admin.updateStatus")}
                </button>
                {adminSuccessMsg && <p className="text-xs font-bold" style={{ color: "#2E7D5E" }}>{adminSuccessMsg}</p>}
              </div>
            )}
          </div>
        </div>
      );
      default: return null;
    }
  };

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const userName = userData?.name || "Madhav Sharma";
  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: BRAND.cream, flexDirection: "column" }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInLeft  { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutLeft { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
        @keyframes slideOutRight{ from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      `}</style>

      {/* ── TOP HEADER BAR ── */}
      <div style={{
        height: "56px", flexShrink: 0,
        background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.purpleDark} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", zIndex: 1102,
        boxShadow: "0 2px 12px rgba(53,38,80,0.25)",
        gap: "10px",
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", flexShrink: 0 }}>
          <Menu style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Title + current tab */}
        <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "white", margin: 0, letterSpacing: "0.3px" }}>{t("app.name")}</p>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: 600 }}>{TAB_LABELS[activeTab] ?? t("nav.home")}</p>
        </div>

        {/* Right side: Translate button + Bell */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <TranslateButton />

          <button
            onClick={() => { setNotifOpen(true); setUnreadCount(0); }}
            aria-label="Notifications"
            style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", position: "relative" }}>
            <Bell style={{ width: "18px", height: "18px" }} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "6px", right: "6px",
                minWidth: "16px", height: "16px", borderRadius: "8px",
                background: "#ef4444", color: "white",
                fontSize: "9px", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${BRAND.purpleDark}`, padding: "0 3px",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Desktop sidebar (lg+) */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => navigateTo(tab as TabType)}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            userReportsCount={userReportsCount}
            userResolvedCount={userResolvedCount}
            userTrustScore={userTrustScore}
            theme={theme}
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }} ref={screenRef}>
            {isAnimating ? (
              <>
                <div style={getSlideStyle(false)}>{renderScreen(prevTab)}</div>
                <div style={getSlideStyle(true)}>{renderScreen(activeTab)}</div>
              </>
            ) : (
              <div style={{ position: "relative", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
                {renderScreen(activeTab)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(53,38,80,0.45)", backdropFilter: "blur(2px)" }} />
      )}

      {/* ── DRAWER PANEL ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: "260px", zIndex: 1101,
        background: "white", boxShadow: "4px 0 24px rgba(53,38,80,0.2)",
        display: "flex", flexDirection: "column",
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Drawer header */}
        <div style={{ background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.purpleDark} 100%)`, padding: "52px 18px 20px", position: "relative" }}>
          <button onClick={() => setDrawerOpen(false)} style={{ position: "absolute", top: "12px", right: "12px", width: "30px", height: "30px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
            <X style={{ width: "14px", height: "14px" }} />
          </button>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, color: "white", marginBottom: "12px" }}>
            {userInitials}
          </div>
          <p style={{ fontSize: "15px", fontWeight: 800, color: "white", margin: "0 0 3px" }}>{userName}</p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", margin: 0, fontWeight: 500 }}>{userData?.area || "Greater Noida"} · {t("drawer.citizen")}</p>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
          {NAV_ITEMS.map(({ tab, icon: Icon, label }) => {
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => navigateTo(tab)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "13px 20px", background: isActive ? "#F0E6FA" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  color: isActive ? BRAND.purple : "#6B5E80",
                  fontSize: "13px", fontWeight: isActive ? 700 : 500,
                  borderLeft: isActive ? `3px solid ${BRAND.purple}` : "3px solid transparent",
                  transition: "all 0.15s",
                }}>
                <Icon style={{ width: "18px", height: "18px", flexShrink: 0 }} />
                {label}
              </button>
            );
          })}

          <div style={{ height: "1px", background: "#F0EBF8", margin: "8px 0" }} />

          <div style={{ padding: "12px 16px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#C4A0D8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>{t("drawer.myActivity")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              {[
                { label: t("drawer.reports"),  value: userReportsCount },
                { label: t("drawer.resolved"), value: userResolvedCount },
                { label: t("drawer.trust"),    value: `${userTrustScore}%` },
              ].map(s => (
                <div key={s.label} style={{ background: "#F9F4FF", borderRadius: "10px", padding: "10px 6px", textAlign: "center" }}>
                  <p style={{ fontSize: "16px", fontWeight: 800, color: BRAND.purple, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: "9px", color: "#C4A0D8", fontWeight: 600, margin: "2px 0 0", textTransform: "uppercase" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer footer */}
        <div style={{ padding: "12px 16px 24px", borderTop: "1px solid #F0EBF8" }}>
          <button onClick={() => { navigateTo("profile"); }}
            style={{ width: "100%", padding: "11px", borderRadius: "12px", background: "#F0E6FA", border: `1px solid ${BRAND.lavender}`, color: BRAND.purple, fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <User style={{ width: "14px", height: "14px" }} />
            {t("drawer.viewProfile")}
          </button>
        </div>
      </div>

      {/* ── NOTIFICATION PANEL ── */}
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        externalNotifications={pendingNotifs}
        onNotificationsChange={(notifs) => {
          const unread = notifs.filter(n => !n.read).length;
          setUnreadCount(unread);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}