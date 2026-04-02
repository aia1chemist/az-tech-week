/*
 * AZTW Home — Full-featured event calendar with ALL features
 * v4.0: Bookmarks, Live Now, Share, Conflicts, Venue Clusters, Organizer Profiles,
 * Calendar Export, Smart Recommendations, Live Ticker, Event Comparison, Networking Score,
 * Countdown, Dark Mode, Personal Stats, Google Cal, Shareable Schedule, Map View,
 * QR Codes, Reactions, Category Insights, Weather, Uber/Lyft, Smart Scroll Counter, PWA
 */
import { useState, useCallback } from "react";
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
import VenueClusters from "@/components/VenueClusters";
import OrganizerProfiles from "@/components/OrganizerProfiles";
import QRCodeModal from "@/components/QRCodeModal";
import MapView from "@/components/MapView";
import WeatherOverlay from "@/components/WeatherOverlay";
import SmartScrollCounter from "@/components/SmartScrollCounter";
import { useSharedScheduleLoader } from "@/components/ShareableSchedule";
import type { Event } from "@/data/types";

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

  // Load shared schedule from URL params
  useSharedScheduleLoader();

  // Drawer states
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [happeningNowOpen, setHappeningNowOpen] = useState(false);
  const [venueClustersOpen, setVenueClustersOpen] = useState(false);
  const [organizersOpen, setOrganizersOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // QR Code modal state
  const [qrEvent, setQrEvent] = useState<Event | null>(null);

  // Callbacks for venue clusters and organizer profiles
  const handleFilterCity = useCallback((city: string) => {
    updateFilter("city", city);
    setVenueClustersOpen(false);
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
      {/* Smart Scroll Counter — floating at top */}
      <SmartScrollCounter count={events.length} isSearchActive={isSearchActive} />

      {/* Hero — includes countdown, category insights, dark mode toggle */}
      <HeroSection />

      {/* Day Selector — sticky (dimmed when searching across all days) */}
      <div className={isSearchActive ? "opacity-40 pointer-events-none" : ""}>
        <DaySelector
          selectedDay={filters.day}
          onSelectDay={(day) => updateFilter("day", day)}
        />
      </div>

      {/* Weather Overlay — show for selected day */}
      {!isSearchActive && (
        <div className="max-w-6xl mx-auto px-4 mt-2">
          <WeatherOverlay selectedDay={filters.day} />
        </div>
      )}

      {/* Live Ticker — What's Hot today */}
      {!isSearchActive && <LiveTicker selectedDay={filters.day} />}

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

      {/* Event List — with QR code callback */}
      <main className="max-w-6xl mx-auto pb-16">
        <EventList
          groupedEvents={groupedEvents}
          totalFiltered={events.length}
          isSearchMode={isSearchActive}
          searchDayBreakdown={searchDayBreakdown}
          onShowQR={handleShowQR}
        />
      </main>

      {/* Scroll to top — offset for bottom nav */}
      <ScrollToTop />

      {/* Bottom Navigation Bar — with map button */}
      <BottomNav
        onOpenSchedule={() => setScheduleOpen(true)}
        onOpenHappeningNow={() => setHappeningNowOpen(true)}
        onOpenVenueClusters={() => setVenueClustersOpen(true)}
        onOpenOrganizers={() => setOrganizersOpen(true)}
        onOpenMap={() => setMapOpen(true)}
      />

      {/* Drawers */}
      <MySchedule open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      <HappeningNow open={happeningNowOpen} onClose={() => setHappeningNowOpen(false)} />
      <VenueClusters
        open={venueClustersOpen}
        onClose={() => setVenueClustersOpen(false)}
        onFilterCity={handleFilterCity}
        selectedDay={filters.day}
      />
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

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8 px-4 pb-20">
        <div className="max-w-lg mx-auto text-center space-y-3">
          {/* Credits */}
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

          {/* Last Updated & Version */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated: April 1, 2026</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-gray-400 dark:text-gray-500">Updated every 12 hours</span>
            </div>
          </div>

          {/* Data sources */}
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
              {totalEvents} events &middot; April 6–12, 2026 &middot; Arizona &middot; v4.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
