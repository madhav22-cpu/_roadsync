import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CivicIssue } from "../types";
import { MapPin, Navigation, Layers, Search, X } from "lucide-react";

interface MapContainerProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: CivicIssue) => void;
  reportingLocation: { lat: number; lng: number; address: string } | null;
  onSelectReportingLocation: (loc: { lat: number; lng: number; address: string }) => void;
  isSelectingLocationMode: boolean;
}

const BRAND = {
  purple:     "#4B3869",
  coral:      "#F4928C",
  coralDeep:  "#EF7B73",
  mint:       "#7AD9CE",
  peach:      "#F4B860",
  butter:     "#F6D88A",
  cream:      "#FDF3EE",
  cardBorder: "#F5DCE0",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: BRAND.coralDeep,
  high:     BRAND.peach,
  medium:   BRAND.butter,
  low:      BRAND.mint,
};

const STATUS_COLORS: Record<string, string> = {
  reported:    BRAND.coralDeep,
  verified:    "#9B8AC9",
  assigned:    "#6FB8D9",
  in_progress: BRAND.peach,
  resolved:    BRAND.mint,
};

const GREATER_NOIDA_LOCATIONS = [
  { lat: 28.4744, lng: 77.5030, name: "Knowledge Park III" },
  { lat: 28.4595, lng: 77.4940, name: "Pari Chowk" },
  { lat: 28.4890, lng: 77.5130, name: "Sector Alpha" },
  { lat: 28.4650, lng: 77.5200, name: "Sector Beta" },
  { lat: 28.4820, lng: 77.4850, name: "Surajpur" },
  { lat: 28.4700, lng: 77.5080, name: "Sector Gamma" },
  { lat: 28.4550, lng: 77.5150, name: "Kasna" },
  { lat: 28.4960, lng: 77.5060, name: "Greater Noida West" },
];

const TILE_URLS = {
  streets:   "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
} as const;

const TILE_ATTRIBUTION = {
  streets:   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  satellite: '&copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics',
} as const;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const NOMINATIM_REVERSE = (lat: number, lng: number) =>
  `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

const NOMINATIM_SEARCH = (query: string) =>
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function MapContainer({
  issues, selectedIssueId, onSelectIssue,
  reportingLocation, onSelectReportingLocation, isSelectingLocationMode,
}: MapContainerProps) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const tileLayer  = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSelectingRef = useRef(isSelectingLocationMode);
  useEffect(() => { isSelectingRef.current = isSelectingLocationMode; }, [isSelectingLocationMode]);

  const onSelectReportingLocationRef = useRef(onSelectReportingLocation);
  useEffect(() => { onSelectReportingLocationRef.current = onSelectReportingLocation; }, [onSelectReportingLocation]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle,  setMapStyle]  = useState<"streets" | "satellite">("streets");

  // --- Location search state ---
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [searchError, setSearchError]     = useState<string | null>(null);

  useEffect(() => {
    initMap();
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current, {
      center:      [28.4744, 77.5030],
      zoom:        13,
      zoomControl: false,
    });

    tileLayer.current = L.tileLayer(TILE_URLS.streets, {
      attribution: TILE_ATTRIBUTION.streets,
      maxZoom:     19,
    }).addTo(leafletMap.current);

    L.control.zoom({ position: "bottomright" }).addTo(leafletMap.current);

    leafletMap.current.on("click", async (e: any) => {
      if (!isSelectingRef.current) return;
      const { lat, lng } = e.latlng;
      try {
        const res  = await fetch(NOMINATIM_REVERSE(lat, lng));
        const data = await res.json();
        onSelectReportingLocationRef.current({
          lat, lng,
          address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
      } catch {
        onSelectReportingLocationRef.current({
          lat, lng,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
      }
    });

    setTimeout(() => leafletMap.current?.invalidateSize(), 100);

    setMapLoaded(true);
  };

  // --- Debounced live search as the user types ---
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      runSearch(searchQuery);
    }, 500);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const runSearch = async (query: string) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const res  = await fetch(NOMINATIM_SEARCH(query));
      const data: SearchResult[] = await res.json();
      if (data.length === 0) {
        setSearchError("No locations found. Try a different search.");
      }
      setSearchResults(data);
    } catch {
      setSearchError("Search failed. Check your connection and try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    onSelectReportingLocation({
      lat, lng,
      address: result.display_name,
    });

    leafletMap.current?.flyTo([lat, lng], 16, { duration: 1 });

    setSearchResults([]);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  useEffect(() => {
    if (!leafletMap.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    issues.forEach((issue, idx) => {
      const loc = GREATER_NOIDA_LOCATIONS[idx % GREATER_NOIDA_LOCATIONS.length];
      const lat = issue.lat ?? loc.lat + (Math.random() - 0.5) * 0.01;
      const lng = issue.lng ?? loc.lng + (Math.random() - 0.5) * 0.01;

      const isSelected = issue.id === selectedIssueId;
      const color      = isSelected ? BRAND.purple : (SEVERITY_COLORS[issue.severity] || "#B6A8C9");
      const size       = isSelected ? 44 : 36;

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:${size}px; height:${size}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg)${isSelected ? " scale(1.2)" : ""};
            background:${color};
            border: 3px solid white;
            box-shadow: 0 4px 16px ${color}60;
            display:flex; align-items:center; justify-content:center;
          ">
            <div style="transform:rotate(45deg);font-size:${isSelected ? 16 : 14}px;">
              ${issue.category === "pothole"     ? "🕳️"
              : issue.category === "streetlight" ? "💡"
              : issue.category === "garbage"     ? "🗑️"
              : "🔧"}
            </div>
          </div>
          ${isSelected
            ? `<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:${BRAND.coral};border:2px solid white;animation:pulse 1.5s infinite;"></div>`
            : ""}
        `,
        iconSize:   [size, size],
        iconAnchor: [size / 2, size],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(leafletMap.current)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;padding:4px;">
            <p style="font-size:11px;font-weight:700;color:${BRAND.purple};margin:0 0 4px;">${issue.title}</p>
            <p style="font-size:10px;color:#B6A8C9;margin:0 0 8px;">${issue.address}</p>
            <div style="display:flex;gap:6px;">
              <span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:${color}20;color:${color};text-transform:uppercase;">${issue.severity}</span>
              <span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:${(STATUS_COLORS[issue.status] ?? "#ccc")}20;color:${STATUS_COLORS[issue.status] ?? "#ccc"};text-transform:uppercase;">${issue.status.replace("_", " ")}</span>
            </div>
          </div>
        `);

      marker.on("click", () => onSelectIssue(issue));
      markersRef.current.push(marker);
    });

    if (reportingLocation) {
      const repIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:${BRAND.coral};border:3px solid white;box-shadow:0 0 0 4px ${BRAND.coral}4D;animation:pulse 1.5s infinite;"></div>`,
        iconSize:   [20, 20],
        iconAnchor: [10, 10],
      });
      markersRef.current.push(
        L.marker([reportingLocation.lat, reportingLocation.lng], { icon: repIcon })
          .addTo(leafletMap.current)
          .bindPopup(`<div style="font-size:11px;font-weight:700;color:${BRAND.coralDeep};">📍 Selected Location</div>`)
      );
    }
  }, [issues, selectedIssueId, mapLoaded, reportingLocation]);

  useEffect(() => {
    if (!leafletMap.current) return;
    if (tileLayer.current) tileLayer.current.remove();
    tileLayer.current = L.tileLayer(TILE_URLS[mapStyle], {
      attribution: TILE_ATTRIBUTION[mapStyle],
      maxZoom:     19,
    }).addTo(leafletMap.current);
  }, [mapStyle]);

  useEffect(() => {
    if (!selectedIssueId || !leafletMap.current) return;
    const idx = issues.findIndex(i => i.id === selectedIssueId);
    if (idx === -1) return;
    const loc = GREATER_NOIDA_LOCATIONS[idx % GREATER_NOIDA_LOCATIONS.length];
    leafletMap.current.flyTo([loc.lat, loc.lng], 15, { duration: 1 });
  }, [selectedIssueId]);

  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new ResizeObserver(() => {
      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [mapLoaded]);

  const centerMap = () => {
    leafletMap.current?.flyTo([28.4744, 77.5030], 13, { duration: 1 });
  };

  return (
    <div style={{
      position:     "relative",
      width:        "100%",
      height:       "100%",
      minHeight:    "400px",
      borderRadius: "24px",
      overflow:     "hidden",
      border:       `1px solid ${BRAND.cardBorder}`,
      boxShadow:    "0 4px 20px rgba(75,56,105,0.10)",
    }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />

      {!mapLoaded && (
        <div style={{
          position:       "absolute", inset: 0,
          background:     BRAND.cream,
          display:        "flex", flexDirection: "column",
          alignItems:     "center", justifyContent: "center",
          gap:            "12px",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            border: `3px solid ${BRAND.cardBorder}`,
            borderTopColor: BRAND.purple,
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: "13px", color: "#B6A8C9", fontWeight: 600 }}>Loading map…</p>
        </div>
      )}

      {/* Location search bar — only shown in location-picking mode */}
      {isSelectingLocationMode && (
        <div style={{
          position: "absolute", top: "12px", left: "12px", right: "12px",
          zIndex: 1002,
        }}>
          <div style={{
            background: "white", borderRadius: "14px", padding: "4px 6px 4px 14px",
            boxShadow: "0 2px 14px rgba(75,56,105,0.16)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Search style={{ width: "16px", height: "16px", color: "#B6A8C9", flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  runSearch(searchQuery);
                }
              }}
              placeholder="Type an address, locality or landmark..."
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: "13px", padding: "10px 0", color: BRAND.purple,
                background: "transparent",
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px", display: "flex", alignItems: "center",
                  color: "#B6A8C9",
                }}
              >
                <X style={{ width: "14px", height: "14px" }} />
              </button>
            )}
            {isSearching && (
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%",
                border: `2px solid ${BRAND.cardBorder}`,
                borderTopColor: BRAND.purple,
                animation: "spin 0.8s linear infinite",
                marginRight: "6px", flexShrink: 0,
              }} />
            )}
          </div>

          {searchResults.length > 0 && (
            <div style={{
              background: "white", borderRadius: "14px", marginTop: "6px",
              boxShadow: "0 2px 14px rgba(75,56,105,0.16)",
              overflow: "hidden", maxHeight: "220px", overflowY: "auto",
            }}>
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(result)}
                  style={{
                    padding: "10px 14px", fontSize: "12px", color: BRAND.purple,
                    cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "8px",
                    borderBottom: idx < searchResults.length - 1 ? `1px solid ${BRAND.cardBorder}` : "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = BRAND.cream)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <MapPin style={{ width: "12px", height: "12px", color: BRAND.coralDeep, marginTop: "2px", flexShrink: 0 }} />
                  <span>{result.display_name}</span>
                </div>
              ))}
            </div>
          )}

          {searchError && searchResults.length === 0 && !isSearching && (
            <div style={{
              background: "white", borderRadius: "14px", marginTop: "6px",
              boxShadow: "0 2px 14px rgba(75,56,105,0.16)",
              padding: "10px 14px", fontSize: "12px", color: "#B6A8C9",
            }}>
              {searchError}
            </div>
          )}
        </div>
      )}

      {/* Top controls */}
      <div style={{
        position: "absolute",
        top: isSelectingLocationMode ? "118px" : "12px",
        left: "12px", right: "12px",
        display: "flex", justifyContent: "space-between",
        zIndex: 1000, pointerEvents: "none",
        transition: "top 0.2s ease",
      }}>
        <div style={{
          background: "white", borderRadius: "14px", padding: "8px 14px",
          boxShadow: "0 2px 14px rgba(75,56,105,0.14)",
          display: "flex", alignItems: "center", gap: "8px",
          pointerEvents: "auto",
        }}>
          <MapPin style={{ width: "14px", height: "14px", color: BRAND.coralDeep }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: BRAND.purple }}>
            Greater Noida · {issues.length} Issues
          </span>
        </div>
        <button
          onClick={() => setMapStyle(s => s === "streets" ? "satellite" : "streets")}
          style={{
            background: "white", borderRadius: "14px", padding: "8px 14px",
            boxShadow: "0 2px 14px rgba(75,56,105,0.14)",
            display: "flex", alignItems: "center", gap: "6px",
            border: "none", cursor: "pointer",
            fontSize: "12px", fontWeight: 700, color: BRAND.purple,
            pointerEvents: "auto",
          }}>
          <Layers style={{ width: "14px", height: "14px", color: BRAND.coralDeep }} />
          {mapStyle === "streets" ? "Satellite" : "Streets"}
        </button>
      </div>

      {/* Re-center button */}
      <button
        onClick={centerMap}
        style={{
          position: "absolute", bottom: "80px", right: "12px", zIndex: 1000,
          background: "white", borderRadius: "14px", padding: "10px",
          boxShadow: "0 2px 14px rgba(75,56,105,0.18)",
          border: "none", cursor: "pointer",
        }}>
        <Navigation style={{ width: "18px", height: "18px", color: BRAND.coralDeep }} />
      </button>

      {/* Severity legend */}
      <div style={{
        position: "absolute", bottom: "12px", left: "12px", zIndex: 1000,
        background: "white", borderRadius: "14px", padding: "10px 14px",
        boxShadow: "0 2px 14px rgba(75,56,105,0.14)",
      }}>
        <p style={{
          fontSize: "9px", fontWeight: 700, color: "#B6A8C9",
          textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px",
        }}>Severity</p>
        <div style={{ display: "flex", gap: "10px" }}>
          {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
            <div key={sev} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
              <span style={{ fontSize: "10px", color: "#8C7AA3", fontWeight: 600, textTransform: "capitalize" }}>{sev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location-picking banner */}
      {isSelectingLocationMode && (
        <div style={{
          position: "absolute", bottom: "130px", left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, background: BRAND.purple, color: "white",
          borderRadius: "14px", padding: "10px 20px",
          fontSize: "12px", fontWeight: 700,
          boxShadow: `0 4px 18px ${BRAND.purple}55`,
          whiteSpace: "nowrap",
        }}>
          📍 Search above or tap anywhere on the map to pin location
        </div>
      )}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          border: 1px solid ${BRAND.cardBorder} !important;
          box-shadow: 0 4px 22px rgba(75,56,105,0.16) !important;
        }
        .leaflet-popup-tip { background: white !important; }
      `}</style>
    </div>
  );
}