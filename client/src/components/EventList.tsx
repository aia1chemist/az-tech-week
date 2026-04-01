/*
 * Design: Copper Circuit — Events grouped by Morning/Afternoon/Evening
 * Collapsible time blocks with thin timeline markers
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Cloud, Moon, ChevronDown, Calendar } from "lucide-react";
import type { Event } from "@/data/types";

import EventCard from "./EventCard";

interface EventListProps {
  groupedEvents: Record<string, Event[]>;
  totalFiltered: number;
}

const TIME_SECTIONS = [
  { key: "Morning", label: "Morning", sub: "Before 12 PM", Icon: Sun, color: "text-amber-500" },
  { key: "Afternoon", label: "Afternoon", sub: "12 PM \u2013 5 PM", Icon: Cloud, color: "text-orange-500" },
  { key: "Evening", label: "Evening", sub: "After 5 PM", Icon: Moon, color: "text-indigo-400" },
];

export default function EventList({ groupedEvents, totalFiltered }: EventListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (totalFiltered === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Calendar className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No events found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Try adjusting your filters or searching for something different.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {TIME_SECTIONS.map(({ key, label, sub, Icon, color }) => {
        const events = groupedEvents[key] || [];
        if (events.length === 0) return null;
        const isCollapsed = collapsed[key];

        return (
          <div key={key} className="mb-2">
            {/* Section Header */}
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

            {/* Events */}
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
