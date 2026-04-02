/*
 * Live Ticker — "What's Hot" horizontal scrolling ticker
 * Shows events with most RSVPs, crossover attendees, and reactions
 */
import { useMemo, useRef, useEffect, useState } from "react";
import { Flame, TrendingUp, Users, Sparkles, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { CATEGORY_ICONS } from "@/data/types";

const data = eventsData as EventsData;

function cleanTitle(title: string): string {
  return title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").replace(/\s*#AZTECHWEEK/gi, "").replace(/\s+/g, " ").trim();
}

interface LiveTickerProps {
  selectedDay: string;
}

/* Simulate "hot right now" by scoring events */
function getHotEvents(day: string): Array<{ event: Event; reason: string; score: number }> {
  const dayEvents = (data.events as Event[]).filter((e) => e.full_date === day);

  return dayEvents
    .map((e) => {
      let score = 0;
      let reason = "";

      // High attendance momentum
      if (e.going >= 20) { score += 30; reason = `${e.going} going`; }
      else if (e.going >= 10) { score += 15; reason = `${e.going} going`; }

      // Almost full / sold out
      if (e.sold_out) { score += 25; reason = "Waitlist"; }
      else if (e.spots_left >= 0 && e.spots_left <= 5) { score += 20; reason = `Only ${e.spots_left} spots!`; }
      else if (e.spots_left >= 0 && e.spots_left <= 10) { score += 10; reason = `${e.spots_left} spots left`; }

      // High interest
      if (e.interested >= 10) { score += 10; }

      // Popular categories
      const hotCats = ["AI & Machine Learning", "Startups & Entrepreneurship", "Networking & Social"];
      if (e.categories.some((c) => hotCats.includes(c))) score += 5;

      return { event: e, reason, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

/* Crossover: events where many attendees likely overlap (same organizer, same city, same time) */
function getCrossoverPairs(day: string): Array<{ a: Event; b: Event; reason: string }> {
  const dayEvents = (data.events as Event[]).filter((e) => e.full_date === day && e.going > 5);
  const pairs: Array<{ a: Event; b: Event; reason: string }> = [];

  for (let i = 0; i < dayEvents.length && pairs.length < 3; i++) {
    for (let j = i + 1; j < dayEvents.length && pairs.length < 3; j++) {
      const a = dayEvents[i];
      const b = dayEvents[j];
      const sharedCats = a.categories.filter((c) => b.categories.includes(c));
      if (sharedCats.length >= 2 && a.city === b.city) {
        pairs.push({ a, b, reason: `Both in ${a.city} · ${sharedCats[0]}` });
      }
    }
  }
  return pairs;
}

export default function LiveTicker({ selectedDay }: LiveTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const hotEvents = useMemo(() => getHotEvents(selectedDay), [selectedDay]);
  const crossovers = useMemo(() => getCrossoverPairs(selectedDay), [selectedDay]);

  // Auto-scroll ticker
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [autoScroll]);

  if (hotEvents.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    setAutoScroll(false);
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.6;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  return (
    <div className="py-3 px-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 border border-orange-200">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">What's Hot</span>
            </div>
          </div>
          <div className="hidden sm:flex gap-1">
            <button onClick={() => scroll("left")} className="p-1 rounded bg-white/80 border border-amber-200 text-amber-500 hover:text-amber-700">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => scroll("right")} className="p-1 rounded bg-white/80 border border-amber-200 text-amber-500 hover:text-amber-700">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable ticker */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
          onMouseEnter={() => setAutoScroll(false)}
          onMouseLeave={() => setAutoScroll(true)}
        >
          {hotEvents.map(({ event, reason }) => {
            const icon = CATEGORY_ICONS[event.categories[0]] || "\u{1F4A1}";
            const isFull = event.sold_out || event.spots_left === 0;
            return (
              <a
                key={event.id}
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-200 hover:border-orange-400 hover:shadow-md transition-all group min-w-[200px] max-w-[280px]"
              >
                <span className="text-base flex-shrink-0">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                    {cleanTitle(event.title)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isFull ? (
                      <span className="text-[9px] font-bold text-red-600 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> WAITLIST
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-600 font-medium flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" /> {reason}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}

          {/* Crossover pairs */}
          {crossovers.map(({ a, b, reason }, i) => (
            <div
              key={`cross-${i}`}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200 min-w-[220px] max-w-[300px]"
            >
              <Zap className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mb-0.5">Crossover</p>
                <p className="text-[10px] text-gray-700 truncate">{cleanTitle(a.title).slice(0, 25)}...</p>
                <p className="text-[10px] text-gray-700 truncate">{cleanTitle(b.title).slice(0, 25)}...</p>
                <p className="text-[9px] text-violet-500 mt-0.5">{reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
