/*
 * AZTW Light Theme — Sort bar with pill-style toggle options
 */
import { Clock, TrendingUp, Flame, ArrowDownAZ } from "lucide-react";
import type { SortOption } from "@/data/types";

interface SortBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
}

const SORT_OPTIONS: { value: SortOption; label: string; shortLabel: string; Icon: typeof Clock }[] = [
  { value: "time", label: "By Time", shortLabel: "Time", Icon: Clock },
  { value: "popular", label: "Most Popular", shortLabel: "Popular", Icon: TrendingUp },
  { value: "filling", label: "Filling Up", shortLabel: "Filling", Icon: Flame },
  { value: "alpha", label: "A → Z", shortLabel: "A→Z", Icon: ArrowDownAZ },
];

export default function SortBar({ sort, onSortChange, resultCount }: SortBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
      <p className="text-xs text-gray-500">
        <span className="font-semibold text-gray-900">{resultCount}</span> events
      </p>
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
        {SORT_OPTIONS.map(({ value, shortLabel, Icon }) => (
          <button
            key={value}
            onClick={() => onSortChange(value)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
              sort === value
                ? "bg-white text-teal-700 shadow-sm border border-teal-300"
                : "text-gray-500 hover:text-gray-700 border border-transparent"
            }`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
