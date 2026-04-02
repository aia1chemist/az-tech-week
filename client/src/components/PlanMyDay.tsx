/*
 * AZTW Plan My Day Wizard — Pick a day + interests, get an optimized schedule
 * Factors in travel time between cities, avoids overlaps, maximizes variety
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, MapPin, Clock, ChevronRight, Heart, Car, Check, Sparkles, ArrowRight } from "lucide-react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { DAY_SHORT, CATEGORY_ICONS } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

/* Approximate driving time between AZ cities in minutes */
const TRAVEL_TIMES: Record<string, Record<string, number>> = {
  Phoenix: { Phoenix: 0, Scottsdale: 20, Tempe: 15, Mesa: 25, Chandler: 25, Gilbert: 30, Tucson: 110, Flagstaff: 140, Sedona: 120, Peoria: 25, Glendale: 20, Surprise: 35, Goodyear: 30, "Cave Creek": 35, "Paradise Valley": 20, Prescott: 100 },
  Scottsdale: { Phoenix: 20, Scottsdale: 0, Tempe: 15, Mesa: 20, Chandler: 25, Gilbert: 25, Tucson: 120, Flagstaff: 150, Sedona: 130, Peoria: 30, Glendale: 25, "Cave Creek": 20, "Paradise Valley": 10 },
  Tempe: { Phoenix: 15, Scottsdale: 15, Tempe: 0, Mesa: 10, Chandler: 15, Gilbert: 15, Tucson: 105, Flagstaff: 145, Sedona: 125 },
  Mesa: { Phoenix: 25, Scottsdale: 20, Tempe: 10, Mesa: 0, Chandler: 15, Gilbert: 10, Tucson: 100, Flagstaff: 150 },
  Tucson: { Phoenix: 110, Scottsdale: 120, Tempe: 105, Mesa: 100, Tucson: 0, Flagstaff: 260 },
  Chandler: { Phoenix: 25, Scottsdale: 25, Tempe: 15, Mesa: 15, Chandler: 0, Gilbert: 10 },
  Gilbert: { Phoenix: 30, Scottsdale: 25, Tempe: 15, Mesa: 10, Chandler: 10, Gilbert: 0 },
};

function getTravelTime(from: string, to: string): number {
  if (from === to) return 0;
  return TRAVEL_TIMES[from]?.[to] || TRAVEL_TIMES[to]?.[from] || 30; // default 30 min
}

/* Parse time string to minutes from midnight */
function parseTime(time: string): number {
  if (!time) return 0;
  const match = time.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) {
    const match2 = time.match(/(\d{1,2})\s*(am|pm)/i);
    if (!match2) return 0;
    let h = parseInt(match2[1]);
    const ampm = match2[2].toLowerCase();
    if (ampm === "pm" && h !== 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    return h * 60;
  }
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3].toLowerCase();
  if (ampm === "pm" && h !== 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  return h * 60 + m;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/* Score an event for the wizard */
function scoreEvent(event: Event, interests: string[], preferPopular: boolean): number {
  let score = 0;
  // Category match
  const cats = event.categories || [];
  for (const interest of interests) {
    if (cats.some(c => c.toLowerCase().includes(interest.toLowerCase()))) score += 30;
  }
  // Popularity bonus
  if (preferPopular && event.going) score += Math.min(event.going * 0.5, 20);
  // Capacity urgency — nearly full events get a boost
  if (event.capacity > 0 && event.spots_left >= 0) {
    const fillPct = ((event.capacity - event.spots_left) / event.capacity) * 100;
    if (fillPct > 80) score += 15;
    else if (fillPct > 60) score += 8;
  }
  // Penalize waitlisted events
  if (event.sold_out) score -= 20;
  return score;
}

interface PlanMyDayProps {
  open: boolean;
  onClose: () => void;
}

type Step = "day" | "interests" | "prefs" | "result";

const INTEREST_OPTIONS = [
  "AI", "Startups", "Networking", "Web3", "Health Tech", "Space",
  "Cybersecurity", "FinTech", "Marketing", "Gaming", "SaaS", "Venture Capital",
  "Robotics", "Real Estate", "Education", "Government", "Social Impact",
];

export default function PlanMyDay({ open, onClose }: PlanMyDayProps) {
  const { toggle, isBookmarked } = useBookmarks();
  const [step, setStep] = useState<Step>("day");
  const [selectedDay, setSelectedDay] = useState(data.days[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [preferPopular, setPreferPopular] = useState(true);
  const [maxEvents, setMaxEvents] = useState(5);
  const [generatedPlan, setGeneratedPlan] = useState<Array<{ event: Event; travelFrom?: string; travelMinutes?: number; gap?: number }>>([]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const generatePlan = useCallback(() => {
    const dayEvents = data.events
      .filter(e => e.full_date === selectedDay && !e.sold_out)
      .map(e => ({ ...e, startMin: parseTime(e.start_time), endMin: parseTime(e.end_time || "") || (parseTime(e.start_time) + (e.duration_minutes || 60)) }))
      .filter(e => e.startMin > 0)
      .sort((a, b) => a.startMin - b.startMin);

    // Score all events
    const scored = dayEvents.map(e => ({
      event: e,
      score: scoreEvent(e, interests, preferPopular),
      startMin: e.startMin,
      endMin: e.endMin,
      city: e.city || "Phoenix",
    }));

    // Greedy schedule builder — pick highest scored non-overlapping events with travel time
    const plan: Array<{ event: Event; travelFrom?: string; travelMinutes?: number; gap?: number }> = [];
    const used = new Set<number>();

    // Sort by score descending, then by time
    const candidates = [...scored].sort((a, b) => b.score - a.score || a.startMin - b.startMin);

    for (const candidate of candidates) {
      if (plan.length >= maxEvents) break;
      if (used.has(candidate.event.id)) continue;

      // Check if it fits in the schedule
      let fits = true;
      let travelFrom: string | undefined;
      let travelMinutes = 0;
      let gap = 0;

      for (const existing of plan) {
        const existingEnd = (existing.event as any).endMin || ((existing.event as any).startMin + (existing.event.duration_minutes || 60));
        const existingStart = (existing.event as any).startMin;

        // Check overlap including travel time
        const travel = getTravelTime(existing.event.city || "Phoenix", candidate.city);

        if (candidate.startMin < existingEnd + travel && candidate.endMin > existingStart - travel) {
          fits = false;
          break;
        }
      }

      if (fits) {
        // Find the previous event to calculate travel
        const prevEvent = plan.filter(p => (p.event as any).endMin <= candidate.startMin).sort((a, b) => (b.event as any).endMin - (a.event as any).endMin)[0];
        if (prevEvent) {
          travelFrom = prevEvent.event.city || "Phoenix";
          travelMinutes = getTravelTime(travelFrom, candidate.city);
          gap = candidate.startMin - (prevEvent.event as any).endMin - travelMinutes;
        }

        plan.push({ event: candidate.event, travelFrom, travelMinutes, gap });
        used.add(candidate.event.id);
      }
    }

    // Sort plan by start time
    plan.sort((a, b) => parseTime(a.event.start_time) - parseTime(b.event.start_time));

    // Recalculate travel for sorted plan
    for (let i = 1; i < plan.length; i++) {
      const prev = plan[i - 1];
      const curr = plan[i];
      const prevEnd = parseTime(prev.event.end_time || "") || (parseTime(prev.event.start_time) + (prev.event.duration_minutes || 60));
      const currStart = parseTime(curr.event.start_time);
      curr.travelFrom = prev.event.city || "Phoenix";
      curr.travelMinutes = getTravelTime(curr.travelFrom, curr.event.city || "Phoenix");
      curr.gap = currStart - prevEnd - curr.travelMinutes;
    }

    setGeneratedPlan(plan);
    setStep("result");
  }, [selectedDay, interests, preferPopular, maxEvents]);

  const bookmarkAll = () => {
    for (const item of generatedPlan) {
      if (!isBookmarked(item.event.id)) {
        toggle(item.event.id);
      }
    }
  };

  const reset = () => {
    setStep("day");
    setInterests([]);
    setGeneratedPlan([]);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Plan My Day</h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">AI-optimized schedule with travel time</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1 px-5 py-2 flex-shrink-0">
            {(["day", "interests", "prefs", "result"] as Step[]).map((s, i) => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${
                (["day", "interests", "prefs", "result"] as Step[]).indexOf(step) >= i
                  ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"
              }`} />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <AnimatePresence mode="wait">
              {/* Step 1: Pick a day */}
              {step === "day" && (
                <motion.div key="day" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Which day?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Pick the day you want to plan</p>
                  <div className="grid grid-cols-2 gap-2">
                    {data.days.map(day => {
                      const short = DAY_SHORT[day] || day;
                      const count = data.events.filter(e => e.full_date === day).length;
                      const isSelected = selectedDay === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className={`text-sm font-bold ${isSelected ? "text-teal-700 dark:text-teal-300" : "text-gray-900 dark:text-white"}`}>{short}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{count} events</div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setStep("interests")}
                    className="w-full mt-4 py-3 rounded-xl bg-teal-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Pick interests */}
              {step === "interests" && (
                <motion.div key="interests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">What interests you?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Pick topics to prioritize (or skip for a mix of everything)</p>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(interest => {
                      const isSelected = interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            isSelected
                              ? "bg-teal-100 dark:bg-teal-900/30 border-teal-400 text-teal-700 dark:text-teal-300"
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setStep("day")} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                      Back
                    </button>
                    <button
                      onClick={() => setStep("prefs")}
                      className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Preferences */}
              {step === "prefs" && (
                <motion.div key="prefs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Preferences</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Fine-tune your schedule</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">How many events?</label>
                      <div className="flex gap-2">
                        {[3, 4, 5, 6, 7].map(n => (
                          <button
                            key={n}
                            onClick={() => setMaxEvents(n)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                              maxEvents === n
                                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-500"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Prefer popular events</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Prioritize events with more RSVPs</div>
                      </div>
                      <button
                        onClick={() => setPreferPopular(!preferPopular)}
                        className={`w-11 h-6 rounded-full transition-colors ${preferPopular ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${preferPopular ? "translate-x-5.5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button onClick={() => setStep("interests")} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                      Back
                    </button>
                    <button
                      onClick={generatePlan}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold flex items-center justify-center gap-2 hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-200 dark:shadow-teal-900/30"
                    >
                      <Sparkles className="w-4 h-4" /> Generate Plan
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Results */}
              {step === "result" && (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Plan</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{DAY_SHORT[selectedDay]} — {generatedPlan.length} events</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={reset} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Redo
                      </button>
                      <button
                        onClick={bookmarkAll}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3" /> Save All
                      </button>
                    </div>
                  </div>

                  {generatedPlan.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No events found matching your criteria. Try different interests or a different day.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {generatedPlan.map((item, i) => {
                        const e = item.event;
                        const cats = e.categories || [];
                        const icon = cats[0] ? (CATEGORY_ICONS as Record<string, string>)[cats[0]] || "📅" : "📅";

                        return (
                          <div key={e.id}>
                            {/* Travel indicator between events */}
                            {i > 0 && item.travelMinutes !== undefined && item.travelMinutes > 0 && (
                              <div className="flex items-center gap-2 py-2 pl-6">
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                                  <Car className="w-3 h-3" />
                                  <span>{item.travelMinutes} min drive from {item.travelFrom}</span>
                                  {item.gap !== undefined && item.gap > 0 && (
                                    <span className="text-teal-500 font-medium ml-1">({item.gap} min gap)</span>
                                  )}
                                  {item.gap !== undefined && item.gap < 0 && (
                                    <span className="text-red-500 font-medium ml-1">(tight!)</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Event card */}
                            <div className={`p-3 rounded-xl border transition-all ${
                              isBookmarked(e.id)
                                ? "border-teal-300 bg-teal-50/50 dark:bg-teal-900/10 dark:border-teal-700"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className="text-xl flex-shrink-0 mt-0.5">{icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{e.title}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">by {e.organizer}</div>
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {e.start_time}{e.end_time ? ` – ${e.end_time}` : ""}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {e.city}
                                    </span>
                                  </div>
                                  {e.going && e.going > 0 && (
                                    <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">{e.going} going</div>
                                  )}
                                </div>
                                <button
                                  onClick={() => toggle(e.id)}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    isBookmarked(e.id)
                                      ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                      : "text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  }`}
                                >
                                  <Heart className={`w-4 h-4 ${isBookmarked(e.id) ? "fill-current" : ""}`} />
                                </button>
                              </div>
                              {e.link && (
                                <a
                                  href={e.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700"
                                >
                                  RSVP <ArrowRight className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
