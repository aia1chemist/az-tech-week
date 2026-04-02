/*
 * AZTW Light Theme — Day selector tabs with teal active state
 * Sticky, horizontally scrollable, shows event count per day
 */
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";
import { DAY_SHORT } from "@/data/types";
import { WeatherBadge } from "./WeatherOverlay";

const data = eventsData as EventsData;

interface DaySelectorProps {
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

export default function DaySelector({ selectedDay, onSelectDay }: DaySelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector("[data-active='true']") as HTMLElement | null;
      if (activeBtn) {
        // Use scrollLeft on the container instead of scrollIntoView to avoid vertical page scroll
        const container = scrollRef.current;
        const scrollLeft = activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [selectedDay]);

  const dayCounts = data.days.reduce<Record<string, number>>((acc, day) => {
    acc[day] = data.events.filter((e) => e.full_date === day).length;
    return acc;
  }, {});

  return (
    <div>
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
                  ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-600 shadow-md shadow-teal-100 dark:shadow-teal-900/20"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? "text-teal-600" : ""}`}>
                {dayName}
              </span>
              <span className={`text-sm font-bold leading-tight ${isActive ? "text-teal-700 dark:text-teal-300" : "text-gray-800 dark:text-gray-200"}`}>
                {dateNum}
              </span>
              <span className={`text-[9px] mt-0.5 ${isActive ? "text-teal-500" : "text-gray-400"}`}>
                {dayCounts[day]} events
              </span>
              <WeatherBadge day={day} />
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
