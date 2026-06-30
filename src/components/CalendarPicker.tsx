import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthMatrix(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  // Monday-first weekday index (0 = Mon ... 6 = Sun)
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
}

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  markedDates?: Record<string, number>; // dateKey -> count, shows a dot/count under the day
  theme?: "light" | "dark";
  onDone?: () => void; // if provided, renders a "Done" confirm button
}

export default function CalendarPicker({ selectedDate, onSelectDate, markedDates = {}, theme = "light", onDone }: CalendarPickerProps) {
  const isDark = theme === "dark";
  const today = new Date();
  const [viewYear, setViewYear] = useState((selectedDate || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selectedDate || today).getMonth());
  const [pickerMode, setPickerMode] = useState<"days" | "months">("days");

  const goPrev = () => {
    if (pickerMode === "days") {
      const d = new Date(viewYear, viewMonth - 1, 1);
      setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
    } else {
      setViewYear((y) => y - 1);
    }
  };
  const goNext = () => {
    if (pickerMode === "days") {
      const d = new Date(viewYear, viewMonth + 1, 1);
      setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
    } else {
      setViewYear((y) => y + 1);
    }
  };

  const days = getMonthMatrix(viewYear, viewMonth);

  const card: React.CSSProperties = {
    background: isDark ? "#2E2140" : "white",
    border: `1px solid ${isDark ? "#4A3768" : BRAND.cardBorder}`,
    borderRadius: "24px",
    padding: "18px",
    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 4px 20px rgba(75,56,105,0.08)",
  };

  const textPrimary = isDark ? "#F3EAF7" : "#3A2C52";
  const textMuted = isDark ? "#9B8AB8" : "#B6A8C9";
  const textFaint = isDark ? "#5A4A72" : "#E3D5EA";

  const navBtnStyle: React.CSSProperties = {
    width: 30, height: 30, borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${isDark ? "#4A3768" : BRAND.cardBorder}`,
    background: isDark ? "#241934" : BRAND.cream,
    color: BRAND.purple,
    cursor: "pointer",
  };

  return (
    <div style={card}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={goPrev} style={navBtnStyle} aria-label="Previous">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setPickerMode((m) => (m === "days" ? "months" : "days"))}
          className="text-sm font-black tracking-tight cursor-pointer"
          style={{ color: textPrimary }}
        >
          {pickerMode === "days" ? `${MONTH_NAMES[viewMonth]} ${viewYear}` : viewYear}
        </button>
        <button type="button" onClick={goNext} style={navBtnStyle} aria-label="Next">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {pickerMode === "days" ? (
        <>
          {/* Weekday row */}
          <div className="grid grid-cols-7 mb-1.5">
            {WEEKDAY_LABELS.map((wd) => (
              <div key={wd} className="text-center text-[10px] font-bold uppercase tracking-wide" style={{ color: textMuted }}>
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1.5">
            {days.map((d, idx) => {
              const inMonth = d.getMonth() === viewMonth;
              const isToday = isSameDay(d, today);
              const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
              const key = formatDateKey(d);
              const count = markedDates[key];

              return (
                <div key={idx} className="flex flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={() => { onSelectDate(d); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all cursor-pointer"
                    style={
                      isSelected
                        ? { background: BRAND.purple, color: "white", boxShadow: `0 0 0 3px ${BRAND.lavender}55` }
                        : isToday
                        ? { border: `1.5px solid ${BRAND.purple}`, color: BRAND.purple, background: "transparent" }
                        : { color: inMonth ? textPrimary : textFaint, background: "transparent" }
                    }
                  >
                    {d.getDate()}
                  </button>
                  <span
                    style={{
                      width: 4, height: 4, borderRadius: "50%", marginTop: 2,
                      background: count ? (isSelected ? BRAND.purple : BRAND.coralDeep) : "transparent",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Month grid (shown when the header title is tapped) */
        <div className="grid grid-cols-3 gap-2">
          {MONTH_SHORT.map((m, i) => {
            const isCurrentSelection = i === viewMonth;
            return (
              <button
                key={m}
                type="button"
                onClick={() => { setViewMonth(i); setPickerMode("days"); }}
                className="py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition-all"
                style={
                  isCurrentSelection
                    ? { background: BRAND.purple, color: "white" }
                    : { background: isDark ? "#241934" : BRAND.cream, color: textPrimary, border: `1px solid ${isDark ? "#4A3768" : BRAND.cardBorder}` }
                }
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      {onDone && (
        <button
          type="button"
          onClick={onDone}
          className="w-full mt-4 py-2.5 rounded-2xl text-xs font-bold text-white cursor-pointer"
          style={{ background: BRAND.purple, boxShadow: `0 4px 14px ${BRAND.purple}40` }}
        >
          Done
        </button>
      )}
    </div>
  );
}
