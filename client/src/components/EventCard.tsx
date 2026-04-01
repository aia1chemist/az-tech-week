/*
 * Design: Copper Circuit — Warm card with left category-colored accent
 * Rounded containers, soft shadows, earth-tone category pills
 */
import { motion } from "framer-motion";
import { Clock, MapPin, ExternalLink, Lock } from "lucide-react";
import type { Event } from "@/data/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/data/types";

interface EventCardProps {
  event: Event;
  index: number;
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

export default function EventCard({ event, index }: EventCardProps) {
  const primaryCategory = event.categories[0] || "General Tech";
  const accentColor = ACCENT_COLORS[primaryCategory] || "#b87333";
  const displayTitle = cleanTitle(event.title) || event.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.25) }}
    >
      <div className="relative bg-card rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Left accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: accentColor }}
        />

        <div className="pl-4 pr-3 py-3 sm:pl-5 sm:pr-4 sm:py-4">
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
          <h3 className="font-semibold text-sm sm:text-[15px] text-card-foreground leading-snug mb-1 line-clamp-2">
            {displayTitle}
          </h3>

          {/* Organizer */}
          <p className="text-xs text-muted-foreground mb-2.5 truncate">
            by {event.organizer}
          </p>

          {/* Bottom row: categories + RSVP link */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {event.categories.slice(0, 2).map((cat) => {
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
              {event.categories.length > 2 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{event.categories.length - 2}
                </span>
              )}
            </div>

            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 active:scale-95 transition-all"
              >
                RSVP
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
