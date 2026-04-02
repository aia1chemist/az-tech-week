/*
 * CuratedTracks — Pre-built event bundles / tracks
 * "The AI Track", "The Founder Track", "The Tucson Track", etc.
 * One-click bookmark all events in a track
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Heart, Check, MapPin, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import EventsData from "@/data/events.json";
import type { Event } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const allEvents = EventsData.events as Event[];

interface Track {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  filter: (e: Event) => boolean;
}

const TRACKS: Track[] = [
  {
    id: "ai",
    name: "The AI Track",
    emoji: "🤖",
    description: "Every AI & Machine Learning event across the week",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    filter: (e) => e.categories.some(c => c.includes("AI") || c.includes("Machine Learning")),
  },
  {
    id: "founder",
    name: "The Founder Track",
    emoji: "🚀",
    description: "Startups, entrepreneurship, pitches & VC events",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    filter: (e) => e.categories.some(c => c.includes("Startup") || c.includes("Invest") || c.includes("VC")),
  },
  {
    id: "networking",
    name: "The Networking Track",
    emoji: "🤝",
    description: "Social events, mixers, happy hours & meetups",
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    filter: (e) => e.categories.some(c => c.includes("Networking") || c.includes("Social")),
  },
  {
    id: "tucson",
    name: "The Tucson Track",
    emoji: "🌵",
    description: "All events happening in Tucson",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    filter: (e) => e.city === "Tucson",
  },
  {
    id: "biotech",
    name: "The Health & Bio Track",
    emoji: "🧬",
    description: "Biotech, health tech, diagnostics & community tours",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    filter: (e) => e.categories.some(c => c.includes("Health") || c.includes("Bio")),
  },
  {
    id: "space",
    name: "The Space & Aerospace Track",
    emoji: "🛰️",
    description: "Space tech, aerospace, defense & manufacturing",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    filter: (e) => e.categories.some(c => c.includes("Space") || c.includes("Aerospace") || c.includes("Manufacturing")),
  },
];

function getTrackEvents(track: Track): Event[] {
  return allEvents.filter(track.filter).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.start_time || "").localeCompare(b.start_time || "");
  });
}

function getTrackStats(events: Event[]) {
  const days = new Set(events.map(e => e.date)).size;
  const cities = new Set(events.map(e => e.city).filter(Boolean)).size;
  const totalGoing = events.reduce((sum, e) => sum + (e.going || 0), 0);
  const waitlisted = events.filter(e => e.sold_out || e.spots_left === 0).length;
  return { days, cities, totalGoing, waitlisted };
}

export default function CuratedTracks() {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const { toggle, isBookmarked } = useBookmarks();

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Curated Tracks
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">One-click bookmark a whole track</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TRACKS.map((track) => {
          const events = getTrackEvents(track);
          const stats = getTrackStats(events);
          const bookmarkedCount = events.filter(e => isBookmarked(e.id)).length;
          const allBookmarked = bookmarkedCount === events.length;
          const isExpanded = expandedTrack === track.id;

          return (
            <div key={track.id} className={`rounded-xl border ${track.borderColor} ${track.bgColor} dark:bg-gray-800/50 dark:border-gray-700 overflow-hidden transition-all`}>
              <div className="p-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{track.emoji}</span>
                    <div>
                      <h3 className={`text-sm font-bold ${track.color} dark:text-gray-200`}>{track.name}</h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{track.description}</p>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {events.length} events
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {stats.cities} {stats.cities === 1 ? "city" : "cities"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stats.totalGoing.toLocaleString()} going
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (allBookmarked) {
                        events.forEach(e => { if (isBookmarked(e.id)) toggle(e.id); });
                        toast(`Removed ${events.length} events from schedule`, { icon: "💔", duration: 2000 });
                      } else {
                        events.forEach(e => { if (!isBookmarked(e.id)) toggle(e.id); });
                        toast(`Added ${events.length} events to schedule!`, { icon: "❤️", duration: 2000 });
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      allBookmarked
                        ? "bg-pink-100 text-pink-600 border border-pink-300 hover:bg-pink-200"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-pink-300 hover:text-pink-600"
                    }`}
                  >
                    {allBookmarked ? <Check className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                    {allBookmarked ? "Saved" : bookmarkedCount > 0 ? `${bookmarkedCount}/${events.length} saved` : "Save all"}
                  </button>

                  <button
                    onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    View events
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                </div>

                {/* Waitlist warning */}
                {stats.waitlisted > 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
                    ⚠️ {stats.waitlisted} event{stats.waitlisted > 1 ? "s" : ""} already on waitlist
                  </p>
                )}
              </div>

              {/* Expanded event list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-200/50 dark:border-gray-700 px-3.5 py-2 max-h-60 overflow-y-auto space-y-1">
                      {events.map((event) => {
                        const saved = isBookmarked(event.id);
                        const isFull = event.sold_out || event.spots_left === 0;
                        return (
                          <div key={event.id} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs ${saved ? "bg-pink-50 dark:bg-pink-900/20" : "hover:bg-white/50 dark:hover:bg-gray-700/50"} transition-all`}>
                            <button
                              onClick={() => {
                                toggle(event.id);
                                toast(saved ? "Removed" : "Added to schedule", { icon: saved ? "💔" : "❤️", duration: 1200 });
                              }}
                              className={`flex-shrink-0 ${saved ? "text-pink-500" : "text-gray-300 hover:text-pink-400"}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${saved ? "fill-pink-500" : ""}`} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`truncate font-medium ${isFull ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"}`}>
                                {event.title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").trim()}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                {event.date.slice(5)} · {event.start_time || event.time} · {event.city}
                                {isFull && " · WAITLIST"}
                              </p>
                            </div>
                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-teal-600 hover:text-teal-700 font-medium flex-shrink-0">
                              RSVP →
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
