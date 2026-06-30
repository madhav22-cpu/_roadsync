export const T = {
  bg:         "#F5F0FF",
  violet:     "#4A2C6A",
  violetMid:  "#7B4FA6",
  rose:       "#F4A7B9",
  periwinkle: "#A9B8E8",
  peach:      "#FFD6C0",
  mint:       "#B8E8D4",
  surface:    "#FFFFFF",
  surfaceAlt: "#FAF7FF",
  text:       "#2D1B4E",
  textMid:    "#6B5B8A",
  textLight:  "#A89BC4",
  border:     "#E8DFF5",
};

export const sevStyle: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: "#C0392B", bg: "#FFE8E8", border: "#F5C6C6" },
  high:     { color: "#E67E22", bg: "#FFF3E0", border: "#FADCB0" },
  medium:   { color: "#8B6914", bg: "#FFFBE6", border: "#F5E4A0" },
  low:      { color: "#5B7A6B", bg: "#E8F5EE", border: "#B8DFC8" },
};

export const statStyle: Record<string, { color: string; bg: string; border: string; label: string }> = {
  resolved:    { color: "#2E7D5E", bg: "#D4F5E8", border: "#A8E8CA", label: "Resolved"   },
  in_progress: { color: "#7B4FA6", bg: "#EDE0FF", border: "#C8AAEE", label: "Active"     },
  assigned:    { color: "#1A5F9E", bg: "#DDEEFF", border: "#A8CCEE", label: "Assigned"   },
  verified:    { color: "#2E6B8E", bg: "#D8EEFF", border: "#A0CCEE", label: "Verified"   },
  reported:    { color: "#C0392B", bg: "#FFE8E8", border: "#F5C6C6", label: "Reported"   },
};

export const catIcon: Record<string, string> = {
  pothole:     "🕳️",
  streetlight: "💡",
  garbage:     "🗑️",
  other:       "🔧",
};
