/*
 * AZTW EventCard — Clean, scannable card
 * Primary actions visible: Heart (bookmark) + Share
 * Secondary actions (Google Cal, QR, Reactions, Ride) appear only when expanded
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ExternalLink, Lock, Users, Flame, Timer, ChevronDown, ChevronUp, Heart, Share2, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/data/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";
import RideButton from "./RideButton";
import EventReactions from "./EventReactions";

interface EventCardProps {
  event: Event;
  index: number;
  compact?: boolean;
  isNow?: boolean;
  onShowQR?: (event: Event) => void;
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
  const isDontMiss = !isFull && hasCapacity && hasSpots && fillPct >= 70 && event.spots_left > 0;
  return { isFull, hasCapacity, hasSpots, fillPct, isFillingUp, isAlmostFull, isDontMiss };
}

function getNetworkingScore(event: Event): number {
  let score = 0;
  const networkCats = ["Networking & Social", "Startups & Entrepreneurship", "Investing & VC"];
  if (event.categories.some((c) => networkCats.includes(c))) score += 35;
  if (event.going >= 20) score += 25;
  else if (event.going >= 10) score += 15;
  else if (event.going > 0) score += 8;
  if (event.capacity > 0 && event.capacity <= 50) score += 15;
  else if (event.capacity > 50 && event.capacity <= 150) score += 10;
  if (event.categories.length >= 2) score += 10;
  if (event.time_of_day === "Evening") score += 5;
  return Math.min(score, 100);
}

function handleShare(event: Event) {
  const title = cleanTitle(event.title);
  const text = `Check out "${title}" at AZ Tech Week!\n${event.start_time || event.time} · ${event.city}\n${event.link}`;
  if (navigator.share) {
    navigator.share({ title: `AZ Tech Week: ${title}`, text, url: event.link }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Event link copied!");
    }).catch(() => {
      toast.error("Could not copy link");
    });
  }
}

function addToGoogleCal(event: Event) {
  const title = encodeURIComponent(cleanTitle(event.title));
  const details = encodeURIComponent(`${event.organizer ? "Hosted by " + event.organizer + "\n" : ""}${event.link || ""}`);
  const location = encodeURIComponent(event.city || "Phoenix, AZ");
  const dateStr = event.date.replace(/-/g, "");
  const timeStr = (event.start_time || "09:00 am").replace(/[^0-9apm:]/gi, "");
  let [hm, ampm] = timeStr.split(/(am|pm)/i);
  let [h, m] = (hm || "9:00").split(":").map(Number);
  if (ampm?.toLowerCase() === "pm" && h < 12) h += 12;
  if (ampm?.toLowerCase() === "am" && h === 12) h = 0;
  const startDT = `${dateStr}T${String(h).padStart(2, "0")}${String(m || 0).padStart(2, "0")}00`;
  const endH = h + 2;
  const endDT = `${dateStr}T${String(endH).padStart(2, "0")}${String(m || 0).padStart(2, "0")}00`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDT}/${endDT}&details=${details}&location=${location}`;
  window.open(url, "_blank");
}

export default function EventCard({ event, index, compact, isNow, onShowQR }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { toggle, isBookmarked } = useBookmarks();
  const saved = isBookmarked(event.id);
  const primaryCategory = event.categories[0] || "General Tech";
  const accentColor = ACCENT_COLORS[primaryCategory] || "#14b8a6";
  const displayTitle = cleanTitle(event.title) || event.title;
  const cap = getCapacityInfo(event);
  const hasAttendeeData = event.going > 0 || event.interested > 0;
  const hasDescription = event.description && event.description.length > 0;
  const hasDuration = event.duration && event.duration.length > 0;
  const hasEndTime = event.end_time && event.end_time.length > 0;
  const netScore = getNetworkingScore(event);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.25) }}
      className="h-full"
    >
      <div className={`relative h-full bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${
        isNow ? "border-green-400 ring-2 ring-green-200" : saved ? "border-pink-300 ring-1 ring-pink-100" : "border-gray-200 dark:border-gray-700 hover:border-teal-300"
      } ${cap.isFull ? "opacity-75" : ""}`}>
        {/* Left accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: accentColor }}
        />

        {/* NOW indicator */}
        {isNow && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 border border-green-300 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
            <span className="text-[9px] font-bold text-green-700 uppercase">Live Now</span>
          </div>
        )}

        {/* Event cover image */}
        {event.image_url && !compact && (
          <div className="h-28 sm:h-32 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={event.image_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        <div className={`pl-4 pr-3 py-3 sm:pl-5 sm:pr-4 sm:py-4 flex flex-col flex-1 ${event.image_url && !compact ? 'pt-2 sm:pt-3' : ''}`}>
          {/* Top row: status badges + 2 action buttons (share + heart) */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex gap-1.5 flex-wrap flex-1">
              {cap.isFull && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
                  WAITLIST
                </span>
              )}
              {cap.isDontMiss && !cap.isFillingUp && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                  <Flame className="w-2.5 h-2.5" />
                  Only {event.spots_left} spots left!
                </span>
              )}
              {cap.isFillingUp && !cap.isFull && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-300 animate-pulse">
                  <Flame className="w-2.5 h-2.5" />
                  {event.spots_left} SPOTS LEFT
                </span>
              )}
              {netScore >= 70 && !compact && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-violet-50 text-violet-600 border border-violet-200">
                  <Zap className="w-2.5 h-2.5" />
                  High Networking
                </span>
              )}
            </div>

            {/* Only 2 action buttons: Share + Heart */}
            {!isNow && (
              <div className="flex items-center gap-0 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(event); }}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-all"
                  aria-label="Share event"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggle(event.id);
                    toast(saved ? "Removed from schedule" : "Added to schedule", {
                      icon: saved ? "💔" : "❤️",
                      duration: 1500,
                    });
                  }}
                  className={`p-1 rounded-full transition-all ${
                    saved ? "text-pink-500 hover:bg-pink-50" : "text-gray-300 hover:text-pink-400 hover:bg-pink-50"
                  }`}
                  aria-label={saved ? "Remove from schedule" : "Add to schedule"}
                >
                  <Heart className={`w-4 h-4 transition-all ${saved ? "fill-pink-500" : ""}`} />
                </button>
              </div>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex-wrap">
            <span className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3 text-teal-500" />
              {event.start_time || event.time}
              {hasEndTime && <span className="text-gray-400"> – {event.end_time}</span>}
            </span>
            {hasDuration && (
              <span className="flex items-center gap-0.5 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 px-1.5 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 border border-teal-200 dark:border-teal-700">
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
          <h3 className={`font-semibold text-gray-900 dark:text-white leading-snug mb-1 ${compact ? "text-sm line-clamp-2" : "text-sm sm:text-[15px]"}`}>
            {displayTitle}
          </h3>

          {/* Organizer */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 truncate">
            by {event.organizer}
          </p>

          {/* Description — expandable, secondary actions appear when expanded */}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                    {/* Secondary actions — only visible when expanded */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToGoogleCal(event); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all border border-gray-200 dark:border-gray-600"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        Add to Calendar
                      </button>
                      {onShowQR && (
                        <button
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onShowQR(event); }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all border border-gray-200 dark:border-gray-600"
                        >
                          QR Code
                        </button>
                      )}
                      {event.city && <RideButton city={event.city} compact />}
                    </div>
                    {/* Reactions */}
                    <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-700">
                      <EventReactions eventId={event.id} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.p key="truncated" className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                    {event.description}
                  </motion.p>
                )}
              </AnimatePresence>
              {event.description!.length > 120 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                  className="flex items-center gap-0.5 text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 hover:text-teal-700"
                >
                  {expanded ? <>Show less <ChevronUp className="w-3 h-3" /></> : <>Read more <ChevronDown className="w-3 h-3" /></>}
                </button>
              )}
            </div>
          )}

          {/* Attendee + Capacity */}
          {(hasAttendeeData || cap.hasCapacity) && (
            <div className="mb-2 space-y-1.5">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {event.going > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-teal-500" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{event.going}</span> going
                  </span>
                )}
                {event.interested > 0 && (
                  <span><span className="font-medium text-gray-700 dark:text-gray-300">{event.interested}</span> interested</span>
                )}
                {event.maybe > 0 && (
                  <span><span className="font-medium text-gray-700 dark:text-gray-300">{event.maybe}</span> maybe</span>
                )}
              </div>
              {cap.hasCapacity && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
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
            <div className="flex items-center gap-1 flex-shrink-0">
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
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
      </div>
    </motion.div>
  );
}
