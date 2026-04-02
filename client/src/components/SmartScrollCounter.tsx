/*
 * Smart Scroll Counter — Floating counter showing "X events match" as user scrolls
 * Only visible when scrolled past the filter bar
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

interface SmartScrollCounterProps {
  count: number;
  isSearchActive: boolean;
}

export default function SmartScrollCounter({ count, isSearchActive }: SmartScrollCounterProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past ~500px (past filter bar area)
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            {isSearchActive && <Search className="w-3 h-3 text-teal-500" />}
            <span className="text-teal-700 dark:text-teal-300 font-bold">{count}</span>
            <span className="text-gray-500 dark:text-gray-400">event{count !== 1 ? "s" : ""}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
