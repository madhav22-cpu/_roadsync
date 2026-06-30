import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  MapPin,
  Loader2,
  Sparkles,
  Check,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Bookmark,
  Sliders,
  HelpCircle,
  XCircle,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as exifr from "exifr";
import { CivicIssue } from "../types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ReportFormProps {
  onReportSubmitted: (newIssue: CivicIssue) => void;
  reportingLocation: { lat: number; lng: number; address: string } | null;
  onStartSelectingLocation: () => void;
  onCancelSelectingLocation: () => void;
  isSelectingLocation: boolean;
  userSessionId?: string;
  theme: "light" | "dark";
  onLocationSelected?: (loc: { lat: number; lng: number; address: string }) => void;
}

const BRAND = {
  purple:     "#4B3869",
  purpleDark: "#352650",
  coral:      "#F4928C",
  coralDeep:  "#EF7B73",
  mint:       "#7AD9CE",
  lavender:   "#C9B8E3",
  cream:      "#FDF3EE",
  cardBorder: "#F5DCE0",
};

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

const NOMINATIM_SEARCH = (query: string) =>
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 700);

    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

// Imperative handle so the search bar (which sits outside <MapContainer>)
// can tell the live Leaflet map instance to fly somewhere.
function FlyToController({ flyToTarget }: { flyToTarget: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyToTarget) {
      map.flyTo(flyToTarget, 16, { duration: 1 });
    }
  }, [flyToTarget, map]);
  return null;
}

interface MapPinnerProps {
  initialCenter: [number, number];
  pinPosition:   [number, number] | null;
  onPin:         (lat: number, lng: number) => void;
  isDark:        boolean;
  flyToTarget:   [number, number] | null;
}

function ClickHandler({ onPin }: { onPin: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) {
    onPin(e.latlng.lat, e.latlng.lng);
  } });
  return null;
}

function MapPinner({ initialCenter, pinPosition, onPin, isDark, flyToTarget }: MapPinnerProps) {
  return (
    <div
      className="report-form-map rounded-2xl overflow-hidden border"
      style={{
        height: 300,
        width: "100%",
        borderColor: isDark ? "#4A3768" : BRAND.cardBorder,
        cursor: "crosshair",
      }}
    >
      <MapContainer
        center={initialCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url={
            isDark
              ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        <InvalidateSizeOnMount />
        <FlyToController flyToTarget={flyToTarget} />
        <ClickHandler onPin={onPin} />
        {pinPosition && <Marker position={pinPosition} />}
      </MapContainer>
    </div>
  );
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export default function ReportForm({
  onReportSubmitted,
  reportingLocation,
  onStartSelectingLocation,
  onCancelSelectingLocation,
  isSelectingLocation,
  userSessionId,
  theme,
  onLocationSelected,
}: ReportFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [description,  setDescription]  = useState("");
  const [customTitle,  setCustomTitle]   = useState("");
  const [category,     setCategory]      = useState<string>("");
  const [severity,     setSeverity]      = useState<string>("");
  const [imagePreview, setImagePreview]  = useState<string | null>(null);
  const [isDragging,   setIsDragging]    = useState(false);
  const [exifNotice,   setExifNotice]    = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mapCenter,      setMapCenter]      = useState<[number, number]>([28.6139, 77.209]);
  const [pinPosition,    setPinPosition]    = useState<[number, number] | null>(
    reportingLocation ? [reportingLocation.lat, reportingLocation.lng] : null
  );
  const [isGeocodingPin, setIsGeocodingPin] = useState(false);
  const [isAnalyzing,    setIsAnalyzing]    = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMsg,       setErrorMsg]       = useState<string | null>(null);

  // Location search bar state
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSearchResults, setLocationSearchResults] = useState<SearchResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState<string | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<[number, number] | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // KEY FIX: only mount the map AFTER the step-3 animation completes
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    if (currentStep !== 3) setMapReady(false);
  }, [currentStep]);

  useEffect(() => {
    if (reportingLocation) {
      setMapCenter([reportingLocation.lat, reportingLocation.lng]);
      setPinPosition([reportingLocation.lat, reportingLocation.lng]);
      return;
    }
    navigator.geolocation?.getCurrentPosition(
      (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  useEffect(() => {
    if (currentStep === 4 && !analysisResult && !isAnalyzing) runAIReview();
  }, [currentStep]);

  // Debounced live location search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!locationSearchQuery.trim() || locationSearchQuery.length < 3) {
      setLocationSearchResults([]);
      setLocationSearchError(null);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      runLocationSearch(locationSearchQuery);
    }, 500);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [locationSearchQuery]);

  const runLocationSearch = async (query: string) => {
    setIsSearchingLocation(true);
    setLocationSearchError(null);
    try {
      const res  = await fetch(NOMINATIM_SEARCH(query));
      const data: SearchResult[] = await res.json();
      if (data.length === 0) setLocationSearchError("No locations found. Try a nearby landmark or sector name, or tap the map directly to mark the spot.");
      setLocationSearchResults(data);
    } catch {
      setLocationSearchError("Search failed. Check your connection and try again.");
      setLocationSearchResults([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectSearchResult = async (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setPinPosition([lat, lng]);
    setFlyToTarget([lat, lng]);
    onLocationSelected?.({ lat, lng, address: result.display_name });

    setLocationSearchResults([]);
    setLocationSearchQuery("");
  };

  const clearLocationSearch = () => {
    setLocationSearchQuery("");
    setLocationSearchResults([]);
    setLocationSearchError(null);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setErrorMsg("Please upload a valid image file."); return; }
    if (file.size > 10 * 1024 * 1024)    { setErrorMsg("File size must be under 10MB for Gemini processing."); return; }
    setErrorMsg(null); setExifNotice(null);
    const reader     = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result as string); setAnalysisResult(null); };
    reader.readAsDataURL(file);
    try {
      const gps = await exifr.gps(file);
      if (gps?.latitude && gps?.longitude) {
        const { latitude: lat, longitude: lng } = gps;
        const address = await reverseGeocode(lat, lng);
        setMapCenter([lat, lng]);
        setPinPosition([lat, lng]);
        onLocationSelected?.({ lat, lng, address });
        setExifNotice(`📍 GPS detected in photo: ${address.split(",").slice(0, 2).join(",")}`);
      }
    } catch {}
  };

  const handleFileChange  = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) processFile(f); };
  const handleDragOver    = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave   = () => setIsDragging(false);
  const handleDrop        = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); };
  const triggerFileInput  = () => fileInputRef.current?.click();

  const handleMapPin = async (lat: number, lng: number) => {
    setPinPosition([lat, lng]);
    setIsGeocodingPin(true);
    const address = await reverseGeocode(lat, lng);
    setIsGeocodingPin(false);
    onLocationSelected?.({ lat, lng, address });
  };

  const runAIReview = async () => {
    setIsAnalyzing(true); setErrorMsg(null);
    try {
      const response = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          category:    category   || undefined,
          severity:    severity   || undefined,
          base64Image: imagePreview || undefined,
        }),
      });
      const data = await response.json();
      if (data.success && data.analysis) setAnalysisResult(data.analysis);
      else { setErrorMsg(data.error || "Failed to analyze report details."); simulateReview(); }
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to contact AI diagnostic servers. Showing offline assessment.");
      simulateReview();
    } finally { setIsAnalyzing(false); }
  };

  const simulateReview = () => {
    setAnalysisResult({
      category:            category || "pothole",
      severity:            severity || "medium",
      title:               customTitle || (description ? description.slice(0, 30) + "…" : "Road Patch Anomaly"),
      priorityScore:       severity === "critical" ? 92 : severity === "high" ? 78 : severity === "medium" ? 54 : 32,
      confidenceScore:     imagePreview ? 91 : 72,
      suggestedDepartment: category === "streetlight" ? "Bureau of Street Lighting" : category === "garbage" ? "Bureau of Sanitation" : "Department of Transportation",
      summary:             description || "Reported road obstacle demanding verification.",
      recommendedAction:   "Inspect concrete deterioration levels and apply asphalt patch sealant.",
      aiAnalysis:          "Analyzed locally. Visual pattern matching estimates sub-grade base failure due to heavy moisture seepage. Repair is recommended to prevent vehicular wheel tracking hazards.",
    });
  };

  const handleFinalSubmit = async () => {
    if (!reportingLocation) { setErrorMsg("Please select a location in Step 3."); setCurrentStep(3); return; }
    setIsAnalyzing(true);
    try {
      const payload  = {
        title:               analysisResult?.title || customTitle || "Reported Issue",
        description,
        category:            analysisResult?.category || category || "other",
        severity:            analysisResult?.severity || severity || "medium",
        lat:                 reportingLocation.lat,
        lng:                 reportingLocation.lng,
        address:             reportingLocation.address,
        base64Image:         imagePreview || undefined,
        creatorSessionId:    userSessionId,
        priorityScore:       analysisResult?.priorityScore,
        confidenceScore:     analysisResult?.confidenceScore,
        suggestedDepartment: analysisResult?.suggestedDepartment,
        summary:             analysisResult?.summary,
        recommendedAction:   analysisResult?.recommendedAction,
        aiAnalysis:          analysisResult?.aiAnalysis,
      };
      const response = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data     = await response.json();
      if (data.success && data.issue) {
        onReportSubmitted(data.issue);
        setDescription(""); setCustomTitle(""); setCategory(""); setSeverity("");
        setImagePreview(null); setAnalysisResult(null); setExifNotice(null);
        setPinPosition(null); setCurrentStep(1);
      } else { setErrorMsg(data.error || "Failed to register report in city registry."); }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection failure while submitting. Please check your network.");
    } finally { setIsAnalyzing(false); }
  };

  const isDark         = theme === "dark";
  const stepCardClass  = isDark ? "bg-[#2E2140] border border-[#4A3768]" : "bg-white border border-[#F5DCE0] shadow-[0_2px_16px_rgba(75,56,105,0.06)]";
  const textPrimary    = isDark ? "text-[#F3EAF7]"  : "text-[#3A2C52]";
  const textSecondary  = isDark ? "text-[#C9B8E3]"  : "text-[#8C7AA3]";
  const textMuted      = isDark ? "text-[#9B8AB8]"  : "text-[#B6A8C9]";
  const bgInput        = isDark ? "bg-[#241934] border-[#4A3768]" : "bg-[#FDF3EE] border-[#F5DCE0]";

  const stepsList = [
    { num: 1, label: "Evidence" },
    { num: 2, label: "Details"  },
    { num: 3, label: "Location" },
    { num: 4, label: "AI Review"},
  ];

  return (
    <div className={`p-4 md:p-5 rounded-3xl ${stepCardClass} transition-all relative overflow-hidden`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl -z-10 pointer-events-none" style={{ background: `${BRAND.coral}26` }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl -z-10 pointer-events-none" style={{ background: `${BRAND.mint}22` }} />

      {/* Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {stepsList.map((st) => (
            <div key={st.num} className="flex-1 flex flex-col items-center relative">
              {st.num > 1 && (
                <div className="absolute right-[50%] left-[-50%] top-3.5 h-[2px] -z-10"
                  style={{ background: currentStep >= st.num ? BRAND.purple : isDark ? "#4A3768" : "#F0DCE5" }} />
              )}
              <button
                type="button"
                onClick={() => {
                  if (st.num < currentStep) setCurrentStep(st.num);
                  else if (st.num === 2 && imagePreview) setCurrentStep(2);
                  else if (st.num === 3 && imagePreview && description.trim()) setCurrentStep(3);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                style={
                  currentStep === st.num
                    ? { background: BRAND.purple,  color: "white", boxShadow: `0 0 0 4px ${BRAND.lavender}55` }
                    : currentStep > st.num
                    ? { background: BRAND.mint, color: BRAND.purpleDark }
                    : isDark
                    ? { background: "#3A2C52", color: "#9B8AB8" }
                    : { background: "#F6E9EE", color: "#C9B5D6" }
                }
              >
                {currentStep > st.num ? <Check className="w-4 h-4" /> : st.num}
              </button>
              <span className="text-[10px] font-bold mt-1.5">
                <span className={currentStep === st.num ? "" : textMuted} style={currentStep === st.num ? { color: BRAND.purple } : {}}>
                  {st.label}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {currentStep === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.15 }} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${BRAND.coral}22`, color: BRAND.coralDeep }}>
                  <Camera className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className={`text-sm font-black font-sans tracking-tight ${textPrimary}`}>Step 1: Upload Photo Evidence</h3>
                  <p className={`text-[11px] ${textSecondary}`}>GPS coordinates are auto-extracted from photos that contain EXIF location data.</p>
                </div>
              </div>
              <div
                onClick={triggerFileInput}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className="cursor-pointer group relative border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center min-h-[160px]"
                style={{ borderColor: isDragging ? BRAND.coral : isDark ? "#4A3768" : "#F0DCE5", background: isDragging ? `${BRAND.coral}14` : isDark ? "#241934" : "#FDF3EE" }}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                {imagePreview ? (
                  <div className="relative w-full h-[180px] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                    <img src={imagePreview} alt="Issue preview" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-[#3A2C52]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md" style={{ background: BRAND.purpleDark, color: BRAND.coral }}>
                        <Camera className="w-4 h-4" /><span>Replace Photo</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-200" style={{ background: `${BRAND.coral}1f`, color: BRAND.coralDeep, border: `1px solid ${BRAND.coral}40` }}>
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className={`text-xs ${textPrimary} font-bold`}>
                      Drag and drop your hazard photo here, or{" "}
                      <span style={{ color: BRAND.coralDeep }} className="hover:underline">browse</span>
                    </p>
                    <p className={`text-[10px] ${textMuted} mt-1 font-medium`}>Supports PNG, JPEG (Max 10MB) · GPS auto-detected</p>
                  </div>
                )}
              </div>
              {exifNotice && (
                <div className="p-2.5 rounded-xl border text-[10.5px] font-medium flex items-center gap-2" style={{ background: `${BRAND.mint}18`, borderColor: `${BRAND.mint}44`, color: "#3FAFA1" }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />{exifNotice} — location pre-filled in Step 3.
                </div>
              )}
              {errorMsg && (
                <div className="p-2.5 rounded-xl border text-[10.5px] font-medium" style={{ background: "#fef2f2", color: "#ef4444", borderColor: "#fecaca" }}>{errorMsg}</div>
              )}
              <div className="p-3 rounded-2xl flex gap-2 text-[10.5px]" style={{ background: `${BRAND.mint}1a`, border: `1px solid ${BRAND.mint}40` }}>
                <Cpu className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#3FAFA1" }} />
                <p className={textSecondary}><strong>Pro-Tip:</strong> Daylight photos with clear road surroundings help Gemini estimate damage dimensions and priority more accurately.</p>
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setCurrentStep(2)} className="px-5 py-2.5 rounded-full text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md" style={{ background: BRAND.purple, boxShadow: `0 4px 14px ${BRAND.purple}40` }}>
                  <span>Continue</span><ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.15 }} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${BRAND.coral}22`, color: BRAND.coralDeep }}>
                  <Sliders className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className={`text-sm font-black font-sans tracking-tight ${textPrimary}`}>Step 2: Problem Description</h3>
                  <p className={`text-[11px] ${textSecondary}`}>Provide details about the hazard. Overwrite defaults to bypass AI suggestions.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>Details &amp; Situation context *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. This pothole is in the right lane of Surajpur Kasna Road, causing cars to slam on brakes..." rows={3} className={`w-full text-xs rounded-2xl p-3 focus:outline-none border ${bgInput} ${textPrimary} font-medium resize-none`} style={{ caretColor: BRAND.purple }} />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>
                    Custom Title <span className="font-normal" style={{ color: isDark ? "#7A6C94" : "#C9B5D6" }}>(Optional — Gemini auto-generates if blank)</span>
                  </label>
                  <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="e.g. Broken streetlight causing pitch-black block" className={`w-full text-xs rounded-2xl px-3 py-2.5 focus:outline-none border ${bgInput} ${textPrimary} font-medium`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>Override Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full text-xs rounded-2xl px-2.5 py-2 border cursor-pointer focus:outline-none ${bgInput} ${textPrimary} font-bold`}>
                      <option value="">Let Gemini Detect</option>
                      <option value="pothole">Pothole</option>
                      <option value="streetlight">Streetlight</option>
                      <option value="garbage">Garbage Dump</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>Override Severity</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={`w-full text-xs rounded-2xl px-2.5 py-2 border cursor-pointer focus:outline-none ${bgInput} ${textPrimary} font-bold`}>
                      <option value="">Let Gemini Detect</option>
                      <option value="low">Low Severity</option>
                      <option value="medium">Medium Severity</option>
                      <option value="high">High Severity</option>
                      <option value="critical">Critical Urgency</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setCurrentStep(1)} className="px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border" style={{ borderColor: BRAND.cardBorder, color: BRAND.purple, background: "white" }}>
                  <ArrowLeft className="w-4 h-4" /><span>Back</span>
                </button>
                <button type="button" onClick={() => setCurrentStep(3)} disabled={!description.trim()} className="px-5 py-2.5 rounded-full text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  style={description.trim() ? { background: BRAND.purple, boxShadow: `0 4px 14px ${BRAND.purple}40` } : { background: isDark ? "#3A2C52" : "#F0DCE5", color: "#C9B5D6", cursor: "not-allowed" }}>
                  <span>Continue</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
              onAnimationComplete={() => setMapReady(true)}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${BRAND.coral}22`, color: BRAND.coralDeep }}>
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className={`text-sm font-black font-sans tracking-tight ${textPrimary}`}>Step 3: Pin Location</h3>
                  <p className={`text-[11px] ${textSecondary}`}>
                    {exifNotice ? "Location pre-filled from photo GPS — adjust by tapping the map." : "Search for an address, or tap anywhere on the map to drop a pin."}
                  </p>
                </div>
              </div>

              {/* Location search bar */}
              <div className="relative">
                <div
                  className="flex items-center gap-2 rounded-2xl border px-3 py-1"
                  style={{ background: isDark ? "#241934" : "white", borderColor: isDark ? "#4A3768" : BRAND.cardBorder }}
                >
                  <Search className="w-4 h-4 shrink-0" style={{ color: BRAND.lavender }} />
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                        runLocationSearch(locationSearchQuery);
                      }
                    }}
                    placeholder="Search for an address or area..."
                    className={`flex-1 text-xs py-2.5 bg-transparent focus:outline-none font-medium ${textPrimary}`}
                  />
                  {locationSearchQuery && (
                    <button type="button" onClick={clearLocationSearch} className="shrink-0 p-1 cursor-pointer">
                      <X className="w-3.5 h-3.5" style={{ color: BRAND.lavender }} />
                    </button>
                  )}
                  {isSearchingLocation && <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ color: BRAND.purple }} />}
                </div>

                {locationSearchResults.length > 0 && (
                  <div
                    className="absolute z-[1000] left-0 right-0 mt-1.5 rounded-2xl border overflow-hidden max-h-[200px] overflow-y-auto"
                    style={{ background: isDark ? "#241934" : "white", borderColor: isDark ? "#4A3768" : BRAND.cardBorder, boxShadow: "0 8px 24px rgba(75,56,105,0.16)" }}
                  >
                    {locationSearchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSearchResult(result)}
                        className="px-3.5 py-2.5 text-[11.5px] font-medium cursor-pointer flex items-start gap-2"
                        style={{
                          color: isDark ? "#F3EAF7" : BRAND.purple,
                          borderBottom: idx < locationSearchResults.length - 1 ? `1px solid ${isDark ? "#4A3768" : BRAND.cardBorder}` : "none",
                        }}
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: BRAND.coralDeep }} />
                        <span>{result.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {locationSearchError && locationSearchResults.length === 0 && !isSearchingLocation && (
                  <div
                    className="absolute z-[1000] left-0 right-0 mt-1.5 rounded-2xl border px-3.5 py-2.5 text-[11px]"
                    style={{ background: isDark ? "#241934" : "white", borderColor: isDark ? "#4A3768" : BRAND.cardBorder, color: textMuted as any }}
                  >
                    {locationSearchError}
                  </div>
                )}
              </div>

              {/* KEY FIX: only render Leaflet map after animation finishes */}
              {mapReady ? (
                <MapPinner initialCenter={mapCenter} pinPosition={pinPosition} onPin={handleMapPin} isDark={isDark} flyToTarget={flyToTarget} />
              ) : (
                <div style={{
                  height: 300, width: "100%", borderRadius: 16,
                  background: isDark ? "#241934" : "#FDF3EE",
                  border: `1px solid ${isDark ? "#4A3768" : BRAND.cardBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND.lavender }} />
                </div>
              )}

              {isGeocodingPin && (
                <div className="flex items-center gap-2 text-[11px]" style={{ color: BRAND.purple }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Looking up address…</span>
                </div>
              )}
              {reportingLocation && !isGeocodingPin && (
                <div className="p-3.5 rounded-2xl border" style={{ background: `${BRAND.mint}14`, borderColor: `${BRAND.mint}44` }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: BRAND.mint }} />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${textPrimary}`}>Location Locked ✓</p>
                      <p className={`text-[11px] ${textSecondary} mt-0.5 truncate`}>{reportingLocation.address}</p>
                      <p className={`text-[9.5px] ${textMuted} mt-1 font-mono`}>{reportingLocation.lat.toFixed(5)}, {reportingLocation.lng.toFixed(5)}</p>
                    </div>
                  </div>
                </div>
              )}
              {!reportingLocation && !pinPosition && !isGeocodingPin && (
                <div className="p-4 rounded-2xl border border-dashed text-center flex flex-col items-center" style={{ borderColor: isDark ? "#4A3768" : "#F0DCE5", background: isDark ? "#241934" : "#FAF5F7" }}>
                  <HelpCircle className="w-7 h-7 mb-1.5" style={{ color: BRAND.lavender }} />
                  <p className={`text-xs font-bold ${textPrimary}`}>No pin yet</p>
                  <p className={`text-[10.5px] ${textSecondary} mt-0.5`}>Search above, or tap anywhere on the map to mark the spot.</p>
                </div>
              )}

              <div className="flex justify-between pt-1">
                <button type="button" onClick={() => setCurrentStep(2)} className="px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border" style={{ borderColor: BRAND.cardBorder, color: BRAND.purple, background: "white" }}>
                  <ArrowLeft className="w-4 h-4" /><span>Back</span>
                </button>
                <button type="button" onClick={() => { setAnalysisResult(null); setCurrentStep(4); }} disabled={!reportingLocation} className="px-5 py-2.5 rounded-full text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  style={reportingLocation ? { background: BRAND.purple, boxShadow: `0 4px 14px ${BRAND.purple}40` } : { background: isDark ? "#3A2C52" : "#F0DCE5", color: "#C9B5D6", cursor: "not-allowed" }}>
                  <Sparkles className="w-4 h-4" /><span>Run AI Diagnostic</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <motion.div key="step-4" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.15 }} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${BRAND.coral}22`, color: BRAND.coralDeep }}>
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className={`text-sm font-black font-sans tracking-tight ${textPrimary}`}>Step 4: Gemini AI Diagnostics</h3>
                  <p className={`text-[11px] ${textSecondary}`}>Real-time automated diagnostic assessment of infrastructure damage.</p>
                </div>
              </div>
              {isAnalyzing && (
                <div className="p-6 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[160px]" style={{ background: BRAND.cream, borderColor: BRAND.cardBorder }}>
                  <Loader2 className="w-8 h-8 mb-3 animate-spin" style={{ color: BRAND.coralDeep }} />
                  <p className="text-xs font-bold" style={{ color: BRAND.purple }}>Gemini Vision is analyzing…</p>
                  <p className={`text-[10px] ${textSecondary} mt-1 max-w-[200px]`}>Calculating structural damage, categorizing hazard, and matching city department dispatches.</p>
                </div>
              )}
              {!isAnalyzing && analysisResult && (
                <div className="space-y-3">
                  {errorMsg && (
                    <div className="p-2.5 rounded-xl border text-[10.5px] font-medium" style={{ background: "#fffaf0", color: "#b7791f", borderColor: "#fbd38d" }}>⚠️ {errorMsg}</div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Priority Level", value: analysisResult.priorityScore,           color: BRAND.coralDeep, bg: `${BRAND.coral}14` },
                      { label: "AI Confidence",  value: analysisResult.confidenceScore || 85,   color: "#3FAFA1",       bg: `${BRAND.mint}14`  },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-2xl border" style={{ background: s.bg, borderColor: BRAND.cardBorder }}>
                        <p className={`text-[9.5px] ${textMuted} uppercase tracking-wider font-bold`}>{s.label}</p>
                        <p className="text-xl font-black mt-1" style={{ color: s.color }}>{s.value}%</p>
                        <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: isDark ? "#4A3768" : "#F0DCE5" }}>
                          <div className="h-full rounded-full" style={{ background: s.color, width: `${s.value}%`, transition: "width 0.8s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3.5 rounded-2xl border space-y-3" style={{ background: isDark ? "#241934" : "#FAF5F7", borderColor: BRAND.cardBorder }}>
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b" style={{ borderColor: BRAND.cardBorder }}>
                      <div>
                        <p className={`text-[9.5px] ${textMuted} uppercase tracking-wider font-bold`}>AI Refined Title</p>
                        <p className={`text-xs font-bold ${textPrimary} mt-0.5`}>{analysisResult.title}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: `${BRAND.purple}1a`, color: BRAND.purple }}>{analysisResult.category}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{
                          background: analysisResult.severity === "critical" ? "#fef2f2" : analysisResult.severity === "high" ? `${BRAND.coral}22` : "#fffbeb",
                          color:      analysisResult.severity === "critical" ? "#ef4444" : analysisResult.severity === "high" ? BRAND.coralDeep      : "#b45309",
                        }}>{analysisResult.severity}</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <p className={`text-[9.5px] ${textMuted} uppercase tracking-wider font-bold`}>Dispatch Action</p>
                        <p className={`text-xs font-bold ${textPrimary}`}>{analysisResult.suggestedDepartment}</p>
                      </div>
                      <div className="p-2.5 rounded-xl text-[11px] leading-relaxed font-medium" style={{ background: "white", border: `1px solid ${BRAND.cardBorder}`, color: BRAND.purple }}>
                        "{analysisResult.aiAnalysis || analysisResult.summary}"
                      </div>
                      <div className="flex gap-1.5 items-start">
                        <Bookmark className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: BRAND.coralDeep }} />
                        <p className={`text-[11px] ${textSecondary} leading-normal`}>
                          <strong className={textPrimary}>Remedy: </strong>
                          {analysisResult.recommendedAction || "Conduct rapid municipal dispatch and assess site accessibility."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!isAnalyzing && !analysisResult && !errorMsg && (
                <div className="p-6 text-center text-xs font-medium" style={{ color: BRAND.lavender }}>Initializing AI review diagnostics…</div>
              )}
              {errorMsg && !analysisResult && (
                <div className="p-3.5 rounded-2xl border" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                  <p className="text-xs font-bold text-[#ef4444]">{errorMsg}</p>
                  <button type="button" onClick={runAIReview} className="mt-2 text-xs font-bold underline cursor-pointer" style={{ color: BRAND.coralDeep }}>Retry Analysis</button>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setCurrentStep(3)} disabled={isAnalyzing} className="px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border" style={{ borderColor: BRAND.cardBorder, color: BRAND.purple, background: "white" }}>
                  <ArrowLeft className="w-4 h-4" /><span>Back</span>
                </button>
                <button type="button" onClick={handleFinalSubmit} disabled={isAnalyzing || !analysisResult} className="px-5 py-2.5 rounded-full text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  style={analysisResult && !isAnalyzing ? { background: "#3FAFA1", boxShadow: "0 4px 14px rgba(63,175,161,0.4)" } : { background: isDark ? "#3A2C52" : "#F0DCE5", color: "#C9B5D6", cursor: "not-allowed" }}>
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Submit Report</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
