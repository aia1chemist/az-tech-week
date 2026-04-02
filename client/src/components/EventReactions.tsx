/*
 * Event Reactions — Quick emoji reactions (fire, clap, mind-blown) stored in localStorage
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { emoji: "🔥", label: "fire" },
  { emoji: "👏", label: "clap" },
  { emoji: "🤯", label: "mind-blown" },
  { emoji: "💡", label: "insightful" },
] as const;

type ReactionLabel = (typeof REACTIONS)[number]["label"];

const STORAGE_KEY = "aztw-reactions";

function loadReactions(): Record<string, Record<ReactionLabel, number>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveReactions(data: Record<string, Record<ReactionLabel, number>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Track which reactions the user has given
const USER_REACTIONS_KEY = "aztw-my-reactions";

function loadUserReactions(): Record<string, ReactionLabel[]> {
  try {
    const raw = localStorage.getItem(USER_REACTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveUserReactions(data: Record<string, ReactionLabel[]>) {
  localStorage.setItem(USER_REACTIONS_KEY, JSON.stringify(data));
}

interface EventReactionsProps {
  eventId: number;
}

export default function EventReactions({ eventId }: EventReactionsProps) {
  const [reactions, setReactions] = useState<Record<ReactionLabel, number>>(() => {
    const all = loadReactions();
    return all[eventId] || { fire: 0, clap: 0, "mind-blown": 0, insightful: 0 };
  });
  const [myReactions, setMyReactions] = useState<ReactionLabel[]>(() => {
    const all = loadUserReactions();
    return all[eventId] || [];
  });
  const [showBurst, setShowBurst] = useState<string | null>(null);

  const handleReaction = useCallback((label: ReactionLabel) => {
    const hasReacted = myReactions.includes(label);

    setReactions((prev) => {
      const next = { ...prev, [label]: hasReacted ? Math.max(0, prev[label] - 1) : prev[label] + 1 };
      const all = loadReactions();
      all[eventId] = next;
      saveReactions(all);
      return next;
    });

    setMyReactions((prev) => {
      const next = hasReacted ? prev.filter((r) => r !== label) : [...prev, label];
      const all = loadUserReactions();
      all[eventId] = next;
      saveUserReactions(all);
      return next;
    });

    if (!hasReacted) {
      setShowBurst(label);
      setTimeout(() => setShowBurst(null), 600);
    }
  }, [eventId, myReactions]);

  const totalReactions = Object.values(reactions).reduce((s, v) => s + v, 0);

  return (
    <div className="flex items-center gap-0.5">
      {REACTIONS.map(({ emoji, label }) => {
        const count = reactions[label];
        const isActive = myReactions.includes(label);
        return (
          <button
            key={label}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleReaction(label); }}
            className={`relative flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-all ${
              isActive
                ? "bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent"
            }`}
            title={label}
          >
            <span className="text-xs">{emoji}</span>
            {count > 0 && (
              <span className={`text-[9px] font-medium ${isActive ? "text-amber-700 dark:text-amber-300" : "text-gray-500"}`}>
                {count}
              </span>
            )}
            <AnimatePresence>
              {showBurst === label && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 1, y: 0 }}
                  animate={{ scale: 2, opacity: 0, y: -20 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm pointer-events-none"
                >
                  {emoji}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
