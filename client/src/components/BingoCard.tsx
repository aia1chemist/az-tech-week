/*
 * BingoCard — Auto-generated "AZ Tech Week Bingo" card
 * Based on bookmarks: challenges like "Attended 3 AI events", "Met someone from Tucson"
 * Shareable, tappable to mark off squares, exportable as image for social media
 */
import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, RotateCcw, Trophy, Download, Image } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
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

  if (cats["AI & Machine Learning"]) squares.push({ text: `Attend ${Math.min(cats["AI & Machine Learning"], 3)} AI events`, emoji: "🤖", category: "learn" });
  if (cats["Networking & Social"]) squares.push({ text: "Collect 5 business cards at a networking event", emoji: "📇", category: "social" });
  if (cats["Startups & Entrepreneurship"]) squares.push({ text: "Ask a founder about their revenue", emoji: "📊", category: "wild" });
  if (cats["Space & Aerospace"]) squares.push({ text: "Talk about Mars colonization", emoji: "🛰️", category: "learn" });
  if (cats["Health & Biotech"]) squares.push({ text: "Learn about a biotech breakthrough", emoji: "🧬", category: "learn" });

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
  const [exporting, setExporting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const squares = useMemo(() => {
    const personal = generatePersonalSquares(bookmarkedEvents);
    const all = [...personal, ...GENERIC_SQUARES];
    const shuffled = seededShuffle(all, seed);
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

  const completedCount = checked.size + 1;
  const hasBingo = checkBingo(checked);

  const handleShareText = () => {
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

  const handleExportImage = useCallback(async () => {
    if (!gridRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to create image");

      // Try native share with image first (mobile)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "az-tech-week-bingo.png", { type: "image/png" });
        const shareData = { title: "AZ Tech Week Bingo", files: [file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success("Shared!");
          setExporting(false);
          return;
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "az-tech-week-bingo.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Bingo card saved as image!");
    } catch (err) {
      toast.error("Couldn't export image");
      console.error(err);
    }
    setExporting(false);
  }, [exporting]);

  const regenerate = () => {
    setSeed(prev => prev + 1);
    setChecked(new Set());
  };

  if (!open) return null;

  const categoryColors: Record<string, string> = {
    social: "bg-pink-50 border-pink-200",
    explore: "bg-blue-50 border-blue-200",
    learn: "bg-amber-50 border-amber-200",
    fun: "bg-green-50 border-green-200",
    wild: "bg-purple-50 border-purple-200",
  };

  const categoryColorsDark: Record<string, string> = {
    social: "dark:bg-pink-900/20 dark:border-pink-800",
    explore: "dark:bg-blue-900/20 dark:border-blue-800",
    learn: "dark:bg-amber-900/20 dark:border-amber-800",
    fun: "dark:bg-green-900/20 dark:border-green-800",
    wild: "dark:bg-purple-900/20 dark:border-purple-800",
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
              <button onClick={handleShareText} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Share as text">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={handleExportImage}
                disabled={exporting}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${exporting ? "opacity-50" : ""}`}
                title="Save as image"
              >
                <Image className="w-4 h-4 text-teal-500" />
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

          {/* Grid — ref for image export */}
          <div className="flex-1 overflow-y-auto p-3">
            <div ref={gridRef} className="bg-white p-4 rounded-xl max-w-md mx-auto">
              {/* Title for image export */}
              <div className="text-center mb-3">
                <h3 className="text-sm font-bold text-gray-900">🎰 AZ Tech Week Bingo</h3>
                <p className="text-[10px] text-gray-500">April 6–12, 2026 · aztechweek.manus.space</p>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {grid.map((sq, idx) => {
                  if (sq === "FREE") {
                    return (
                      <div key={idx} className="aspect-square rounded-lg bg-teal-100 border-2 border-teal-400 flex flex-col items-center justify-center">
                        <span className="text-base">⭐</span>
                        <span className="text-[8px] font-bold text-teal-700">FREE</span>
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
                          : `${categoryColors[sq.category]} ${categoryColorsDark[sq.category]} hover:scale-95`
                      }`}
                    >
                      <span className="text-sm">{isChecked ? "✅" : sq.emoji}</span>
                      <span className={`text-[7px] leading-tight mt-0.5 font-medium ${isChecked ? "text-white/80 line-through" : "text-gray-600 dark:text-gray-400"}`}>
                        {sq.text}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Footer for image export */}
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
              <p className="text-center text-[9px] text-gray-400 mt-2">{completedCount}/25 complete{hasBingo ? " — BINGO! 🎉" : ""}</p>
            </div>

            {/* Export CTA */}
            <div className="flex gap-2 max-w-md mx-auto mt-3">
              <button
                onClick={handleExportImage}
                disabled={exporting}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  exporting
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-200/50 dark:shadow-teal-900/30"
                }`}
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Save as Image"}
              </button>
              <button
                onClick={handleShareText}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function checkBingo(checked: Set<number>): boolean {
  const isChecked = (idx: number) => idx === 12 || checked.has(idx);

  for (let r = 0; r < 5; r++) {
    if ([0, 1, 2, 3, 4].every(c => isChecked(r * 5 + c))) return true;
  }
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every(r => isChecked(r * 5 + c))) return true;
  }
  if ([0, 6, 12, 18, 24].every(isChecked)) return true;
  if ([4, 8, 12, 16, 20].every(isChecked)) return true;

  return false;
}
