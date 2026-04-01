/*
 * AZTW Light Theme — Day selector tabs with teal active state
 * Sticky, horizontally scrollable, shows event count per day
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
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div
        ref={scrollRef}
        className="flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-hide sm:justify-center"
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
              className={`relative flex flex-col items-center px-3.5 py-2 rounded-lg text-center transition-all duration-200 flex-shrink-0 tap-target ${
                isActive
                  ? "bg-teal-50 text-teal-700 border border-teal-300 shadow-md shadow-teal-100"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200"
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? "text-teal-600" : ""}`}>
                {dayName}
              </span>
              <span className={`text-sm font-bold leading-tight ${isActive ? "text-teal-700" : "text-gray-800"}`}>
                {dateNum}
              </span>
              <span className={`text-[9px] mt-0.5 ${isActive ? "text-teal-500" : "text-gray-400"}`}>
                {dayCounts[day]} events
              </span>
              {isActive && (
                <motion.div
                  layoutId="dayIndicator"
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-teal-500"
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
