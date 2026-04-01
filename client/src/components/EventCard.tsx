/*
 * Design: Copper Circuit — Warm card with left category-colored accent
 * Includes: attendee count, capacity bar, sold out / filling up badges, description
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ExternalLink, Lock, Users, Flame, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { Event } from "@/data/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/data/types";

interface EventCardProps {
  event: Event;
  index: number;
  compact?: boolean;
}

const ACCENT_COLORS: Record<string, string> = {
  "AI & Machine Learning": "#b87333",
  "Arts & Entertainment": "#d4688e",
  "Blockchain & Crypto": "#7c3aed",
  "Cybersecurity": "#dc2626",
  "Data & Analytics": "#0891b2",
  "DevOps & Engineering": "#64748b",
  "Education & Workforce": "#3b82f6",
  "Energy & Sustainability": "#059669",
  "Fintech": "#16a34a",
  "General Tech": "#a8a29e",
  "Health & Biotech": "#0d9488",
  "Investing & VC": "#ca8a04",
  "Legal & Policy": "#6b7280",
  "Manufacturing & Hardware": "#ea580c",
  "Networking & Social": "#e11d48",
  "Real Estate": "#65a30d",
  "Sales & Marketing": "#c026d3",
  "Space & Aerospace": "#4f46e5",
  "Startups & Entrepreneurship": "#0284c7",
  "Tours & Demos": "#7c3aed",
};

function cleanTitle(title: string): string {
  return title
    .replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "")
    .replace(/\s*#AZTECHWEEK/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCapacityInfo(event: Event) {
  const isFull = event.spots_left === 0 || event.sold_out;
  const hasCapacity = event.capacity > 0;
  const hasSpots = event.spots_left >= 0;
  const fillPct = hasCapacity && hasSpots
    ? Math.min(((event.capacity - event.spots_left) / event.capacity) * 100, 100)
    : 0;
  const isFillingUp = hasSpots && event.spots_left > 0 && event.spots_left <= 10;
  const isAlmostFull = fillPct >= 80 && !isFull;

  return { isFull, hasCapacity, hasSpots, fillPct, isFillingUp, isAlmostFull };
}

export default function EventCard({ event, index, compact }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const primaryCategory = event.categories[0] || "General Tech";
  const accentColor = ACCENT_COLORS[primaryCategory] || "#b87333";
  const displayTitle = cleanTitle(event.title) || event.title;
  const cap = getCapacityInfo(event);
  const hasAttendeeData = event.going > 0 || event.interested > 0;
  const hasDescription = event.description && event.description.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.25) }}
    >
      <div className={`relative bg-card rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${cap.isFull ? "opacity-75" : ""}`}>
        {/* Left accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: accentColor }}
        />

        <div className="pl-4 pr-3 py-3 sm:pl-5 sm:pr-4 sm:py-4">
          {/* Status badges row */}
          {(cap.isFull || cap.isFillingUp || cap.isAlmostFull) && (
            <div className="flex gap-1.5 mb-2">
              {cap.isFull && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                  <XCircle className="w-2.5 h-2.5" />
                  SOLD OUT
                </span>
              )}
              {cap.isFillingUp && !cap.isFull && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 animate-pulse">
                  <Flame className="w-2.5 h-2.5" />
                  {event.spots_left} SPOTS LEFT
                </span>
              )}
              {cap.isAlmostFull && !cap.isFillingUp && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Flame className="w-2.5 h-2.5" />
                  FILLING UP
                </span>
              )}
            </div>
          )}

          {/* Top row: time + city + invite badge */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5 flex-wrap">
            <span className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {event.time}
            </span>
            {event.city && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <MapPin className="w-3 h-3" />
                {event.city}
              </span>
            )}
            {event.invite_only && (
              <span className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0">
                <Lock className="w-2.5 h-2.5" />
                Invite Only
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-card-foreground leading-snug mb-1 ${compact ? "text-sm line-clamp-2" : "text-sm sm:text-[15px]"}`}>
            {displayTitle}
          </h3>

          {/* Organizer */}
          <p className="text-xs text-muted-foreground mb-2 truncate">
            by {event.organizer}
          </p>

          {/* Description (expandable) */}
          {hasDescription && !compact && (
            <div className="mb-2.5">
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    key="full"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="truncated"
                    className="text-xs text-muted-foreground leading-relaxed line-clamp-2"
                  >
                    {event.description}
                  </motion.p>
                )}
              </AnimatePresence>
              {event.description!.length > 120 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className="flex items-center gap-0.5 text-[11px] text-primary font-medium mt-1 hover:underline"
                >
                  {expanded ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Read more <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Attendee + Capacity Row */}
          {(hasAttendeeData || cap.hasCapacity) && (
            <div className="mb-2.5 space-y-1.5">
              {/* Attendee counts */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                {event.going > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-primary" />
                    <span className="font-semibold text-foreground">{event.going}</span> going
                  </span>
                )}
                {event.interested > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">{event.interested}</span> interested
                  </span>
                )}
                {event.maybe > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">{event.maybe}</span> maybe
                  </span>
                )}
              </div>

              {/* Capacity bar */}
              {cap.hasCapacity && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cap.isFull
                          ? "bg-red-400"
                          : cap.fillPct >= 80
                          ? "bg-orange-400"
                          : cap.fillPct >= 50
                          ? "bg-amber-400"
                          : "bg-primary/60"
                      }`}
                      style={{ width: `${cap.fillPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {cap.hasSpots
                      ? cap.isFull
                        ? `${event.capacity}/${event.capacity}`
                        : `${event.capacity - event.spots_left}/${event.capacity}`
                      : `${event.capacity} spots`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Bottom row: categories + RSVP link */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {event.categories.slice(0, compact ? 1 : 2).map((cat) => {
                const catColors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["General Tech"];
                const icon = CATEGORY_ICONS[cat] || "💡";
                return (
                  <span
                    key={cat}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium ${catColors.bg} ${catColors.text}`}
                  >
                    <span className="text-[10px]">{icon}</span>
                    <span className="truncate max-w-[90px] sm:max-w-[130px]">{cat}</span>
                  </span>
                );
              })}
              {event.categories.length > (compact ? 1 : 2) && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{event.categories.length - (compact ? 1 : 2)}
                </span>
              )}
            </div>

            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                  cap.isFull
                    ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {cap.isFull ? "Waitlist" : "RSVP"}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
