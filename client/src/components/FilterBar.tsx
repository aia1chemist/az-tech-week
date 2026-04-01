/*
 * Design: Copper Circuit — Filter chips, search bar, dropdowns
 * Horizontal scrollable category chips, collapsible on mobile
 * Now includes: access type filter (public/invite only)
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
    <div className="bg-background border-b border-border/40">
      {/* Search + Filter Toggle Row */}
      <div className="px-4 pt-3 pb-2 flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events, organizers, cities..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-secondary/60 border border-border/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all tap-target ${
            showFilters || activeFilterCount > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary/60 text-muted-foreground border-border/50 hover:bg-secondary"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
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
            <div className="px-4 pb-3 space-y-3">
              {/* City + Time of Day + Access Row */}
              <div className="flex gap-2 flex-wrap">
                {/* City Dropdown */}
                <div className="relative flex-1 min-w-[120px]">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <select
                    value={filters.city}
                    onChange={(e) => updateFilter("city", e.target.value)}
                    className="w-full pl-8 pr-8 py-2 rounded-lg bg-secondary/60 border border-border/50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Cities</option>
                    {allCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>

                {/* Time of Day */}
                <div className="relative flex-1 min-w-[120px]">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <select
                    value={filters.timeOfDay}
                    onChange={(e) => updateFilter("timeOfDay", e.target.value)}
                    className="w-full pl-8 pr-8 py-2 rounded-lg bg-secondary/60 border border-border/50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Times</option>
                    <option value="Morning">Morning (before 12pm)</option>
                    <option value="Afternoon">Afternoon (12-5pm)</option>
                    <option value="Evening">Evening (after 5pm)</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Access Type Toggle */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Access</p>
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
                          ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20"
                          : "bg-secondary/40 text-muted-foreground border-border/40 hover:bg-secondary"
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
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {allCategories.map((cat) => {
                    const isActive = filters.categories.includes(cat);
                    const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["General Tech"];
                    const icon = CATEGORY_ICONS[cat] || "💡";
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium border transition-all tap-target ${
                          isActive
                            ? `${colors.bg} ${colors.text} ${colors.border} ring-1 ring-offset-1`
                            : "bg-secondary/40 text-muted-foreground border-border/40 hover:bg-secondary"
                        }`}
                      >
                        <span className="text-xs">{icon}</span>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear + Result count */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{resultCount}</span> events found
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-primary hover:underline"
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
        <div className="px-4 pb-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{resultCount}</span> events match your filters
          </p>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
