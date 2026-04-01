/*
 * My Schedule — Bottom drawer showing bookmarked events as a timeline
 * Features: conflict detection, .ics export, smart recommendations, day planner view
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, X, Calendar, Download, AlertTriangle, Sparkles,
  Clock, MapPin, ExternalLink, Trash2, ChevronDown, ChevronRight, Zap
} from "lucide-react";
import { toast } from "sonner";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { DAY_SHORT, CATEGORY_ICONS } from "@/data/types";
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

/* Detect conflicts between bookmarked events */
interface Conflict {
  eventA: Event;
  eventB: Event;
  overlapMinutes: number;
}

function detectConflicts(events: Event[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const withTimes = events.filter((e) => e.start_time).map((e) => ({
    event: e,
    start: parseTimeToMinutes(e.start_time || e.time),
    end: e.end_time ? parseTimeToMinutes(e.end_time) : (e.duration_minutes > 0 ? parseTimeToMinutes(e.start_time || e.time) + e.duration_minutes : parseTimeToMinutes(e.start_time || e.time) + 60),
  }));

  for (let i = 0; i < withTimes.length; i++) {
    for (let j = i + 1; j < withTimes.length; j++) {
      const a = withTimes[i];
      const b = withTimes[j];
      if (a.event.full_date !== b.event.full_date) continue;
      const overlapStart = Math.max(a.start, b.start);
      const overlapEnd = Math.min(a.end, b.end);
      if (overlapStart < overlapEnd) {
        conflicts.push({ eventA: a.event, eventB: b.event, overlapMinutes: overlapEnd - overlapStart });
      }
    }
  }
  return conflicts;
}

/* Generate .ics calendar file */
function generateICS(events: Event[]): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateMap: Record<string, string> = {
    "Monday, April 6": "20260406",
    "Tuesday, April 7": "20260407",
    "Wednesday, April 8": "20260408",
    "Thursday, April 9": "20260409",
    "Friday, April 10": "20260410",
    "Saturday, April 11": "20260411",
    "Sunday, April 12": "20260412",
  };

  let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AZ Tech Week//Calendar//EN\r\nCALSCALE:GREGORIAN\r\n";

  for (const e of events) {
    const dateStr = dateMap[e.full_date] || "20260406";
    const startMin = parseTimeToMinutes(e.start_time || e.time);
    const endMin = e.end_time ? parseTimeToMinutes(e.end_time) : (e.duration_minutes > 0 ? startMin + e.duration_minutes : startMin + 60);
    const startH = Math.floor(startMin / 60);
    const startM = startMin % 60;
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    const title = cleanTitle(e.title);

    ics += "BEGIN:VEVENT\r\n";
    ics += `DTSTART;TZID=America/Phoenix:${dateStr}T${pad(startH)}${pad(startM)}00\r\n`;
    ics += `DTEND;TZID=America/Phoenix:${dateStr}T${pad(endH)}${pad(endM)}00\r\n`;
    ics += `SUMMARY:${title}\r\n`;
    ics += `DESCRIPTION:${e.organizer} | ${e.city}\\n${e.link}\r\n`;
    ics += `URL:${e.link}\r\n`;
    ics += `LOCATION:${e.city}\r\n`;
    ics += `UID:aztw-${e.id}@aztechweek.manus.space\r\n`;
    ics += "END:VEVENT\r\n";
  }

  ics += "END:VCALENDAR\r\n";
  return ics;
}

function downloadICS(events: Event[]) {
  const ics = generateICS(events);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "az-tech-week-schedule.ics";
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Calendar file downloaded! Import into Google Calendar or Apple Calendar.");
}

/* Smart recommendations based on bookmarked categories/cities/times */
function getRecommendations(bookmarked: Event[], allEvents: Event[]): Event[] {
  if (bookmarked.length === 0) return [];
  const bookIds = new Set(bookmarked.map((e) => e.id));
  const catCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};
  bookmarked.forEach((e) => {
    e.categories.forEach((c) => { catCounts[c] = (catCounts[c] || 0) + 1; });
    if (e.city) cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
  });

  const scored = allEvents
    .filter((e) => !bookIds.has(e.id))
    .map((e) => {
      let score = 0;
      e.categories.forEach((c) => { score += (catCounts[c] || 0) * 3; });
      score += (cityCounts[e.city] || 0) * 2;
      if (e.going > 15) score += 2;
      if (e.spots_left > 0 && e.spots_left <= 10) score += 3;
      return { event: e, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 6).map((s) => s.event);
}

interface MyScheduleProps {
  open: boolean;
  onClose: () => void;
}

export default function MySchedule({ open, onClose }: MyScheduleProps) {
  const { bookmarkedIds, toggle, count, clear } = useBookmarks();
  const [activeTab, setActiveTab] = useState<"schedule" | "recommendations">("schedule");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const bookmarkedEvents = useMemo(() => {
    return (data.events as Event[])
      .filter((e) => bookmarkedIds.has(e.id))
      .sort((a, b) => {
        const dayDiff = data.days.indexOf(a.full_date) - data.days.indexOf(b.full_date);
        if (dayDiff !== 0) return dayDiff;
        return parseTimeToMinutes(a.start_time || a.time) - parseTimeToMinutes(b.start_time || b.time);
      });
  }, [bookmarkedIds]);

  const groupedByDay = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    bookmarkedEvents.forEach((e) => {
      if (!groups[e.full_date]) groups[e.full_date] = [];
      groups[e.full_date].push(e);
    });
    return groups;
  }, [bookmarkedEvents]);

  const conflicts = useMemo(() => detectConflicts(bookmarkedEvents), [bookmarkedEvents]);
  const recommendations = useMemo(() => getRecommendations(bookmarkedEvents, data.events as Event[]), [bookmarkedEvents]);

  const conflictIds = useMemo(() => {
    const ids = new Set<number>();
    conflicts.forEach((c) => { ids.add(c.eventA.id); ids.add(c.eventB.id); });
    return ids;
  }, [conflicts]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-white rounded-t-2xl shadow-2xl flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">My Schedule</h2>
                  <p className="text-[10px] text-gray-500">{count} event{count !== 1 ? "s" : ""} saved</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {count > 0 && (
                  <>
                    <button
                      onClick={() => downloadICS(bookmarkedEvents)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-medium hover:bg-teal-100 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      Export .ics
                    </button>
                    <button
                      onClick={() => { clear(); toast("Schedule cleared"); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                      aria-label="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("schedule")}
                className={`flex-1 py-2.5 text-xs font-semibold text-center transition-all ${
                  activeTab === "schedule" ? "text-teal-700 border-b-2 border-teal-500" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Schedule {conflicts.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px]">{conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}</span>}
              </button>
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`flex-1 py-2.5 text-xs font-semibold text-center transition-all ${
                  activeTab === "recommendations" ? "text-teal-700 border-b-2 border-teal-500" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                For You ({recommendations.length})
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {activeTab === "schedule" ? (
                count === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Heart className="w-12 h-12 text-gray-200 mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No events saved yet</h3>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Tap the heart icon on any event card to add it to your personal schedule.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Conflict warnings */}
                    {conflicts.length > 0 && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-xs font-bold text-red-700">
                            {conflicts.length} Time Conflict{conflicts.length !== 1 ? "s" : ""} Detected
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {conflicts.map((c, i) => (
                            <div key={i} className="text-[11px] text-red-600">
                              <span className="font-medium">{cleanTitle(c.eventA.title).slice(0, 30)}...</span>
                              {" "}overlaps with{" "}
                              <span className="font-medium">{cleanTitle(c.eventB.title).slice(0, 30)}...</span>
                              <span className="text-red-400 ml-1">({c.overlapMinutes}min)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Day groups with timeline */}
                    {data.days.filter((d) => groupedByDay[d]).map((day) => {
                      const events = groupedByDay[day];
                      const isExpanded = expandedDay === null || expandedDay === day;
                      const short = DAY_SHORT[day] || day;

                      return (
                        <div key={day} className="rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                            className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-all"
                          >
                            <Calendar className="w-3.5 h-3.5 text-teal-500" />
                            <span className="text-xs font-bold text-gray-900 flex-1 text-left">{short}</span>
                            <span className="text-[10px] text-gray-500">{events.length} event{events.length !== 1 ? "s" : ""}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="relative pl-6 pr-3 py-2">
                                  {/* Timeline line */}
                                  <div className="absolute left-4 top-0 bottom-0 w-px bg-teal-200" />

                                  {events.map((event) => {
                                    const hasConflict = conflictIds.has(event.id);
                                    return (
                                      <div key={event.id} className="relative flex items-start gap-3 py-2">
                                        {/* Timeline dot */}
                                        <div className={`absolute -left-2 top-3 w-2.5 h-2.5 rounded-full border-2 ${
                                          hasConflict ? "bg-red-400 border-red-300" : "bg-teal-400 border-teal-300"
                                        }`} />

                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[11px] font-mono text-teal-600 font-medium">
                                              {event.start_time || event.time}
                                            </span>
                                            {event.end_time && (
                                              <span className="text-[10px] text-gray-400">– {event.end_time}</span>
                                            )}
                                            {hasConflict && (
                                              <AlertTriangle className="w-3 h-3 text-red-500" />
                                            )}
                                          </div>
                                          <p className="text-xs font-semibold text-gray-900 truncate">
                                            {cleanTitle(event.title)}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                              <MapPin className="w-2.5 h-2.5" /> {event.city}
                                            </span>
                                            {event.going > 0 && (
                                              <span className="text-[10px] text-gray-400">{event.going} going</span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <a
                                            href={event.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded text-teal-600 hover:bg-teal-50"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                          <button
                                            onClick={() => { toggle(event.id); toast("Removed from schedule", { icon: "💔", duration: 1500 }); }}
                                            className="p-1 rounded text-pink-500 hover:bg-pink-50"
                                          >
                                            <Heart className="w-3.5 h-3.5 fill-pink-500" />
                                          </button>
                                        </div>
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
                )
              ) : (
                /* Recommendations tab */
                recommendations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="w-12 h-12 text-gray-200 mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Save events to get recommendations</h3>
                    <p className="text-xs text-gray-500 max-w-xs">
                      We'll suggest events based on your interests, preferred cities, and categories.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500 mb-2">
                      Based on your saved events, you might also like:
                    </p>
                    {recommendations.map((event) => {
                      const icon = CATEGORY_ICONS[event.categories[0]] || "\u{1F4A1}";
                      return (
                        <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:border-teal-300 transition-all">
                          <span className="text-lg flex-shrink-0">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{cleanTitle(event.title)}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                              <span>{DAY_SHORT[event.full_date]}</span>
                              <span>{event.start_time || event.time}</span>
                              <span>{event.city}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => { toggle(event.id); toast("Added to My Schedule", { icon: "❤️", duration: 1500 }); }}
                            className="p-1.5 rounded-full text-gray-300 hover:text-pink-500 hover:bg-pink-50 transition-all"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
