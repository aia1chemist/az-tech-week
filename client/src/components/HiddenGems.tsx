/*
 * HiddenGems — Surface low-attendee but unique events
 * Small capacity, interesting topics, events people might overlook
 */
import { useState, useMemo } from "react";
import { Gem, ChevronLeft, ChevronRight, Clock, MapPin, Users, Heart, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import EventsData from "@/data/events.json";
import type { Event } from "@/data/types";
import { CATEGORY_ICONS } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const allEvents = EventsData.events as Event[];

const DAY_MAP: Record<string, string> = {
  "Monday, April 6": "Mon",
  "Tuesday, April 7": "Tue",
  "Wednesday, April 8": "Wed",
  "Thursday, April 9": "Thu",
  "Friday, April 10": "Fri",
  "Saturday, April 11": "Sat",
  "Sunday, April 12": "Sun",
};

function scoreGem(e: Event): number {
  let score = 0;
  // Small capacity = more intimate = gem
  if (e.capacity > 0 && e.capacity <= 30) score += 40;
  else if (e.capacity > 30 && e.capacity <= 60) score += 25;
  else if (e.capacity > 60 && e.capacity <= 100) score += 10;
  // Low attendee count means less discovered
  if (e.going >= 0 && e.going < 15) score += 30;
  else if (e.going >= 15 && e.going < 30) score += 15;
  // Niche categories get bonus
  const nicheCats = ["Space & Aerospace", "Legal & Policy", "Energy & Sustainability", "Tours & Demos", "Manufacturing & Hardware"];
  if (e.categories.some(c => nicheCats.includes(c))) score += 25;
  // Not invite-only (accessible)
  if (!e.invite_only) score += 10;
  // Has description (more effort = more likely quality)
  if (e.description && e.description.length > 50) score += 10;
  // Not sold out (still available)
  if (!e.sold_out && e.spots_left !== 0) score += 15;
  return score;
}

export default function HiddenGems({ selectedDay }: { selectedDay: string }) {
  const { toggle, isBookmarked } = useBookmarks();
  const [scrollIdx, setScrollIdx] = useState(0);

  const gems = useMemo(() => {
    return allEvents
      .filter(e => e.full_date === selectedDay)
      .map(e => ({ event: e, score: scoreGem(e) }))
      .filter(g => g.score >= 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(g => g.event);
  }, [selectedDay]);

  if (gems.length === 0) return null;

  const visibleCount = 3;
  const maxScroll = Math.max(0, gems.length - visibleCount);

  return (
    <section className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gem className="w-4.5 h-4.5 text-amber-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Hidden Gems
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {DAY_MAP[selectedDay] || ""} — small events worth discovering
          </span>
        </div>
        {gems.length > visibleCount && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScrollIdx(Math.max(0, scrollIdx - 1))}
              disabled={scrollIdx === 0}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setScrollIdx(Math.min(maxScroll, scrollIdx + 1))}
              disabled={scrollIdx >= maxScroll}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex gap-3 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${scrollIdx * (100 / visibleCount)}%)` }}
        >
          {gems.map((event) => {
            const saved = isBookmarked(event.id);
            const icon = CATEGORY_ICONS[event.categories[0]] || "💡";
            const isFull = event.sold_out || event.spots_left === 0;

            return (
              <div
                key={event.id}
                className={`flex-shrink-0 rounded-xl border bg-gradient-to-br from-amber-50/50 to-white dark:from-gray-800 dark:to-gray-800/50 p-3.5 transition-all hover:shadow-md ${
                  saved ? "border-pink-300 ring-1 ring-pink-100" : "border-amber-200/60 dark:border-gray-700 hover:border-amber-300"
                }`}
                style={{ width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 12) / visibleCount}px)` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-lg">{icon}</span>
                  <button
                    onClick={() => {
                      toggle(event.id);
                      toast(saved ? "Removed" : "Added to schedule", { icon: saved ? "💔" : "❤️", duration: 1200 });
                    }}
                    className={`p-0.5 rounded-full transition-all ${saved ? "text-pink-500" : "text-gray-300 hover:text-pink-400"}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${saved ? "fill-pink-500" : ""}`} />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1.5">
                  {event.title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").trim()}
                </h3>

                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2 truncate">
                  by {event.organizer}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {event.start_time || event.time}
                  </span>
                  {event.city && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      {event.city}
                    </span>
                  )}
                  {event.going > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Users className="w-3 h-3 text-amber-500" />
                      {event.going} going
                    </span>
                  )}
                </div>

                {event.capacity > 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mb-2">
                    {isFull ? "Waitlisted" : `Only ${event.capacity} spots total`}
                  </p>
                )}

                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${
                    isFull
                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                      : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                  }`}
                >
                  {isFull ? "Waitlist" : "RSVP"}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
