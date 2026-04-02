/*
 * EventMatchmaker — "Find Your People" quiz
 * 5 quick questions → personalized top-10 event recommendations
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Heart, ArrowRight, Sparkles, MapPin, Clock, Users, RotateCcw } from "lucide-react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { DAY_SHORT, CATEGORY_ICONS } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

interface Question {
  id: string;
  question: string;
  subtitle: string;
  options: Array<{ label: string; emoji: string; value: string }>;
  multiSelect?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: "role",
    question: "What's your role?",
    subtitle: "Helps us match you with the right crowd",
    options: [
      { label: "Founder / CEO", emoji: "🚀", value: "founder" },
      { label: "Engineer / Dev", emoji: "💻", value: "engineer" },
      { label: "Investor / VC", emoji: "💰", value: "investor" },
      { label: "Marketing / Sales", emoji: "📣", value: "marketing" },
      { label: "Student / Career Changer", emoji: "🎓", value: "student" },
      { label: "Just Curious", emoji: "👀", value: "curious" },
    ],
  },
  {
    id: "interests",
    question: "What topics excite you?",
    subtitle: "Pick up to 3",
    multiSelect: true,
    options: [
      { label: "AI & Machine Learning", emoji: "🤖", value: "AI & Machine Learning" },
      { label: "Startups", emoji: "🚀", value: "Startups & Entrepreneurship" },
      { label: "Web3 / Crypto", emoji: "⛓️", value: "Blockchain & Crypto" },
      { label: "Health & Biotech", emoji: "🧬", value: "Health & Biotech" },
      { label: "Space & Aerospace", emoji: "🛰️", value: "Space & Aerospace" },
      { label: "Cybersecurity", emoji: "🔒", value: "Cybersecurity" },
      { label: "FinTech", emoji: "💳", value: "Fintech" },
      { label: "Real Estate", emoji: "🏠", value: "Real Estate" },
    ],
  },
  {
    id: "vibe",
    question: "What's your vibe?",
    subtitle: "What kind of events do you prefer?",
    options: [
      { label: "Deep learning sessions", emoji: "🧠", value: "learning" },
      { label: "Networking & meeting people", emoji: "🤝", value: "networking" },
      { label: "Hands-on demos & tours", emoji: "🔧", value: "demos" },
      { label: "Happy hours & social", emoji: "🍻", value: "social" },
    ],
  },
  {
    id: "size",
    question: "Event size preference?",
    subtitle: "Intimate roundtable or big conference?",
    options: [
      { label: "Small & intimate (< 30)", emoji: "🪑", value: "small" },
      { label: "Medium (30-100)", emoji: "🏢", value: "medium" },
      { label: "Large (100+)", emoji: "🏟️", value: "large" },
      { label: "No preference", emoji: "🤷", value: "any" },
    ],
  },
  {
    id: "location",
    question: "Where are you based?",
    subtitle: "We'll prioritize events near you",
    options: [
      { label: "Phoenix", emoji: "🌵", value: "Phoenix" },
      { label: "Scottsdale", emoji: "⛳", value: "Scottsdale" },
      { label: "Tempe / Mesa", emoji: "🎓", value: "Tempe" },
      { label: "Tucson", emoji: "🏜️", value: "Tucson" },
      { label: "Visiting from out of state", emoji: "✈️", value: "visitor" },
    ],
  },
];

function scoreEvent(event: Event, answers: Record<string, string | string[]>): number {
  let score = 0;

  // Role matching
  const role = answers.role as string;
  if (role === "founder" && event.categories.some(c => c.includes("Startup") || c.includes("Investing"))) score += 25;
  if (role === "engineer" && event.categories.some(c => c.includes("DevOps") || c.includes("AI") || c.includes("Cyber"))) score += 25;
  if (role === "investor" && event.categories.some(c => c.includes("Investing") || c.includes("Fintech") || c.includes("Startup"))) score += 25;
  if (role === "marketing" && event.categories.some(c => c.includes("Marketing") || c.includes("Sales"))) score += 25;
  if (role === "student" && event.categories.some(c => c.includes("Education") || c.includes("General"))) score += 20;

  // Interest matching
  const interests = (answers.interests as string[]) || [];
  for (const interest of interests) {
    if (event.categories.some(c => c.includes(interest) || interest.includes(c))) score += 30;
  }

  // Vibe matching
  const vibe = answers.vibe as string;
  if (vibe === "networking" && event.categories.some(c => c.includes("Networking"))) score += 20;
  if (vibe === "learning" && event.categories.some(c => c.includes("AI") || c.includes("Data") || c.includes("Cyber"))) score += 15;
  if (vibe === "demos" && event.categories.some(c => c.includes("Tours") || c.includes("Manufacturing"))) score += 20;
  if (vibe === "social" && event.time_of_day === "Evening") score += 20;

  // Size preference
  const size = answers.size as string;
  if (size === "small" && event.capacity > 0 && event.capacity <= 30) score += 15;
  if (size === "medium" && event.capacity > 30 && event.capacity <= 100) score += 15;
  if (size === "large" && event.capacity > 100) score += 15;

  // Location matching
  const location = answers.location as string;
  if (location !== "visitor") {
    const nearCities: Record<string, string[]> = {
      Phoenix: ["Phoenix", "Scottsdale", "Tempe", "Mesa", "Chandler", "Gilbert", "Glendale", "Peoria"],
      Scottsdale: ["Scottsdale", "Phoenix", "Tempe", "Paradise Valley", "Cave Creek"],
      Tempe: ["Tempe", "Mesa", "Phoenix", "Scottsdale", "Chandler", "Gilbert"],
      Tucson: ["Tucson"],
    };
    const near = nearCities[location] || [];
    if (near.includes(event.city || "")) score += 15;
  }

  // Popularity bonus
  if (event.going > 50) score += 10;
  if (event.going > 100) score += 5;

  // Penalize sold out
  if (event.sold_out) score -= 30;

  return score;
}

interface EventMatchmakerProps {
  open: boolean;
  onClose: () => void;
}

export default function EventMatchmaker({ open, onClose }: EventMatchmakerProps) {
  const { toggle, isBookmarked } = useBookmarks();
  const [step, setStep] = useState(0); // 0-4 = questions, 5 = results
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelections, setMultiSelections] = useState<string[]>([]);

  const currentQ = step < QUESTIONS.length ? QUESTIONS[step] : null;

  const handleSelect = (value: string) => {
    if (currentQ?.multiSelect) {
      setMultiSelections(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : prev.length < 3 ? [...prev, value] : prev
      );
    } else {
      const newAnswers = { ...answers, [currentQ!.id]: value };
      setAnswers(newAnswers);
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        setStep(QUESTIONS.length);
      }
    }
  };

  const handleMultiNext = () => {
    if (currentQ?.multiSelect && multiSelections.length > 0) {
      const newAnswers = { ...answers, [currentQ.id]: multiSelections };
      setAnswers(newAnswers);
      setMultiSelections([]);
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        setStep(QUESTIONS.length);
      }
    }
  };

  const results = useMemo(() => {
    if (step < QUESTIONS.length) return [];
    return data.events
      .map(e => ({ event: e, score: scoreEvent(e, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(r => r.event);
  }, [step, answers]);

  const reset = () => {
    setStep(0);
    setAnswers({});
    setMultiSelections([]);
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
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Find Your People</h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">5 questions → your perfect events</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex gap-1 px-5 py-2 flex-shrink-0">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                step > i ? "bg-violet-500" : step === i ? "bg-violet-300" : "bg-gray-200 dark:bg-gray-700"
              }`} />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <AnimatePresence mode="wait">
              {currentQ && step < QUESTIONS.length && (
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{currentQ.question}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{currentQ.subtitle}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {currentQ.options.map(opt => {
                      const isSelected = currentQ.multiSelect
                        ? multiSelections.includes(opt.value)
                        : answers[currentQ.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(opt.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-lg">{opt.emoji}</span>
                          <div className={`text-sm font-medium mt-1 ${isSelected ? "text-violet-700 dark:text-violet-300" : "text-gray-700 dark:text-gray-300"}`}>
                            {opt.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {currentQ.multiSelect && (
                    <button
                      onClick={handleMultiNext}
                      disabled={multiSelections.length === 0}
                      className={`w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        multiSelections.length > 0
                          ? "bg-violet-600 text-white hover:bg-violet-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Next ({multiSelections.length}/3) <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}

              {step >= QUESTIONS.length && (
                <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Top 10 Matches</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Personalized just for you</p>
                    </div>
                    <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RotateCcw className="w-3 h-3" /> Retake
                    </button>
                  </div>
                  <div className="space-y-2">
                    {results.map((e, i) => {
                      const icon = e.categories[0] ? (CATEGORY_ICONS as Record<string, string>)[e.categories[0]] || "📅" : "📅";
                      const saved = isBookmarked(e.id);
                      return (
                        <div key={e.id} className={`p-3 rounded-xl border transition-all ${
                          saved ? "border-violet-300 bg-violet-50/50 dark:bg-violet-900/10 dark:border-violet-700" : "border-gray-200 dark:border-gray-700"
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-xs font-bold text-violet-500">#{i + 1}</span>
                              <span className="text-lg">{icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {e.title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").trim()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">by {e.organizer}</div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{DAY_SHORT[e.full_date]} · {e.start_time}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.city}</span>
                                {e.going > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{e.going}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => toggle(e.id)}
                              className={`p-1.5 rounded-full transition-colors ${
                                saved ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-300 hover:text-red-400"
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                            </button>
                          </div>
                          {e.link && (
                            <a href={e.link} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700">
                              RSVP <ArrowRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
