/*
 * Design: Copper Circuit — Events grouped by Morning/Afternoon/Evening (normal)
 * or grouped by Day (when searching across all days)
 * Collapsible sections with thin timeline markers
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Cloud, Moon, ChevronDown, Calendar, Search } from "lucide-react";
import type { Event } from "@/data/types";

import EventCard from "./EventCard";

interface EventListProps {
  groupedEvents: Record<string, Event[]>;
  totalFiltered: number;
  isSearchMode?: boolean;
  searchDayBreakdown?: Record<string, number> | null;
}

const TIME_SECTIONS = [
  { key: "Morning", label: "Morning", sub: "Before 12 PM", Icon: Sun, color: "text-amber-500" },
  { key: "Afternoon", label: "Afternoon", sub: "12 PM \u2013 5 PM", Icon: Cloud, color: "text-orange-500" },
  { key: "Evening", label: "Evening", sub: "After 5 PM", Icon: Moon, color: "text-indigo-400" },
];

const DAY_SHORT: Record<string, string> = {
  "Monday, April 6": "Mon 4/6",
  "Tuesday, April 7": "Tue 4/7",
  "Wednesday, April 8": "Wed 4/8",
  "Thursday, April 9": "Thu 4/9",
  "Friday, April 10": "Fri 4/10",
  "Saturday, April 11": "Sat 4/11",
  "Sunday, April 12": "Sun 4/12",
};

const DAY_ORDER = [
  "Monday, April 6",
  "Tuesday, April 7",
  "Wednesday, April 8",
  "Thursday, April 9",
  "Friday, April 10",
  "Saturday, April 11",
  "Sunday, April 12",
];

export default function EventList({ groupedEvents, totalFiltered, isSearchMode, searchDayBreakdown }: EventListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (totalFiltered === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          {isSearchMode ? (
            <Search className="w-7 h-7 text-muted-foreground" />
          ) : (
            <Calendar className="w-7 h-7 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No events found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {isSearchMode
            ? "No events match your search across any day. Try different keywords."
            : "Try adjusting your filters or searching for something different."}
        </p>
      </div>
    );
  }

  // Search mode: group by day
  if (isSearchMode) {
    const sortedDays = DAY_ORDER.filter((d) => groupedEvents[d] && groupedEvents[d].length > 0);

    return (
      <div className="pb-24">
        {/* Search results banner */}
        <div className="mx-4 mb-3 px-4 py-3 bg-primary/5 border border-primary/15 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {totalFiltered} result{totalFiltered !== 1 ? "s" : ""} across all days
            </span>
          </div>
          {searchDayBreakdown && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {DAY_ORDER.filter((d) => searchDayBreakdown[d]).map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary"
                >
                  {DAY_SHORT[d] || d}: {searchDayBreakdown[d]}
                </span>
              ))}
            </div>
          )}
        </div>

        {sortedDays.map((day) => {
          const events = groupedEvents[day] || [];
          const isCollapsed = collapsed[day];
          const shortDay = DAY_SHORT[day] || day;

          return (
            <div key={day} className="mb-2">
              <button
                onClick={() => toggleSection(day)}
                className="w-full sticky top-[72px] z-20 flex items-center gap-3 px-4 py-2.5 bg-background/95 backdrop-blur-sm border-b border-border/30 tap-target"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-semibold text-foreground">{shortDay}</span>
                  <span className="text-xs text-muted-foreground ml-2">{day.split(",")[0]}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {events.length}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-2 space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-3">
                      {events.map((event, i) => (
                        <EventCard key={event.id} event={event} index={i} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }

  // Normal mode: group by time of day
  return (
    <div className="pb-24">
      {TIME_SECTIONS.map(({ key, label, sub, Icon, color }) => {
        const events = groupedEvents[key] || [];
        if (events.length === 0) return null;
        const isCollapsed = collapsed[key];

        return (
          <div key={key} className="mb-2">
            <button
              onClick={() => toggleSection(key)}
              className="w-full sticky top-[72px] z-20 flex items-center gap-3 px-4 py-2.5 bg-background/95 backdrop-blur-sm border-b border-border/30 tap-target"
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-secondary ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground ml-2">{sub}</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {events.length}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  isCollapsed ? "-rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-2 space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-3">
                    {events.map((event, i) => (
                      <EventCard key={event.id} event={event} index={i} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
