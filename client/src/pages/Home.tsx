/*
 * Design: Copper Circuit — Warm, Scandinavian-meets-Southwest
 * Mobile-first event calendar with day tabs, filters, time-grouped cards
 * Now with: trending section, sort bar, swipe to change day
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
    allDays,
    allCities,
    allCategories,
    dayStats,
    activeFilterCount,
    totalEvents,
  } = useEvents();

  const swipeHandlers = useSwipe(nextDay, prevDay);

  return (
    <div className="min-h-screen bg-background" {...swipeHandlers}>
      {/* Hero */}
      <HeroSection totalEvents={totalEvents} totalCities={allCities.length} />

      {/* Day Selector — sticky */}
      <DaySelector
        selectedDay={filters.day}
        onSelectDay={(day) => updateFilter("day", day)}
      />

      {/* Quick Stats */}
      <QuickStats selectedDay={filters.day} />

      {/* Trending Section */}
      <TrendingSection events={trendingEvents} />

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

      {/* Sort Bar */}
      <div className="max-w-6xl mx-auto">
        <SortBar
          sort={filters.sort}
          onSortChange={(sort) => updateFilter("sort", sort)}
          resultCount={events.length}
        />
      </div>

      {/* Event List */}
      <main className="max-w-6xl mx-auto">
        <EventList groupedEvents={groupedEvents} totalFiltered={events.length} />
      </main>

      {/* Scroll to top */}
      <ScrollToTop />

      {/* Footer */}
      <footer className="border-t border-border/40 bg-secondary/30 py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Data sourced from{" "}
          <a
            href="https://www.azcommerce.com/az-tech-week/aztw-calendar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            AZ Commerce
          </a>{" "}
          &amp;{" "}
          <a
            href="https://partiful.com/u/VY4cqhQoiBhJ9W9fLIqC"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Partiful
          </a>
          . Not an official AZ Tech Week product.
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {totalEvents} events &middot; April 6–12, 2026 &middot; Arizona
        </p>
      </footer>
    </div>
  );
}
