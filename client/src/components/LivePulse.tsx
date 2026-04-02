/*
 * LivePulse — "Trending Now" indicator showing simulated real-time RSVP momentum
 * Shows events with the highest RSVP velocity as a compact animated strip
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";

const data = eventsData as EventsData;

interface TrendingEvent {
  id: number;
  title: string;
  going: number;
  velocity: number; // simulated RSVPs per hour
  city: string;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function computeTrending(day: string): TrendingEvent[] {
  const dayEvents = data.events.filter(e => e.full_date === day && e.going > 5);
  const rand = seededRandom(day.length * 17 + dayEvents.length);

  return dayEvents
    .map(e => ({
      id: e.id,
      title: e.title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").replace(/\s*#AZTECHWEEK/gi, "").trim(),
      going: e.going,
      velocity: Math.round((e.going * (0.3 + rand() * 0.7)) / 24 * 10) / 10,
      city: e.city || "Phoenix",
    }))
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 8);
}

interface LivePulseProps {
  selectedDay: string;
}

export default function LivePulse({ selectedDay }: LivePulseProps) {
  const trending = useMemo(() => computeTrending(selectedDay), [selectedDay]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (trending.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % trending.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [trending.length]);

  if (trending.length === 0) return null;

  const current = trending[currentIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-200/60 dark:border-orange-800/30">
        <div className="flex items-center gap-1 flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Trending</span>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                {current.title}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                <TrendingUp className="w-3 h-3" />
                +{current.velocity}/hr
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {trending.slice(0, 5).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${
                i === currentIdx ? "bg-orange-500" : "bg-orange-200 dark:bg-orange-800"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
