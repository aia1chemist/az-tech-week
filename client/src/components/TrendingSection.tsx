/*
 * AZTW Light Theme — Trending events horizontal carousel
 * Shows hottest events with compact cards, teal accents
 */
import { useRef } from "react";
import { Flame, Clock, MapPin, ExternalLink, ChevronLeft, ChevronRight, Users } from "lucide-react";
import type { Event } from "@/data/types";
import { CATEGORY_ICONS } from "@/data/types";

interface TrendingSectionProps {
  events: Event[];
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "")
    .replace(/\s*#AZTECHWEEK/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function TrendingSection({ events }: TrendingSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (events.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.7;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  return (
    <div className="py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-100">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Trending Today</h2>
          </div>
          <div className="hidden sm:flex gap-1">
            <button onClick={() => scroll("left")} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll("right")} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {events.map((event) => {
            const isFull = event.spots_left === 0 || event.sold_out;
            const icon = CATEGORY_ICONS[event.categories[0]] || "\u{1F4A1}";
            const title = cleanTitle(event.title);

            return (
              <a
                key={event.id}
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-56 sm:w-64 bg-white border border-gray-200 hover:border-teal-300 rounded-lg p-3 transition-all hover:shadow-lg hover:shadow-teal-50 group"
              >
                {/* Status */}
                {isFull && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 mb-2">
                    WAITLIST
                  </span>
                )}
                {!isFull && event.spots_left > 0 && event.spots_left <= 10 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-300 mb-2">
                    <Flame className="w-2.5 h-2.5" /> {event.spots_left} spots left
                  </span>
                )}

                {/* Category icon + title */}
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {title}
                  </h3>
                </div>

                {/* Time + City */}
                <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-500" />
                    {event.start_time || event.time}
                  </span>
                  {event.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-500" />
                      {event.city}
                    </span>
                  )}
                </div>

                {/* Organizer */}
                <p className="text-[10px] text-gray-400 truncate mb-2">
                  by {event.organizer}
                </p>

                {/* Attendee count + RSVP */}
                <div className="flex items-center justify-between">
                  {event.going > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Users className="w-3 h-3 text-teal-500" />
                      <span className="font-semibold text-gray-800">{event.going}</span> going
                    </span>
                  )}
                  <span className={`ml-auto inline-flex items-center gap-1 text-[11px] font-semibold ${isFull ? "text-amber-600" : "text-teal-600"}`}>
                    {isFull ? "Waitlist" : "RSVP"} <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
