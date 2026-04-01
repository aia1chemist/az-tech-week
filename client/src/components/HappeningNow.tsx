/*
 * What's Happening NOW — Shows currently in-progress events with live pulse
 * Also includes event comparison mode for overlapping events
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Clock, MapPin, Users, ExternalLink, X, Heart, Flame, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { CATEGORY_ICONS, DAY_SHORT } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

function cleanTitle(title: string): string {
  return title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").replace(/\s*#AZTECHWEEK/gi, "").replace(/\s+/g, " ").trim();
}

function parseTimeToMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toLowerCase();
  if (ampm === "pm" && hours !== 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/* Get events happening right now based on current time */
function getHappeningNow(currentDay: string, currentMinutes: number): Event[] {
  return (data.events as Event[]).filter((e) => {
    if (e.full_date !== currentDay) return false;
    const start = parseTimeToMinutes(e.start_time || e.time);
    const end = e.end_time
      ? parseTimeToMinutes(e.end_time)
      : e.duration_minutes > 0
        ? start + e.duration_minutes
        : start + 60; // default 1 hour
    return currentMinutes >= start && currentMinutes < end;
  });
}

/* Get events starting in the next N minutes */
function getUpcoming(currentDay: string, currentMinutes: number, withinMinutes: number = 60): Event[] {
  return (data.events as Event[]).filter((e) => {
    if (e.full_date !== currentDay) return false;
    const start = parseTimeToMinutes(e.start_time || e.time);
    return start > currentMinutes && start <= currentMinutes + withinMinutes;
  }).sort((a, b) => parseTimeToMinutes(a.start_time || a.time) - parseTimeToMinutes(b.start_time || b.time));
}

interface HappeningNowProps {
  open: boolean;
  onClose: () => void;
}

export default function HappeningNow({ open, onClose }: HappeningNowProps) {
  const { toggle, isBookmarked } = useBookmarks();
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);

  // Use current time — during the actual event week this will show live data
  // For demo/preview, we simulate a time during the event
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = currentHour * 60 + now.getMinutes();

  // Determine current day based on actual date
  const dateToDay: Record<number, string> = {
    6: "Monday, April 6",
    7: "Tuesday, April 7",
    8: "Wednesday, April 8",
    9: "Thursday, April 9",
    10: "Friday, April 10",
    11: "Saturday, April 11",
    12: "Sunday, April 12",
  };
  const currentDate = now.getDate();
  const currentMonth = now.getMonth(); // 0-indexed, April = 3
  const currentDay = currentMonth === 3 ? dateToDay[currentDate] || "" : "";
  const isDuringEvent = currentDay !== "";

  // For demo: show events from Monday morning if not during event week
  const demoDay = "Monday, April 6";
  const demoMinutes = 10 * 60 + 30; // 10:30am

  const activeDay = isDuringEvent ? currentDay : demoDay;
  const activeMinutes = isDuringEvent ? currentMinutes : demoMinutes;

  const happeningNow = useMemo(() => getHappeningNow(activeDay, activeMinutes), [activeDay, activeMinutes]);
  const upcoming = useMemo(() => getUpcoming(activeDay, activeMinutes, 90), [activeDay, activeMinutes]);

  const compareEvents = useMemo(() => {
    return (data.events as Event[]).filter((e) => compareIds.includes(e.id));
  }, [compareIds]);

  const toggleCompare = (id: number) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-white rounded-t-2xl shadow-2xl flex flex-col"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center relative">
                  <Radio className="w-4 h-4 text-green-600" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse-dot border border-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {isDuringEvent ? "Happening Now" : "Live Preview"}
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    {isDuringEvent
                      ? `${happeningNow.length} events in progress`
                      : `Simulating ${DAY_SHORT[demoDay]} at 10:30am`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    compareMode ? "bg-violet-100 text-violet-700 border border-violet-300" : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  Compare
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isDuringEvent && (
              <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[11px] text-amber-700">
                  AZ Tech Week hasn't started yet! This is a preview of what the live view will look like during the event (April 6-12). Events shown are from Monday morning.
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* Compare mode */}
              {compareMode && compareIds.length >= 2 && (
                <div className="mb-4 p-3 rounded-lg bg-violet-50 border border-violet-200">
                  <h3 className="text-xs font-bold text-violet-700 mb-2 flex items-center gap-1">
                    <ArrowLeftRight className="w-3.5 h-3.5" /> Comparing {compareIds.length} Events
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {compareEvents.map((e) => (
                      <div key={e.id} className="p-2 rounded-lg bg-white border border-violet-200 text-center">
                        <p className="text-[11px] font-semibold text-gray-900 line-clamp-2 mb-1">{cleanTitle(e.title)}</p>
                        <p className="text-[10px] text-gray-500">{e.start_time || e.time}</p>
                        <p className="text-[10px] text-gray-500">{e.city}</p>
                        {e.going > 0 && <p className="text-[10px] text-teal-600 font-medium mt-1">{e.going} going</p>}
                        {e.capacity > 0 && <p className="text-[9px] text-gray-400">{e.spots_left > 0 ? `${e.spots_left} spots left` : "Full"}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Happening Now */}
              {happeningNow.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
                    In Progress ({happeningNow.length})
                  </h3>
                  <div className="space-y-2">
                    {happeningNow.map((event) => {
                      const icon = CATEGORY_ICONS[event.categories[0]] || "\u{1F4A1}";
                      const saved = isBookmarked(event.id);
                      const isComparing = compareIds.includes(event.id);
                      return (
                        <div
                          key={event.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isComparing ? "border-violet-300 bg-violet-50" : "border-green-200 bg-green-50/50 hover:border-green-300"
                          }`}
                        >
                          <span className="text-lg flex-shrink-0">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{cleanTitle(event.title)}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                              <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {event.start_time || event.time}{event.end_time && ` – ${event.end_time}`}</span>
                              <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {event.city}</span>
                            </div>
                            {event.going > 0 && (
                              <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5 mt-0.5">
                                <Users className="w-2.5 h-2.5" /> {event.going} going
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {compareMode && (
                              <button
                                onClick={() => toggleCompare(event.id)}
                                className={`p-1.5 rounded-full transition-all ${isComparing ? "bg-violet-200 text-violet-700" : "text-gray-400 hover:text-violet-500"}`}
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => { toggle(event.id); toast(saved ? "Removed" : "Added to My Schedule", { icon: saved ? "💔" : "❤️", duration: 1500 }); }}
                              className={`p-1.5 rounded-full transition-all ${saved ? "text-pink-500" : "text-gray-300 hover:text-pink-400"}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${saved ? "fill-pink-500" : ""}`} />
                            </button>
                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full text-teal-600 hover:bg-teal-50">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Coming Up */}
              {upcoming.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Starting Soon ({upcoming.length})
                  </h3>
                  <div className="space-y-2">
                    {upcoming.map((event) => {
                      const icon = CATEGORY_ICONS[event.categories[0]] || "\u{1F4A1}";
                      const saved = isBookmarked(event.id);
                      const startMin = parseTimeToMinutes(event.start_time || event.time);
                      const minsUntil = startMin - activeMinutes;
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-amber-300 transition-all"
                        >
                          <span className="text-lg flex-shrink-0">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{cleanTitle(event.title)}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                              <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {event.start_time || event.time}</span>
                              <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {event.city}</span>
                              <span className="font-medium text-amber-600">in {minsUntil}min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => { toggle(event.id); toast(saved ? "Removed" : "Added to My Schedule", { icon: saved ? "💔" : "❤️", duration: 1500 }); }}
                              className={`p-1.5 rounded-full transition-all ${saved ? "text-pink-500" : "text-gray-300 hover:text-pink-400"}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${saved ? "fill-pink-500" : ""}`} />
                            </button>
                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full text-teal-600 hover:bg-teal-50">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {happeningNow.length === 0 && upcoming.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Radio className="w-12 h-12 text-gray-200 mb-3" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No events right now</h3>
                  <p className="text-xs text-gray-500 max-w-xs">
                    {isDuringEvent
                      ? "Check back later — events run throughout the day!"
                      : "This view will light up during AZ Tech Week (April 6-12)."
                    }
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
