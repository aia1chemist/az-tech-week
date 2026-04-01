/*
 * Design: Copper Circuit — Horizontal scrollable trending events
 * Shows the hottest events for the selected day with fire/trending indicators
 */
import { useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Flame, ChevronLeft, ChevronRight } from "lucide-react";
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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 border-b border-amber-200/40">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-orange-100">
              <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Trending Today</h2>
            <span className="text-[10px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-full">
              {events.length}
            </span>
          </div>
          <div className="hidden sm:flex gap-1">
            <button
              onClick={() => scroll("left")}
              className="p-1 rounded-md hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1 rounded-md hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 px-4 pb-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          {events.map((event, i) => {
            const isFull = event.spots_left === 0 || event.sold_out;
            const isFillingUp = event.spots_left > 0 && event.spots_left <= 10;
            const icon = CATEGORY_ICONS[event.categories[0]] || "💡";
            const title = cleanTitle(event.title) || event.title;

            return (
              <motion.a
                key={event.id}
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="flex-shrink-0 w-[220px] sm:w-[240px] snap-start bg-card rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className="p-3">
                  {/* Status badge */}
                  {(isFull || isFillingUp) && (
                    <div className="mb-1.5">
                      {isFull ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700">
                          SOLD OUT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700 animate-pulse">
                          <Flame className="w-2 h-2" />
                          {event.spots_left} LEFT
                        </span>
                      )}
                    </div>
                  )}

                  {/* Icon + Title */}
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                    <h3 className="text-xs font-semibold text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                  </div>

                  {/* Time + City */}
                  <p className="text-[10px] text-muted-foreground mb-1.5 truncate">
                    {event.time} · {event.city}
                  </p>

                  {/* Organizer */}
                  <p className="text-[10px] text-muted-foreground/70 mb-2 truncate">
                    by {event.organizer}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {event.going > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5 text-primary" />
                        <span className="font-semibold text-foreground">{event.going}</span> going
                      </span>
                    )}
                    {event.interested > 0 && (
                      <span>{event.interested} interested</span>
                    )}
                    {event.capacity > 0 && !event.going && !event.interested && (
                      <span>{event.capacity} spots</span>
                    )}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
