/*
 * BingoCard — Auto-generated "AZ Tech Week Bingo" card
 * Based on bookmarks: challenges like "Attended 3 AI events", "Met someone from Tucson"
 * Shareable, tappable to mark off squares
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

interface BingoSquare {
  text: string;
  emoji: string;
  category: "social" | "explore" | "learn" | "fun" | "wild";
}

const GENERIC_SQUARES: BingoSquare[] = [
  { text: "Exchanged LinkedIn with a stranger", emoji: "🤝", category: "social" },
  { text: "Attended an event before 9am", emoji: "🌅", category: "explore" },
  { text: "Went to a happy hour", emoji: "🍻", category: "fun" },
  { text: "Met a founder", emoji: "🚀", category: "social" },
  { text: "Took a selfie at an event", emoji: "🤳", category: "fun" },
  { text: "Visited a coworking space", emoji: "💻", category: "explore" },
  { text: "Heard 'disruption' unironically", emoji: "💥", category: "wild" },
  { text: "Got free swag", emoji: "🎁", category: "fun" },
  { text: "Attended an event in a new city", emoji: "🗺️", category: "explore" },
  { text: "Sat in the front row", emoji: "🪑", category: "wild" },
  { text: "Asked a question during Q&A", emoji: "🙋", category: "learn" },
  { text: "Met someone from out of state", emoji: "✈️", category: "social" },
  { text: "Tried local Arizona food", emoji: "🌮", category: "fun" },
  { text: "Walked 10,000+ steps in a day", emoji: "👟", category: "explore" },
  { text: "Pitched your idea to someone", emoji: "💡", category: "social" },
  { text: "Attended 3 events in one day", emoji: "🏃", category: "explore" },
  { text: "Made a new friend", emoji: "🫂", category: "social" },
  { text: "Heard someone say 'pivot'", emoji: "🔄", category: "wild" },
  { text: "Stayed until the very end", emoji: "🌙", category: "fun" },
  { text: "Learned something mind-blowing", emoji: "🤯", category: "learn" },
  { text: "Saw a live demo", emoji: "🔧", category: "learn" },
  { text: "Rode an Uber/Lyft between events", emoji: "🚗", category: "explore" },
  { text: "Talked to an investor", emoji: "💰", category: "social" },
  { text: "Survived the Arizona heat", emoji: "🔥", category: "wild" },
  { text: "Bookmarked 10+ events", emoji: "❤️", category: "fun" },
];

function generatePersonalSquares(bookmarkedEvents: typeof data.events): BingoSquare[] {
  const squares: BingoSquare[] = [];
  const cats: Record<string, number> = {};
  const cities = new Set<string>();

  for (const e of bookmarkedEvents) {
    for (const c of e.categories) cats[c] = (cats[c] || 0) + 1;
    if (e.city) cities.add(e.city);
  }

  // Category-specific challenges
  if (cats["AI & Machine Learning"]) squares.push({ text: `Attend ${Math.min(cats["AI & Machine Learning"], 3)} AI events`, emoji: "🤖", category: "learn" });
  if (cats["Networking & Social"]) squares.push({ text: "Collect 5 business cards at a networking event", emoji: "📇", category: "social" });
  if (cats["Startups & Entrepreneurship"]) squares.push({ text: "Ask a founder about their revenue", emoji: "📊", category: "wild" });
  if (cats["Space & Aerospace"]) squares.push({ text: "Talk about Mars colonization", emoji: "🛰️", category: "learn" });
  if (cats["Health & Biotech"]) squares.push({ text: "Learn about a biotech breakthrough", emoji: "🧬", category: "learn" });

  // City challenges
  if (cities.has("Tucson")) squares.push({ text: "Make the drive to Tucson", emoji: "🏜️", category: "explore" });
  if (cities.has("Scottsdale")) squares.push({ text: "Spot a Tesla in Scottsdale (easy mode)", emoji: "⚡", category: "fun" });
  if (cities.size >= 3) squares.push({ text: `Visit all ${cities.size} cities on your list`, emoji: "🏆", category: "explore" });

  return squares;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface BingoCardProps {
  open: boolean;
  onClose: () => void;
}

export default function BingoCard({ open, onClose }: BingoCardProps) {
  const { bookmarkedIds } = useBookmarks();
  const bookmarkedEvents = useMemo(
    () => data.events.filter(e => bookmarkedIds.has(e.id)),
    [bookmarkedIds]
  );

  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [seed, setSeed] = useState(42);

  const squares = useMemo(() => {
    const personal = generatePersonalSquares(bookmarkedEvents);
    const all = [...personal, ...GENERIC_SQUARES];
    const shuffled = seededShuffle(all, seed);
    // Pick 25 for a 5x5 grid, with FREE in center
    return shuffled.slice(0, 24);
  }, [bookmarkedEvents, seed]);

  const grid: (BingoSquare | "FREE")[] = [
    ...squares.slice(0, 12),
    "FREE",
    ...squares.slice(12, 24),
  ];

  const toggleSquare = (idx: number) => {
    if (grid[idx] === "FREE") return;
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const completedCount = checked.size + 1; // +1 for FREE
  const hasBingo = checkBingo(checked);

  const handleShare = () => {
    const lines = ["🎰 My AZ Tech Week Bingo Card\n"];
    for (let row = 0; row < 5; row++) {
      const rowSquares = grid.slice(row * 5, row * 5 + 5);
      lines.push(rowSquares.map((sq, i) => {
        const idx = row * 5 + i;
        const isChecked = sq === "FREE" || checked.has(idx);
        return isChecked ? "✅" : "⬜";
      }).join(""));
    }
    lines.push(`\n${completedCount}/25 complete${hasBingo ? " — BINGO! 🎉" : ""}`);
    lines.push("aztechweek.manus.space");
    const text = lines.join("\n");
    if (navigator.share) {
      navigator.share({ title: "AZ Tech Week Bingo", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => toast.success("Bingo card copied!")).catch(() => {});
    }
  };

  const regenerate = () => {
    setSeed(prev => prev + 1);
    setChecked(new Set());
  };

  if (!open) return null;

  const categoryColors: Record<string, string> = {
    social: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
    explore: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    learn: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    fun: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    wild: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  };

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
          className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎰</span>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">AZ Tech Week Bingo</h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{completedCount}/25 complete{hasBingo ? " — BINGO! 🎉" : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={regenerate} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="New card">
                <RotateCcw className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Share">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {hasBingo && (
            <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">BINGO! You got a line! Share your card!</span>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-5 gap-1.5 max-w-md mx-auto">
              {grid.map((sq, idx) => {
                if (sq === "FREE") {
                  return (
                    <div key={idx} className="aspect-square rounded-lg bg-teal-100 dark:bg-teal-900/30 border-2 border-teal-400 dark:border-teal-600 flex flex-col items-center justify-center">
                      <span className="text-base">⭐</span>
                      <span className="text-[8px] font-bold text-teal-700 dark:text-teal-300">FREE</span>
                    </div>
                  );
                }
                const isChecked = checked.has(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleSquare(idx)}
                    className={`aspect-square rounded-lg border p-1 flex flex-col items-center justify-center text-center transition-all ${
                      isChecked
                        ? "bg-teal-500 border-teal-600 text-white scale-95"
                        : `${categoryColors[sq.category]} hover:scale-95`
                    }`}
                  >
                    <span className={`text-sm ${isChecked ? "" : ""}`}>{isChecked ? "✅" : sq.emoji}</span>
                    <span className={`text-[7px] leading-tight mt-0.5 font-medium ${isChecked ? "text-white/80 line-through" : "text-gray-600 dark:text-gray-400"}`}>
                      {sq.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {[
                { cat: "social", label: "Social", color: "bg-pink-200" },
                { cat: "explore", label: "Explore", color: "bg-blue-200" },
                { cat: "learn", label: "Learn", color: "bg-amber-200" },
                { cat: "fun", label: "Fun", color: "bg-green-200" },
                { cat: "wild", label: "Wild Card", color: "bg-purple-200" },
              ].map(l => (
                <div key={l.cat} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-sm ${l.color}`} />
                  <span className="text-[9px] text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function checkBingo(checked: Set<number>): boolean {
  // Check rows, columns, diagonals (5x5 grid, center=12 is always checked)
  const isChecked = (idx: number) => idx === 12 || checked.has(idx);

  // Rows
  for (let r = 0; r < 5; r++) {
    if ([0, 1, 2, 3, 4].every(c => isChecked(r * 5 + c))) return true;
  }
  // Columns
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every(r => isChecked(r * 5 + c))) return true;
  }
  // Diagonals
  if ([0, 6, 12, 18, 24].every(isChecked)) return true;
  if ([4, 8, 12, 16, 20].every(isChecked)) return true;

  return false;
}
