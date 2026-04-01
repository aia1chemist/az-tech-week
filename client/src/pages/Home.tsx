/*
 * AZTW Light Theme — Clean, mobile-first event calendar
 * Features: bookmarks, cross-day search, trending, sort, filters
 */
import { useEvents } from "@/hooks/useEvents";
import { useSwipe } from "@/hooks/useSwipe";
import HeroSection from "@/components/HeroSection";
import DaySelector from "@/components/DaySelector";
import FilterBar from "@/components/FilterBar";
import EventList from "@/components/EventList";
import QuickStats from "@/components/QuickStats";
import TrendingSection from "@/components/TrendingSection";
import SortBar from "@/components/SortBar";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  const {
    events,
    groupedEvents,
    trendingEvents,
    filters,
    updateFilter,
    toggleCategory,
    clearFilters,
    nextDay,
    prevDay,
    allCities,
    allCategories,
    activeFilterCount,
    totalEvents,
    isSearchActive,
    searchDayBreakdown,
  } = useEvents();

  const swipeHandlers = useSwipe(nextDay, prevDay);

  return (
    <div className="min-h-screen bg-gray-50" {...swipeHandlers}>
      {/* Hero */}
      <HeroSection />

      {/* Day Selector — sticky (dimmed when searching across all days) */}
      <div className={isSearchActive ? "opacity-40 pointer-events-none" : ""}>
        <DaySelector
          selectedDay={filters.day}
          onSelectDay={(day) => updateFilter("day", day)}
        />
      </div>

      {/* Quick Stats — hide when searching */}
      {!isSearchActive && <QuickStats selectedDay={filters.day} />}

      {/* Trending Section — hide when searching */}
      {!isSearchActive && <TrendingSection events={trendingEvents} />}

      {/* Filters */}
      <FilterBar
        filters={filters}
        updateFilter={updateFilter}
        toggleCategory={toggleCategory}
        clearFilters={clearFilters}
        allCities={allCities}
        allCategories={allCategories}
        activeFilterCount={activeFilterCount}
        resultCount={events.length}
      />

      {/* Sort Bar — hide when searching */}
      {!isSearchActive && (
        <div className="max-w-6xl mx-auto">
          <SortBar
            sort={filters.sort}
            onSortChange={(sort) => updateFilter("sort", sort)}
            resultCount={events.length}
          />
        </div>
      )}

      {/* Event List */}
      <main className="max-w-6xl mx-auto">
        <EventList
          groupedEvents={groupedEvents}
          totalFiltered={events.length}
          isSearchMode={isSearchActive}
          searchDayBreakdown={searchDayBreakdown}
        />
      </main>

      {/* Scroll to top */}
      <ScrollToTop />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 px-4">
        <div className="max-w-lg mx-auto text-center space-y-3">
          {/* Credits */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>Made by</span>
            <a
              href="https://www.linkedin.com/in/tlegwinski/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              Trevor Legwinski
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>Powered by</span>
            <a
              href="https://manus.im"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              Manus AI
            </a>
          </div>

          {/* Last Updated & Version */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated: April 1, 2026</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">Updated every 12 hours</span>
            </div>
          </div>

          {/* Data sources */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">
              Data sourced from{" "}
              <a
                href="https://www.azcommerce.com/az-tech-week/aztw-calendar/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition-colors"
              >
                AZ Commerce
              </a>{" "}
              &amp;{" "}
              <a
                href="https://partiful.com/u/VY4cqhQoiBhJ9W9fLIqC"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition-colors"
              >
                Partiful
              </a>
              . Not an official AZ Tech Week product.
            </p>
            <p className="text-[10px] text-gray-300 mt-1">
              {totalEvents} events &middot; April 6–12, 2026 &middot; Arizona &middot; v2.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
