/*
 * Design: Copper Circuit — Horizontal scrollable day tabs with copper accent
 * Sticky on scroll, swipeable on mobile, shows event count per day
 */
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";
import { DAY_SHORT } from "@/data/types";

const data = eventsData as EventsData;

interface DaySelectorProps {
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

export default function DaySelector({ selectedDay, onSelectDay }: DaySelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected day
  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector("[data-active='true']");
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedDay]);

  const dayCounts = data.days.reduce<Record<string, number>>((acc, day) => {
    acc[day] = data.events.filter((e) => e.full_date === day).length;
    return acc;
  }, {});

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div
        ref={scrollRef}
        className="flex gap-1 px-4 py-2.5 overflow-x-auto scrollbar-hide sm:justify-center"
      >
        {data.days.map((day) => {
          const isActive = selectedDay === day;
          const shortLabel = DAY_SHORT[day] || day;
          const parts = shortLabel.split(" ");
          const dayName = parts[0];
          const dateNum = parts[1];

          return (
            <button
              key={day}
              data-active={isActive}
              onClick={() => onSelectDay(day)}
              className={`relative flex flex-col items-center px-3.5 py-2 rounded-xl text-center transition-all duration-200 flex-shrink-0 tap-target ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {dayName}
              </span>
              <span className="text-sm font-bold leading-tight">{dateNum}</span>
              <span
                className={`text-[9px] mt-0.5 ${
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground/60"
                }`}
              >
                {dayCounts[day]} events
              </span>
              {isActive && (
                <motion.div
                  layoutId="dayIndicator"
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
