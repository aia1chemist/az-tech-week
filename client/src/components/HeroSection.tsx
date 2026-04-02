/*
 * AZTW Hero — Bold uppercase, teal accents, animated counters
 * Parallax hero background, Countdown timer, Dark mode toggle
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";
import Countdown from "./Countdown";
import DarkModeToggle from "./DarkModeToggle";

const data = eventsData as EventsData;

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663332946355/akrRM8ZRc9zFgPZYYwkCrW/hero-banner-26FVEgmdJnLhmYKAfMrXei.webp";

/* Animated counter hook */
function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* Parallax scroll hook */
function useParallax() {
  const [offset, setOffset] = useState(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        setOffset(window.scrollY);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return offset;
}

/* Compute global stats */
function computeStats() {
  let totalGoing = 0;
  let totalCapacity = 0;
  let totalFilled = 0;
  const dayStats: Record<string, { events: number; going: number; capacity: number; filled: number }> = {};

  for (const day of data.days) {
    dayStats[day] = { events: 0, going: 0, capacity: 0, filled: 0 };
  }

  for (const e of data.events) {
    totalGoing += e.going || 0;
    if (e.capacity > 0) {
      totalCapacity += e.capacity;
      const filled = e.spots_left >= 0 ? e.capacity - e.spots_left : 0;
      totalFilled += filled;
    }
    if (dayStats[e.full_date]) {
      dayStats[e.full_date].events += 1;
      dayStats[e.full_date].going += e.going || 0;
      if (e.capacity > 0) {
        dayStats[e.full_date].capacity += e.capacity;
        dayStats[e.full_date].filled += e.spots_left >= 0 ? e.capacity - e.spots_left : 0;
      }
    }
  }

  const totalOpenSlots = totalCapacity - totalFilled;
  const fillPct = totalCapacity > 0 ? Math.round((totalFilled / totalCapacity) * 100) : 0;

  return { totalGoing, totalCapacity, totalFilled, totalOpenSlots, fillPct, dayStats };
}

const stats = computeStats();

const DAY_LABELS: Record<string, { short: string }> = {
  "Monday, April 6": { short: "Mon" },
  "Tuesday, April 7": { short: "Tue" },
  "Wednesday, April 8": { short: "Wed" },
  "Thursday, April 9": { short: "Thu" },
  "Friday, April 10": { short: "Fri" },
  "Saturday, April 11": { short: "Sat" },
  "Sunday, April 12": { short: "Sun" },
};

export default function HeroSection() {
  const eventsCounter = useAnimatedCounter(data.events.length);
  const goingCounter = useAnimatedCounter(stats.totalGoing);
  const slotsCounter = useAnimatedCounter(stats.totalOpenSlots);
  const scrollY = useParallax();

  const maxEvents = Math.max(...Object.values(stats.dayStats).map((d) => d.events));

  return (
    <div className="relative overflow-hidden">
      {/* Parallax Background */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMG}
          alt=""
          className="w-full h-[120%] object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.35}px)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-white dark:to-gray-900" />
      </div>

      {/* Dark mode toggle — top right */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>

      {/* Content */}
      <div className="relative px-4 pt-12 pb-8 sm:pt-20 sm:pb-12">
        {/* Date badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold tracking-widest uppercase">
            April 6 – 12, 2026
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none mb-2"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
        >
          AZ Tech Week
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-sm sm:text-base text-white/80 max-w-md mx-auto mb-5"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
        >
          Arizona's inaugural tech week. Every event. One calendar.
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex justify-center mb-6"
        >
          <Countdown />
        </motion.div>

        {/* Animated stat counters — glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-lg mx-auto mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <div className="flex items-stretch justify-center divide-x divide-gray-200 dark:divide-gray-700">
            <div ref={eventsCounter.ref} className="flex-1 text-center px-3 py-4">
              <div className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 font-display">{eventsCounter.count}+</div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Events</div>
            </div>
            <div ref={goingCounter.ref} className="flex-1 text-center px-3 py-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">{goingCounter.count.toLocaleString()}+</div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Going</div>
            </div>
            <div ref={slotsCounter.ref} className="flex-1 text-center px-3 py-4">
              <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 font-display">{slotsCounter.count.toLocaleString()}+</div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Open Spots</div>
            </div>
          </div>

          {/* Global capacity bar */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              <span>Overall Capacity</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{stats.fillPct}% Full</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.fillPct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  stats.fillPct >= 80 ? "bg-gradient-to-r from-red-400 to-red-500" :
                  stats.fillPct >= 50 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                  "bg-gradient-to-r from-teal-400 to-teal-500"
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Day density heatmap — glass card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-sm mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4"
        >
          <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-center font-semibold">Event Density by Day</div>
          <div className="flex gap-1.5 justify-center">
            {data.days.map((day) => {
              const ds = stats.dayStats[day];
              const intensity = ds.events / maxEvents;
              const fillPct = ds.capacity > 0 ? Math.round((ds.filled / ds.capacity) * 100) : 0;
              const label = DAY_LABELS[day] || { short: day };

              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold border transition-all"
                    style={{
                      backgroundColor: intensity > 0.7 ? "#0d9488" : intensity > 0.4 ? "#5eead4" : "#ccfbf1",
                      borderColor: intensity > 0.7 ? "#0f766e" : intensity > 0.4 ? "#14b8a6" : "#99f6e4",
                      color: intensity > 0.5 ? "white" : "#0f766e",
                    }}
                  >
                    {ds.events}
                  </div>
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">{label.short}</span>
                  {fillPct > 0 && (
                    <span className={`text-[8px] font-bold ${
                      fillPct >= 70 ? "text-red-500" : fillPct >= 40 ? "text-amber-500" : "text-teal-500"
                    }`}>
                      {fillPct}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-6 flex justify-center"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </div>
    </div>
  );
}
