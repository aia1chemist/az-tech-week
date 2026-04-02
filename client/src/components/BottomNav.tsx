/*
 * Bottom Navigation Bar — Compact floating pill, translucent, auto-hides on scroll down
 * Shows on scroll up or when idle. Minimal footprint to avoid overlapping event cards.
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Radio, User, Map, Sparkles, Dices } from "lucide-react";
import { useBookmarks } from "@/contexts/BookmarkContext";

interface BottomNavProps {
  onOpenSchedule: () => void;
  onOpenHappeningNow: () => void;
  onOpenOrganizers: () => void;
  onOpenMap?: () => void;
  onOpenMatchmaker?: () => void;
  onOpenBingo?: () => void;
}

export default function BottomNav({
  onOpenSchedule,
  onOpenHappeningNow,
  onOpenOrganizers,
  onOpenMap,
  onOpenMatchmaker,
  onOpenBingo,
}: BottomNavProps) {
  const { count } = useBookmarks();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 200 || currentY < lastScrollY.current - 10) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 30) {
        setVisible(false);
      }
      lastScrollY.current = currentY;

      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setVisible(true), 1500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(idleTimer.current);
    };
  }, []);

  const items = [
    {
      label: "Live",
      Icon: Radio,
      onClick: onOpenHappeningNow,
      color: "text-green-600 dark:text-green-400",
      badge: null,
      pulse: true,
    },
    {
      label: "Schedule",
      Icon: Heart,
      onClick: onOpenSchedule,
      color: "text-pink-500 dark:text-pink-400",
      badge: count > 0 ? count : null,
      pulse: false,
    },
    ...(onOpenMap ? [{
      label: "Map",
      Icon: Map,
      onClick: onOpenMap,
      color: "text-teal-600 dark:text-teal-400",
      badge: null,
      pulse: false,
    }] : []),
    {
      label: "Hosts",
      Icon: User,
      onClick: onOpenOrganizers,
      color: "text-purple-600 dark:text-purple-400",
      badge: null,
      pulse: false,
    },
    ...(onOpenMatchmaker ? [{
      label: "Match",
      Icon: Sparkles,
      onClick: onOpenMatchmaker,
      color: "text-violet-600 dark:text-violet-400",
      badge: null,
      pulse: false,
    }] : []),
    ...(onOpenBingo ? [{
      label: "Bingo",
      Icon: Dices,
      onClick: onOpenBingo,
      color: "text-amber-600 dark:text-amber-400",
      badge: null,
      pulse: false,
    }] : []),
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/70 dark:border-gray-600/70 shadow-lg shadow-black/8">
            {items.map(({ label, Icon, onClick, color, badge, pulse }) => (
              <button
                key={label}
                onClick={onClick}
                className="relative flex flex-col items-center gap-0 px-2.5 py-1 rounded-full transition-all hover:bg-gray-100/60 dark:hover:bg-gray-700/60 active:scale-90 group"
              >
                <div className="relative">
                  <Icon className={`w-[18px] h-[18px] ${color} group-hover:scale-110 transition-transform`} />
                  {pulse && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                  )}
                  {badge !== null && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-pink-500 text-white text-[8px] font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-medium text-gray-500 dark:text-gray-400 leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
