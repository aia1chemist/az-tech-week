/*
 * AZTW Light Theme — Search bar + expandable filter panel
 * Teal accents, white inputs, category chips, city/time/access dropdowns
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, MapPin, Clock, ChevronDown, Lock, Globe } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/data/types";
import type { Filters } from "@/hooks/useEvents";

interface FilterBarProps {
  filters: Filters;
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  toggleCategory: (category: string) => void;
  clearFilters: () => void;
  allCities: string[];
  allCategories: string[];
  activeFilterCount: number;
  resultCount: number;
}

export default function FilterBar({
  filters,
  updateFilter,
  toggleCategory,
  clearFilters,
  allCities,
  allCategories,
  activeFilterCount,
  resultCount,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200">
      {/* Search + Filter Toggle Row */}
      <div className="px-4 pt-3 pb-2 flex gap-2 items-center max-w-6xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
          <input
            type="text"
            placeholder="Search events, organizers, cities, topics..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-gray-300 focus:border-teal-400 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:shadow-lg focus:shadow-teal-50"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all tap-target ${
            showFilters || activeFilterCount > 0
              ? "bg-teal-50 border-teal-300 text-teal-700"
              : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-3 max-w-6xl mx-auto">
              {/* City + Time of Day Row */}
              <div className="flex gap-2 flex-wrap">
                {/* City Dropdown */}
                <div className="relative flex-1 min-w-[140px]">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-500 pointer-events-none" />
                  <select
                    value={filters.city}
                    onChange={(e) => updateFilter("city", e.target.value)}
                    className="w-full pl-8 pr-8 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 appearance-none outline-none focus:border-teal-400 transition-all"
                  >
                    <option value="">All Cities</option>
                    {allCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>

                {/* Time of Day */}
                <div className="relative flex-1 min-w-[140px]">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-500 pointer-events-none" />
                  <select
                    value={filters.timeOfDay}
                    onChange={(e) => updateFilter("timeOfDay", e.target.value)}
                    className="w-full pl-8 pr-8 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 appearance-none outline-none focus:border-teal-400 transition-all"
                  >
                    <option value="">All Times</option>
                    <option value="Morning">Morning (before 12pm)</option>
                    <option value="Afternoon">Afternoon (12-5pm)</option>
                    <option value="Evening">Evening (after 5pm)</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Access Type Toggle */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Access</p>
                <div className="flex gap-1.5">
                  {[
                    { value: "all" as const, label: "All Events", icon: null },
                    { value: "public" as const, label: "Public Only", icon: Globe },
                    { value: "invite" as const, label: "Invite Only", icon: Lock },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateFilter("inviteOnly", value)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all tap-target ${
                        filters.inviteOnly === value
                          ? "bg-teal-50 text-teal-700 border-teal-300"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Chips */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {allCategories.map((cat) => {
                    const isActive = filters.categories.includes(cat);
                    const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["General Tech"];
                    const icon = CATEGORY_ICONS[cat] || "\u{1F4A1}";
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all tap-target ${
                          isActive
                            ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-[11px]">{icon}</span>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear + Result count */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">{resultCount}</span> events found
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-orange-500 hover:text-orange-600"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick result count when filters closed */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="px-4 pb-2 flex items-center justify-between max-w-6xl mx-auto">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{resultCount}</span> events match
          </p>
          <button onClick={clearFilters} className="text-xs font-medium text-orange-500 hover:text-orange-600">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
