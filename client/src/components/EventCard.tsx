/*
 * AZTW Light Theme — Event card with left accent stripe
 * h-full for equal height, white card bg, teal accents, clear borders
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ExternalLink, Lock, Users, Flame, Timer, ChevronDown, ChevronUp } from "lucide-react";
import type { Event } from "@/data/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/data/types";

interface EventCardProps {
  event: Event;
  index: number;
  compact?: boolean;
}

const ACCENT_COLORS: Record<string, string> = {
  "AI & Machine Learning": "#f59e0b",
  "Arts & Entertainment": "#ec4899",
  "Blockchain & Crypto": "#8b5cf6",
  "Cybersecurity": "#ef4444",
  "Data & Analytics": "#06b6d4",
  "DevOps & Engineering": "#64748b",
  "Education & Workforce": "#3b82f6",
  "Energy & Sustainability": "#10b981",
  "Fintech": "#22c55e",
  "General Tech": "#78716c",
  "Health & Biotech": "#14b8a6",
  "Investing & VC": "#eab308",
  "Legal & Policy": "#6b7280",
  "Manufacturing & Hardware": "#f97316",
  "Networking & Social": "#f43f5e",
  "Real Estate": "#84cc16",
  "Sales & Marketing": "#d946ef",
  "Space & Aerospace": "#6366f1",
  "Startups & Entrepreneurship": "#0ea5e9",
  "Tours & Demos": "#a855f7",
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
  const accentColor = ACCENT_COLORS[primaryCategory] || "#14b8a6";
  const displayTitle = cleanTitle(event.title) || event.title;
  const cap = getCapacityInfo(event);
  const hasAttendeeData = event.going > 0 || event.interested > 0;
  const hasDescription = event.description && event.description.length > 0;
  const hasDuration = event.duration && event.duration.length > 0;
  const hasEndTime = event.end_time && event.end_time.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.25) }}
      className="h-full"
    >
      <div className={`relative h-full bg-white rounded-lg border border-gray-200 hover:border-teal-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${cap.isFull ? "opacity-75" : ""}`}>
        {/* Left accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: accentColor }}
        />

        <div className="pl-4 pr-3 py-3 sm:pl-5 sm:pr-4 sm:py-4 flex flex-col flex-1">
          {/* Status badges */}
          {(cap.isFull || cap.isFillingUp || cap.isAlmostFull) && (
            <div className="flex gap-1.5 mb-2">
              {cap.isFull && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
                  WAITLIST
                </span>
              )}
              {cap.isFillingUp && !cap.isFull && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-300 animate-pulse">
                  <Flame className="w-2.5 h-2.5" />
                  {event.spots_left} SPOTS LEFT
                </span>
              )}
              {cap.isAlmostFull && !cap.isFillingUp && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                  <Flame className="w-2.5 h-2.5" />
                  FILLING UP
                </span>
              )}
            </div>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5 flex-wrap">
            <span className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3 text-teal-500" />
              {event.start_time || event.time}
              {hasEndTime && <span className="text-gray-400"> – {event.end_time}</span>}
            </span>
            {hasDuration && (
              <span className="flex items-center gap-0.5 text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 border border-teal-200">
                <Timer className="w-2.5 h-2.5" />
                {event.duration}
              </span>
            )}
            {event.city && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <MapPin className="w-3 h-3 text-teal-500" />
                {event.city}
              </span>
            )}
            {event.invite_only && (
              <span className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 border border-amber-200">
                <Lock className="w-2.5 h-2.5" />
                Invite Only
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-gray-900 leading-snug mb-1 ${compact ? "text-sm line-clamp-2" : "text-sm sm:text-[15px]"}`}>
            {displayTitle}
          </h3>

          {/* Organizer */}
          <p className="text-xs text-gray-400 mb-2 truncate">
            by {event.organizer}
          </p>

          {/* Description */}
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
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p key="truncated" className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {event.description}
                  </motion.p>
                )}
              </AnimatePresence>
              {event.description!.length > 120 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                  className="flex items-center gap-0.5 text-[11px] text-teal-600 font-medium mt-1 hover:text-teal-700"
                >
                  {expanded ? <>Show less <ChevronUp className="w-3 h-3" /></> : <>Read more <ChevronDown className="w-3 h-3" /></>}
                </button>
              )}
            </div>
          )}

          {/* Attendee + Capacity */}
          {(hasAttendeeData || cap.hasCapacity) && (
            <div className="mb-2.5 space-y-1.5">
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                {event.going > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-teal-500" />
                    <span className="font-semibold text-gray-800">{event.going}</span> going
                  </span>
                )}
                {event.interested > 0 && (
                  <span><span className="font-medium text-gray-700">{event.interested}</span> interested</span>
                )}
                {event.maybe > 0 && (
                  <span><span className="font-medium text-gray-700">{event.maybe}</span> maybe</span>
                )}
              </div>
              {cap.hasCapacity && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cap.isFull ? "bg-red-400" :
                        cap.fillPct >= 80 ? "bg-orange-400" :
                        cap.fillPct >= 50 ? "bg-amber-400" :
                        "bg-teal-400"
                      }`}
                      style={{ width: `${cap.fillPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
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

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: categories + RSVP */}
          <div className="flex items-end justify-between gap-2 mt-auto pt-1">
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {event.categories.slice(0, compact ? 1 : 2).map((cat) => {
                const catColors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["General Tech"];
                const icon = CATEGORY_ICONS[cat] || "\u{1F4A1}";
                return (
                  <span
                    key={cat}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium border ${catColors.bg} ${catColors.text} ${catColors.border}`}
                  >
                    <span className="text-[10px]">{icon}</span>
                    <span className="truncate max-w-[90px] sm:max-w-[130px]">{cat}</span>
                  </span>
                );
              })}
              {event.categories.length > (compact ? 1 : 2) && (
                <span className="text-[10px] text-gray-400 self-center">
                  +{event.categories.length - (compact ? 1 : 2)}
                </span>
              )}
            </div>
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  cap.isFull
                    ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200"
                    : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
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
