import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // ── Header ──
  "app.name":                   { en: "RoadSync",              hi: "रोडसिंक" },
  "app.subtitle":               { en: "Greater Noida · Gov",   hi: "ग्रेटर नोएडा · सरकार" },

  // ── Nav / Tabs ──
  "nav.home":                   { en: "Live Feed",              hi: "लाइव फीड" },
  "nav.map":                    { en: "Hazard Map",             hi: "खतरा नक्शा" },
  "nav.report":                 { en: "Report Issue",           hi: "समस्या रिपोर्ट करें" },
  "nav.myReports":              { en: "My Reports",             hi: "मेरी रिपोर्ट" },
  "nav.calendar":               { en: "Calendar",               hi: "कैलेंडर" },
  "nav.profile":                { en: "My Profile",             hi: "मेरी प्रोफ़ाइल" },
  "nav.dashboard":              { en: "Dashboard",              hi: "डैशबोर्ड" },
  "nav.leaderboard":            { en: "Leaderboard",            hi: "लीडरबोर्ड" },
  "nav.admin":                  { en: "Admin Panel",            hi: "व्यवस्थापक पैनल" },
  "nav.liveMap":                { en: "Live Map",               hi: "लाइव नक्शा" },

  // ── Drawer ──
  "drawer.citizen":             { en: "Citizen",                hi: "नागरिक" },
  "drawer.myActivity":          { en: "My Activity",            hi: "मेरी गतिविधि" },
  "drawer.reports":             { en: "Reports",                hi: "रिपोर्ट" },
  "drawer.resolved":            { en: "Resolved",               hi: "हल किया" },
  "drawer.trust":               { en: "Trust",                  hi: "विश्वास" },
  "drawer.viewProfile":         { en: "View Profile",           hi: "प्रोफ़ाइल देखें" },

  // ── Language toggle ──
  "lang.toggle":                { en: "हिन्दी",                  hi: "English" },

  // ── Home Screen ──
  "home.greeting":              { en: "Good morning",           hi: "सुप्रभात" },
  "home.registry":              { en: "RoadSync Central Registry", hi: "रोडसिंक केंद्रीय रजिस्ट्री" },
  "home.verified":              { en: "Verified",               hi: "सत्यापित" },
  "home.rank":                  { en: "Rank",                   hi: "रैंक" },
  "home.pro":                   { en: "Pro",                    hi: "प्रो" },
  "home.citizen":               { en: "Citizen",                hi: "नागरिक" },
  "home.feedTab":               { en: "Live Feed",              hi: "लाइव फीड" },
  "home.detailTab":             { en: "Detail",                 hi: "विवरण" },
  "home.metricsTab":            { en: "Metrics",                hi: "मेट्रिक्स" },
  "home.activeHazards":         { en: "Active Road Hazards",    hi: "सक्रिय सड़क खतरे" },
  "home.tapToDetail":           { en: "Tap an issue → slides to detail", hi: "समस्या पर टैप करें → विवरण देखें" },
  "home.logged":                { en: "logged",                 hi: "दर्ज" },
  "home.loading":               { en: "Loading issues…",        hi: "समस्याएं लोड हो रही हैं…" },
  "home.retry":                 { en: "Retry",                  hi: "पुनः प्रयास करें" },
  "home.noIssue":               { en: "No Issue Selected",      hi: "कोई समस्या नहीं चुनी" },
  "home.swipeHint":             { en: "Swipe left to Feed and tap any issue to view details", hi: "फीड पर स्वाइप करें और विवरण देखने के लिए किसी समस्या पर टैप करें" },
  "home.goFeed":                { en: "← Go to Feed",           hi: "← फीड पर जाएं" },

  // ── Stats labels ──
  "stats.reports":              { en: "Reports",                hi: "रिपोर्ट" },
  "stats.resolved":             { en: "Resolved",               hi: "हल किया" },
  "stats.totalIssues":          { en: "Total Issues",           hi: "कुल समस्याएं" },
  "stats.inProgress":           { en: "In Progress",            hi: "प्रगति में" },
  "stats.critical":             { en: "Critical",               hi: "गंभीर" },
  "stats.myReports":            { en: "My Reports",             hi: "मेरी रिपोर्ट" },
  "stats.verified":             { en: "Verified",               hi: "सत्यापित" },

  // ── Dashboard ──
  "dash.cityImpact":            { en: "🏙️ City Impact",          hi: "🏙️ शहर पर प्रभाव" },
  "dash.myContrib":             { en: "👤 My Contributions",     hi: "👤 मेरा योगदान" },
  "dash.totalReports":          { en: "Total Reports",           hi: "कुल रिपोर्ट" },
  "dash.cityWide":              { en: "city-wide",               hi: "पूरे शहर में" },
  "dash.beingActioned":         { en: "being actioned",          hi: "कार्रवाई हो रही है" },
  "dash.needUrgent":            { en: "need urgent fix",         hi: "तत्काल सुधार चाहिए" },
  "dash.resolutionRate":        { en: "City Resolution Rate",    hi: "शहर समाधान दर" },
  "dash.resolvedDesc":          { en: "issues resolved by municipal teams. Avg response:", hi: "समस्याएं नगरपालिका द्वारा हल। औसत प्रतिक्रिया:" },
  "dash.of":                    { en: "of",                      hi: "में से" },
  "dash.reported":              { en: "reported",                hi: "रिपोर्ट किया" },
  "dash.byCategory":            { en: "Issue Breakdown by Category", hi: "श्रेणी अनुसार समस्याएं" },
  "dash.pipeline":              { en: "Resolution Pipeline",     hi: "समाधान पाइपलाइन" },
  "dash.aiInsights":            { en: "AI Predictive Insights",  hi: "AI पूर्वानुमान अंतर्दृष्टि" },
  "dash.aiInsightsDesc":        { en: "Generated from live issue patterns", hi: "लाइव समस्या पैटर्न से उत्पन्न" },
  "dash.citizensActive":        { en: "Citizens Active",         hi: "सक्रिय नागरिक" },
  "dash.verifications":         { en: "Verifications",           hi: "सत्यापन" },
  "dash.areasCovered":          { en: "Areas Covered",           hi: "क्षेत्र कवर" },
  "dash.civicImpact":           { en: "Your Civic Impact",       hi: "आपका नागरिक प्रभाव" },
  "dash.trustScore":            { en: "Trust Score",             hi: "विश्वास स्कोर" },
  "dash.joinedJun":             { en: "📅 Joined Jun 2026",      hi: "📅 जून 2026 में जुड़े" },
  "dash.reportsFiled":          { en: "Reports Filed",           hi: "रिपोर्ट दर्ज" },
  "dash.upvotes":               { en: "Upvotes",                 hi: "समर्थन" },
  "dash.badgesEarned":          { en: "Badges Earned",           hi: "अर्जित बैज" },
  "dash.myRecentReports":       { en: "My Recent Reports",       hi: "मेरी हालिया रिपोर्ट" },
  "dash.noReports":             { en: "No reports yet",          hi: "अभी कोई रिपोर्ट नहीं" },
  "dash.noReportsHint":         { en: "Submit your first issue from Report Issue tab", hi: "रिपोर्ट इश्यू टैब से अपनी पहली समस्या दर्ज करें" },
  "dash.champion":              { en: "Champion",                hi: "चैंपियन" },
  "dash.verifiedCitizen":       { en: "Verified Citizen",        hi: "सत्यापित नागरिक" },
  "dash.reporter":              { en: "Reporter",                hi: "रिपोर्टर" },
  "dash.newcomer":              { en: "Newcomer",                hi: "नवागंतुक" },

  // ── Badges ──
  "badge.asphalt":              { en: "Asphalt Guardian",        hi: "सड़क संरक्षक" },
  "badge.asphaltDesc":          { en: "First pothole verified",  hi: "पहला गड्ढा सत्यापित" },
  "badge.grid":                 { en: "Grid Sentinel",           hi: "ग्रिड प्रहरी" },
  "badge.gridDesc":             { en: "Streetlight outage fixed", hi: "स्ट्रीटलाइट ठीक की" },
  "badge.clean":                { en: "Clean Corridor",          hi: "स्वच्छ गलियारा" },
  "badge.cleanDesc":            { en: "Garbage dump reported",   hi: "कूड़ा डंप रिपोर्ट" },
  "badge.trust":                { en: "Trust Advocate",          hi: "विश्वास अधिवक्ता" },
  "badge.trustDesc":            { en: "90+ trust score",         hi: "90+ विश्वास स्कोर" },

  // ── Status labels ──
  "status.reported":            { en: "Reported",                hi: "रिपोर्ट किया" },
  "status.verified":            { en: "Verified",                hi: "सत्यापित" },
  "status.assigned":            { en: "Assigned",                hi: "असाइन किया" },
  "status.inProgress":          { en: "In Progress",             hi: "प्रगति में" },
  "status.resolved":            { en: "Resolved",                hi: "हल किया" },

  // ── Category labels ──
  "cat.all":                    { en: "All",                     hi: "सभी" },
  "cat.pothole":                { en: "Pothole",                 hi: "गड्ढा" },
  "cat.streetlight":            { en: "Streetlight",             hi: "स्ट्रीटलाइट" },
  "cat.garbage":                { en: "Garbage",                 hi: "कूड़ा" },
  "cat.other":                  { en: "Other",                   hi: "अन्य" },

  // ── Severity labels ──
  "severity.critical":          { en: "Critical",                hi: "गंभीर" },
  "severity.high":              { en: "High",                    hi: "उच्च" },
  "severity.medium":            { en: "Medium",                  hi: "मध्यम" },
  "severity.low":               { en: "Low",                     hi: "कम" },

  // ── Issue list (filters / search) ──
  "issueList.searchPlaceholder": { en: "Search issues, streets…", hi: "समस्याएं, सड़कें खोजें…" },
  "issueList.allStatuses":       { en: "All Statuses",            hi: "सभी स्थितियाँ" },
  "issueList.allSeverities":     { en: "All Severities",          hi: "सभी गंभीरताएं" },
  "issueList.noIssuesFound":     { en: "No issues found",         hi: "कोई समस्या नहीं मिली" },

  // ── My Reports tab ──
  "myreports.submissions":      { en: "My Submissions",          hi: "मेरी प्रस्तुतियाँ" },
  "myreports.hazardLogs":       { en: "Hazard logs from this session", hi: "इस सत्र की खतरे की सूचियाँ" },
  "myreports.active":           { en: "Active",                  hi: "सक्रिय" },
  "myreports.noReports":        { en: "No reports yet",          hi: "अभी कोई रिपोर्ट नहीं" },
  "myreports.emptyTitle":       { en: "Select Your Incident",    hi: "अपनी घटना चुनें" },
  "myreports.emptyDesc":        { en: "Select one of your filed claims to view its resolution progress.", hi: "समाधान प्रगति देखने के लिए अपनी दर्ज शिकायत चुनें।" },

  // ── Map tab ──
  "map.selectPin":              { en: "Select a Map Pin",        hi: "मानचित्र पिन चुनें" },
  "map.pinDesc":                { en: "Click any pin to review comments and AI severity levels.", hi: "टिप्पणियाँ और AI गंभीरता स्तर देखने के लिए किसी पिन पर क्लिक करें।" },

  // ── Report tab ──
  "report.aiAssessment":        { en: "AI Assessment",           hi: "AI मूल्यांकन" },
  "report.aiTitle":             { en: "Instant Visual Diagnostics via Gemini AI", hi: "Gemini AI द्वारा तत्काल दृश्य निदान" },
  "report.aiDesc":              { en: "Uploaded hazard photos are analyzed instantly. Gemini generates severity scores and recommends the right municipal response team.", hi: "अपलोड की गई खतरे की फ़ोटो तुरंत विश्लेषण की जाती हैं। Gemini गंभीरता स्कोर बनाता है और सही नगरपालिका टीम की सिफारिश करता है।" },

  // ── Calendar tab ──
  "cal.reportsThisDay":         { en: "Reports filed this day",  hi: "इस दिन दर्ज रिपोर्ट" },
  "cal.noReports":              { en: "No reports this day",     hi: "इस दिन कोई रिपोर्ट नहीं" },
  "cal.emptyTitle":             { en: "Pick a Report",           hi: "रिपोर्ट चुनें" },
  "cal.emptyDesc":              { en: "Select a day on the calendar, then choose one of its reports to view full details.", hi: "कैलेंडर पर एक दिन चुनें, फिर पूरी जानकारी देखने के लिए उसकी रिपोर्ट चुनें।" },

  // ── Admin panel ──
  "admin.title":                { en: "Admin Panel — Issue Override", hi: "व्यवस्थापक पैनल — समस्या ओवरराइड" },
  "admin.selectIssue":          { en: "Select an issue...",      hi: "समस्या चुनें..." },
  "admin.department":           { en: "Department",              hi: "विभाग" },
  "admin.resolutionNote":       { en: "Resolution note...",      hi: "समाधान नोट..." },
  "admin.updateStatus":         { en: "Update Status",           hi: "स्थिति अपडेट करें" },
  "admin.saving":               { en: "Saving...",               hi: "सहेज रहे हैं..." },
  "admin.success":              { en: "Action updated successfully!", hi: "कार्रवाई सफलतापूर्वक अपडेट हुई!" },

  // ── Sidebar user card ──
  "sidebar.reportsLabel":       { en: "Reports",                 hi: "रिपोर्ट" },
  "sidebar.resolvedLabel":      { en: "Resolved",                hi: "हल किया" },
  "sidebar.trustLabel":         { en: "Trust Score",             hi: "विश्वास स्कोर" },

  // ── Issue details screen ──
  "details.anonymousCitizen":    { en: "Anonymous Citizen",        hi: "अज्ञात नागरिक" },
  "details.noPhotoUploaded":     { en: "No photo uploaded",        hi: "कोई फ़ोटो अपलोड नहीं" },
  "details.dispatch":            { en: "Dispatch",                 hi: "प्रेषण" },
  "details.deptPublicWorks":     { en: "Dept of Public Works",     hi: "लोक निर्माण विभाग" },
  "details.showAiDetails":       { en: "Show AI Details",          hi: "AI विवरण दिखाएं" },
  "details.recommendedRemedy":   { en: "Recommended Remedy",       hi: "अनुशंसित समाधान" },
  "details.defaultRemedy":       { en: "Conduct rapid municipal dispatch and assess site accessibility.", hi: "तेज़ नगरपालिका प्रेषण करें और साइट सुगमता का आकलन करें।" },
  "details.aiConfidence":        { en: "AI Confidence",            hi: "AI विश्वास" },
  "details.resolutionTimeline":  { en: "Resolution Timeline",      hi: "समाधान समयरेखा" },
  "details.communityControls":   { en: "Community Controls",       hi: "सामुदायिक नियंत्रण" },
  "details.upvote":              { en: "Upvote",                   hi: "समर्थन करें" },
  "details.verify":              { en: "Verify",                   hi: "सत्यापित करें" },
  "details.flagDuplicate":       { en: "Flag Duplicate",           hi: "डुप्लिकेट चिह्नित करें" },
  "details.districtSimPanel":    { en: "District Simulation Panel",hi: "जिला सिमुलेशन पैनल" },
  "details.districtSimDesc":     { en: "Test city dispatch workflows", hi: "शहर प्रेषण वर्कफ़्लो का परीक्षण करें" },
  "details.citizenComments":     { en: "Citizen Comments",         hi: "नागरिक टिप्पणियाँ" },
  "details.noCommentsYet":       { en: "No comments yet. Be the first to add details.", hi: "अभी कोई टिप्पणी नहीं। विवरण जोड़ने वाले पहले बनें।" },
  "details.systemDispatcher":    { en: "System Dispatcher",        hi: "सिस्टम प्रेषक" },
  "details.yourNameOptional":    { en: "Your Name (optional)",     hi: "आपका नाम (वैकल्पिक)" },
  "details.addHelpfulDetails":   { en: "Add helpful details (e.g. access, hazards)...", hi: "सहायक विवरण जोड़ें (जैसे पहुंच, खतरे)..." },
  "details.sending":             { en: "Sending...",               hi: "भेजा जा रहा है..." },
  "details.addComment":          { en: "Add Comment",              hi: "टिप्पणी जोड़ें" },

  // ── Notification panel UI ──
  "notif.title":                { en: "Notifications",           hi: "सूचनाएं" },
  "notif.unread":                { en: "unread",                  hi: "अपठित" },
  "notif.markAllRead":           { en: "Mark all read",           hi: "सभी पढ़ा हुआ चिह्नित करें" },
  "notif.allCaughtUp":           { en: "All caught up!",          hi: "सब कुछ देख लिया!" },
  "notif.noNew":                 { en: "No new notifications",    hi: "कोई नई सूचना नहीं" },
  "notif.tapToView":             { en: "Tap to view profile →",   hi: "प्रोफ़ाइल देखने के लिए टैप करें →" },
  "notif.clearAll":              { en: "Clear all notifications", hi: "सभी सूचनाएं हटाएं" },
  "notif.decline":               { en: "Decline",                 hi: "अस्वीकार करें" },
  "notif.accept":                { en: "Accept",                  hi: "स्वीकार करें" },
  "notif.trustedFiler":          { en: "Trusted Filer",           hi: "विश्वसनीय रिपोर्टर" },
  "notif.verifiedCitizen":       { en: "Verified Citizen",        hi: "सत्यापित नागरिक" },
  "notif.reporter":              { en: "Reporter",                hi: "रिपोर्टर" },
  "notif.reports":               { en: "Reports",                 hi: "रिपोर्ट" },
  "notif.trust":                 { en: "Trust",                   hi: "विश्वास" },

  // ── Time labels used in notif.time ──
  "time.justNow":                { en: "just now",                hi: "अभी अभी" },
  "time.minAgo":                 { en: "min ago",                 hi: "मिनट पहले" },
  "time.hrAgo":                  { en: "hr ago",                  hi: "घंटे पहले" },
  "time.hrsAgo":                 { en: "hrs ago",                 hi: "घंटे पहले" },
  "time.yesterday":               { en: "Yesterday",               hi: "कल" },

  // ── Mock + auto notification content (title/desc as keys) ──
  "notif.resolved1.title":       { en: "Issue Resolved! 🎉",       hi: "समस्या हल हो गई! 🎉" },
  "notif.resolved1.desc":        { en: "Deep Pothole Near Pari Chowk has been marked as resolved by the municipal team.", hi: "पारी चौक के पास गहरा गड्ढा नगरपालिका टीम द्वारा हल कर दिया गया है।" },
  "notif.verified1.title":       { en: "Your report was verified", hi: "आपकी रिपोर्ट सत्यापित हो गई" },
  "notif.verified1.desc":        { en: "3 citizens verified your report on Knowledge Park Road.", hi: "नॉलेज पार्क रोड पर आपकी रिपोर्ट को 3 नागरिकों ने सत्यापित किया।" },
  "notif.comment1.title":        { en: "New comment on your report", hi: "आपकी रिपोर्ट पर नई टिप्पणी" },
  "notif.comment1.desc":         { en: 'Marcus Vance commented: "Almost lost a tire here yesterday. Be very careful!"', hi: 'मार्कस वांस ने टिप्पणी की: "कल यहाँ मेरा टायर लगभग खराब हो गया था। बहुत सावधान रहें!"' },
  "notif.friend1.title":         { en: "Friend request from Priya M.", hi: "प्रिया एम. की ओर से मित्र अनुरोध" },
  "notif.friend1.desc":          { en: "Priya Mehta wants to connect. She has filed 18 reports in Sector 12.", hi: "प्रिया मेहता जुड़ना चाहती हैं। उन्होंने सेक्टर 12 में 18 रिपोर्ट दर्ज की हैं।" },
  "notif.critical1.title":       { en: "🚨 Critical issue near you", hi: "🚨 आपके पास गंभीर समस्या" },
  "notif.critical1.desc":        { en: "A new critical pothole was reported at Surajpur Kasna Road, 0.3km away.", hi: "सूरजपुर कासना रोड पर 0.3 किमी दूर एक नया गंभीर गड्ढा रिपोर्ट किया गया।" },
  "notif.upvote1.title":         { en: "Your report got 10 upvotes", hi: "आपकी रिपोर्ट को 10 समर्थन मिले" },
  "notif.upvote1.desc":          { en: "The community is rallying behind your report on Expressway Sector 18.", hi: "एक्सप्रेसवे सेक्टर 18 पर आपकी रिपोर्ट के पीछे समुदाय एकजुट हो रहा है।" },
  "notif.assigned1.title":       { en: "Crew dispatched",          hi: "टीम भेजी गई" },
  "notif.assigned1.desc":        { en: "Department of Transportation assigned a crew to the streetlight issue on Gamma Road.", hi: "परिवहन विभाग ने गामा रोड पर स्ट्रीटलाइट समस्या के लिए एक टीम भेजी।" },
  "notif.comment2.title":        { en: "New comment on your report", hi: "आपकी रिपोर्ट पर नई टिप्पणी" },
  "notif.comment2.desc":         { en: 'Sarah Jenkins commented: "Reported this manually too. Glad to see it is logged here."', hi: 'सारा जेनकिंस ने टिप्पणी की: "मैंने भी इसे मैन्युअल रूप से रिपोर्ट किया था। यहाँ दर्ज देखकर अच्छा लगा।"' },
  "notif.verified2.title":       { en: "Community badge earned! 🏆", hi: "सामुदायिक बैज अर्जित! 🏆" },
  "notif.verified2.desc":        { en: "You've reached Verified Citizen status. Your civic contributions are making a difference!", hi: "आपने सत्यापित नागरिक का दर्जा प्राप्त कर लिया है। आपका नागरिक योगदान बदलाव ला रहा है!" },

  // ── Random auto-notification pool ──
  "notif.auto.friend1.title":    { en: "Friend request from Arjun K.", hi: "अर्जुन के. की ओर से मित्र अनुरोध" },
  "notif.auto.friend1.desc":     { en: "Arjun Kumar wants to connect. He has filed 11 reports in Knowledge Park.", hi: "अर्जुन कुमार जुड़ना चाहते हैं। उन्होंने नॉलेज पार्क में 11 रिपोर्ट दर्ज की हैं।" },
  "notif.auto.comment1.title":   { en: "New comment on your report", hi: "आपकी रिपोर्ट पर नई टिप्पणी" },
  "notif.auto.comment1.desc":    { en: 'Rahul Sharma commented: "This pothole damaged my scooter too! Quick action needed."', hi: 'राहुल शर्मा ने टिप्पणी की: "इस गड्ढे ने मेरी स्कूटर भी खराब कर दी! तुरंत कार्रवाई की जरूरत है।"' },
  "notif.auto.upvote1.title":    { en: "5 new upvotes on your report", hi: "आपकी रिपोर्ट पर 5 नए समर्थन" },
  "notif.auto.upvote1.desc":     { en: "Residents are upvoting your Expressway report — community pressure is building.", hi: "निवासी आपके एक्सप्रेसवे रिपोर्ट का समर्थन कर रहे हैं — सामुदायिक दबाव बढ़ रहा है।" },
  "notif.auto.verified1.title":   { en: "Another citizen verified your report", hi: "एक अन्य नागरिक ने आपकी रिपोर्ट को सत्यापित किया" },
  "notif.auto.verified1.desc":    { en: "A local resident confirmed the hazard on Gamma Road. Verification count: 4.", hi: "एक स्थानीय निवासी ने गामा रोड पर खतरे की पुष्टि की। सत्यापन संख्या: 4।" },
  "notif.auto.friend2.title":    { en: "Friend request from Neha S.", hi: "नेहा एस. की ओर से मित्र अनुरोध" },
  "notif.auto.friend2.desc":     { en: "Neha Singh wants to connect. She has filed 7 reports in Beta 2.", hi: "नेहा सिंह जुड़ना चाहती हैं। उन्होंने बीटा 2 में 7 रिपोर्ट दर्ज की हैं।" },
  "notif.auto.assigned1.title":   { en: "Repair crew en route", hi: "मरम्मत दल रास्ते में है" },
  "notif.auto.assigned1.desc":    { en: "A crew has been dispatched to the streetlight issue you reported on Delta Road.", hi: "आपके द्वारा डेल्टा रोड पर रिपोर्ट की गई स्ट्रीटलाइट समस्या के लिए एक दल भेजा गया है।" },
  "notif.auto.critical1.title":   { en: "🚨 New hazard near you", hi: "🚨 आपके पास नया खतरा" },
  "notif.auto.critical1.desc":    { en: "A flooded road was reported at Kasna Road intersection, 0.5km from your area.", hi: "आपके क्षेत्र से 0.5 किमी दूर कासना रोड चौराहे पर जलभराव की सूचना मिली है।" },
  "notif.auto.resolved1.title":   { en: "Your report was resolved! 🎉", hi: "आपकी रिपोर्ट का समाधान हो गया! 🎉" },
  "notif.auto.resolved1.desc":    { en: "The broken footpath on Alpha Street has been repaired by the civic team.", hi: "अल्फा स्ट्रीट पर टूटे हुए फुटपाथ की नागरिक टीम द्वारा मरम्मत कर दी गई है।" },
  "notif.auto.comment2.title":   { en: "New comment on your report", hi: "आपकी रिपोर्ट पर नई टिप्पणी" },
  "notif.auto.comment2.desc":    { en: 'Deepika R. commented: "I called the municipality about this. They said 3-day ETA."', hi: 'दीपिका आर. ने टिप्पणी की: "मैंने इसके बारे में नगरपालिका को फोन किया था। उन्होंने 3 दिन का समय बताया है।"' },
  "notif.auto.upvote2.title":    { en: "Your report hit 25 upvotes!", hi: "आपकी रिपोर्ट पर 25 समर्थन मिले!" },
  "notif.auto.upvote2.desc":     { en: "The community is rallying behind your Sector 18 expressway report.", hi: "समुदाय आपके सेक्टर 18 एक्सप्रेसवे रिपोर्ट के पीछे एकजुट हो रहा है।" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () =>
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));

  const t = (key: string): string =>
    translations[key]?.[language] ?? key;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
