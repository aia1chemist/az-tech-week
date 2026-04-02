/*
 * AfterPartyFinder — Suggests evening/night events near bookmarked daytime events
 * Shows contextual "After this, check out..." suggestions
 */
import { useMemo } from "react";
import { Moon, MapPin, Clock, Heart, ArrowRight } from "lucide-react";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";
import { DAY_SHORT } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

const NEAR_CITIES: Record<string, string[]> = {
  Phoenix: ["Phoenix", "Scottsdale", "Tempe", "Mesa", "Chandler", "Glendale", "Peoria"],
  Scottsdale: ["Scottsdale", "Phoenix", "Tempe", "Paradise Valley", "Cave Creek"],
  Tempe: ["Tempe", "Mesa", "Phoenix", "Scottsdale", "Chandler"],
  Mesa: ["Mesa", "Tempe", "Chandler", "Gilbert", "Phoenix"],
  Tucson: ["Tucson"],
  Chandler: ["Chandler", "Gilbert", "Tempe", "Mesa", "Phoenix"],
  Gilbert: ["Gilbert", "Chandler", "Mesa", "Tempe"],
};

function isEvening(event: typeof data.events[0]): boolean {
  return event.time_of_day === "Evening";
}

function isAfternoonOrMorning(event: typeof data.events[0]): boolean {
  return event.time_of_day === "Morning" || event.time_of_day === "Afternoon";
}

interface AfterPartyFinderProps {
  selectedDay: string;
}

export default function AfterPartyFinder({ selectedDay }: AfterPartyFinderProps) {
  const { bookmarkedIds, toggle, isBookmarked } = useBookmarks();

  const suggestions = useMemo(() => {
    const dayEvents = data.events.filter(e => e.full_date === selectedDay);
    const bookmarkedDaytime = dayEvents.filter(e => bookmarkedIds.has(e.id) && isAfternoonOrMorning(e));

    if (bookmarkedDaytime.length === 0) return [];

    // Find evening events near the bookmarked daytime events
    const eveningEvents = dayEvents.filter(e => isEvening(e) && !bookmarkedIds.has(e.id) && !e.sold_out);

    // Score evening events by proximity to bookmarked daytime events
    const scored = eveningEvents.map(eve => {
      let proximityScore = 0;
      for (const day of bookmarkedDaytime) {
        const nearCities = NEAR_CITIES[day.city || "Phoenix"] || [day.city || "Phoenix"];
        if (nearCities.includes(eve.city || "Phoenix")) proximityScore += 10;
        if (eve.city === day.city) proximityScore += 5;
      }
      // Popularity bonus
      if (eve.going > 20) proximityScore += 5;
      if (eve.going > 50) proximityScore += 5;
      return { event: eve, score: proximityScore };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.event);
  }, [selectedDay, bookmarkedIds]);

  if (suggestions.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-3">
      <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-indigo-100 dark:border-indigo-800/30">
          <Moon className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">After-Party Finder</h3>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Evening events near your picks</span>
        </div>
        <div className="p-3 space-y-2">
          {suggestions.map(e => {
            const saved = isBookmarked(e.id);
            return (
              <div key={e.id} className={`flex items-center gap-3 p-2.5 rounded-lg bg-white/70 dark:bg-gray-800/50 border ${
                saved ? "border-indigo-300 dark:border-indigo-600" : "border-white/50 dark:border-gray-700/50"
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {e.title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").trim()}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{e.start_time}</span>
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{e.city}</span>
                    {e.going > 0 && <span>{e.going} going</span>}
                  </div>
                </div>
                <button
                  onClick={() => toggle(e.id)}
                  className={`p-1.5 rounded-full transition-colors ${
                    saved ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-300 hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
                </button>
                {e.link && (
                  <a href={e.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex-shrink-0">
                    RSVP
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
