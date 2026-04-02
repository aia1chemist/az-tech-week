/*
 * AZTW Home — Clean, easy-to-navigate event calendar
 * v6.0: Fresh data scrape + all features wired — removed floating counters, weather row, emoji reactions from cards
 * All advanced features accessible via bottom nav drawers
 */
import { useState, useCallback, useEffect } from "react";
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
import LiveTicker from "@/components/LiveTicker";
import BottomNav from "@/components/BottomNav";
import MySchedule from "@/components/MySchedule";
import HappeningNow from "@/components/HappeningNow";
import OrganizerProfiles from "@/components/OrganizerProfiles";
import QRCodeModal from "@/components/QRCodeModal";
import MapView from "@/components/MapView";
import { useSharedScheduleLoader } from "@/components/ShareableSchedule";
import type { Event } from "@/data/types";
import CuratedTracks from "@/components/CuratedTracks";
import FirstTimerGuide from "@/components/FirstTimerGuide";
import PlanMyDay from "@/components/PlanMyDay";

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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load shared schedule from URL params
  useSharedScheduleLoader();

  // Drawer states
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [happeningNowOpen, setHappeningNowOpen] = useState(false);
  const [organizersOpen, setOrganizersOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // QR Code modal state
  const [qrEvent, setQrEvent] = useState<Event | null>(null);

  // Plan My Day wizard
  const [planMyDayOpen, setPlanMyDayOpen] = useState(false);

  const handleFilterCity = useCallback((city: string) => {
    updateFilter("city", city);
    window.scrollTo({ top: 400, behavior: "smooth" });
  }, [updateFilter]);

  const handleSearchOrganizer = useCallback((name: string) => {
    updateFilter("search", name);
    setOrganizersOpen(false);
    window.scrollTo({ top: 400, behavior: "smooth" });
  }, [updateFilter]);

  const handleShowQR = useCallback((event: Event) => {
    setQrEvent(event);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" {...swipeHandlers}>
      {/* Hero — countdown, stats, dark mode toggle */}
      <HeroSection />

      {/* Day Selector — sticky (dimmed when searching across all days) */}
      <div className={isSearchActive ? "opacity-40 pointer-events-none" : ""}>
        <DaySelector
          selectedDay={filters.day}
          onSelectDay={(day) => updateFilter("day", day)}
        />
      </div>

      {/* Live Ticker — compact "What's Hot" strip */}
      {!isSearchActive && <LiveTicker selectedDay={filters.day} />}

      {/* Quick Stats — single-line summary */}
      {!isSearchActive && <QuickStats selectedDay={filters.day} />}

      {/* Trending Section */}
      {!isSearchActive && <TrendingSection events={trendingEvents} />}

      {/* First-timer guide — collapsible */}
      {!isSearchActive && <FirstTimerGuide />}

      {/* Plan My Day CTA */}
      {!isSearchActive && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <button
            onClick={() => setPlanMyDayOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-200/50 dark:shadow-teal-900/30 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
            Plan My Day
          </button>
        </div>
      )}

      {/* Curated Tracks — pre-built event bundles */}
      {!isSearchActive && <CuratedTracks />}

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
      <main className="max-w-6xl mx-auto pb-16">
        <EventList
          groupedEvents={groupedEvents}
          totalFiltered={events.length}
          isSearchMode={isSearchActive}
          searchDayBreakdown={searchDayBreakdown}
          onShowQR={handleShowQR}
        />
      </main>

      {/* Scroll to top */}
      <ScrollToTop />

      {/* Bottom Navigation Bar */}
      <BottomNav
        onOpenSchedule={() => setScheduleOpen(true)}
        onOpenHappeningNow={() => setHappeningNowOpen(true)}
        onOpenOrganizers={() => setOrganizersOpen(true)}
        onOpenMap={() => setMapOpen(true)}
      />

      {/* Drawers — all features accessible but tucked away */}
      <MySchedule open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      <HappeningNow open={happeningNowOpen} onClose={() => setHappeningNowOpen(false)} />
      <OrganizerProfiles
        open={organizersOpen}
        onClose={() => setOrganizersOpen(false)}
        onSearchOrganizer={handleSearchOrganizer}
      />
      <MapView
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        selectedDay={filters.day}
      />

      {/* QR Code Modal */}
      <QRCodeModal event={qrEvent} onClose={() => setQrEvent(null)} />

      {/* Plan My Day Wizard */}
      <PlanMyDay open={planMyDayOpen} onClose={() => setPlanMyDayOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8 px-4 pb-20">
        <div className="max-w-lg mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Made by</span>
            <a
              href="https://www.linkedin.com/in/tlegwinski/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-semibold transition-colors"
            >
              Trevor Legwinski
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Powered by</span>
            <a
              href="https://manus.im"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-semibold transition-colors"
            >
              Manus AI
            </a>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated: April 2, 2026</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-gray-400 dark:text-gray-500">Updated every 12 hours</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Data sourced from{" "}
              <a
                href="https://www.azcommerce.com/az-tech-week/aztw-calendar/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                AZ Commerce
              </a>{" "}
              &amp;{" "}
              <a
                href="https://partiful.com/u/VY4cqhQoiBhJ9W9fLIqC"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Partiful
              </a>
              . Not an official AZ Tech Week product.
            </p>
            <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
              {totalEvents} events &middot; April 6–12, 2026 &middot; Arizona &middot; v6.1
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
