/*
 * AZTW Home — Clean, easy-to-navigate event calendar
 * v7.0: 10 new features — WhosGoing, LivePulse, EventMatchmaker, ScheduleRoast,
 *       CityHopperBadge, BingoCard, AfterPartyFinder, WeatherSuggestions,
 *       DailyDigest, ParkingNotes
 */
import { useState, useCallback, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useSwipe } from "@/hooks/useSwipe";
import HeroSection from "@/components/HeroSection";
import DaySelector from "@/components/DaySelector";
import FilterBar from "@/components/FilterBar";
import EventList from "@/components/EventList";
import QuickStats from "@/components/QuickStats";
import SortBar from "@/components/SortBar";
import ScrollToTop from "@/components/ScrollToTop";
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
import ChooseYourPath from "@/components/ChooseYourPath";

// v7.0 features
import EventMatchmaker from "@/components/EventMatchmaker";
import ScheduleRoast from "@/components/ScheduleRoast";
import CityHopperBadge from "@/components/CityHopperBadge";
import BingoCard from "@/components/BingoCard";
import AfterPartyFinder from "@/components/AfterPartyFinder";
import WeatherSuggestions from "@/components/WeatherSuggestions";
import DailyDigest from "@/components/DailyDigest";
import ParkingNotes from "@/components/ParkingNotes";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const {
    events,
    groupedEvents,
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

  // v7.0 modals
  const [matchmakerOpen, setMatchmakerOpen] = useState(false);
  const [bingoOpen, setBingoOpen] = useState(false);

  // Choose Your Path — tracks visibility
  const [showTracks, setShowTracks] = useState(false);

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

      {/* Day Context — unified section connecting day selector to its content */}
      <div className={`sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm ${isSearchActive ? "opacity-40 pointer-events-none" : ""}`}>
        <DaySelector
          selectedDay={filters.day}
          onSelectDay={(day) => updateFilter("day", day)}
        />
        {!isSearchActive && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center gap-2">
              {/* Selected day label */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">{filters.day}</span>
                <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
              </div>
              {/* Inline weather + stats */}
              <WeatherSuggestions selectedDay={filters.day} inline />
              <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
              <QuickStats selectedDay={filters.day} inline />
            </div>
          </div>
        )}
      </div>

      {/* Schedule Roast — tongue-in-cheek analysis (only shows if bookmarks exist) */}
      {!isSearchActive && <ScheduleRoast />}

      {/* After-Party Finder — evening events near bookmarked daytime events */}
      {!isSearchActive && <AfterPartyFinder selectedDay={filters.day} />}

      {/* City Hopper Badge — shows earned badge based on bookmark diversity */}
      {!isSearchActive && (
        <div className="max-w-6xl mx-auto px-4 py-1">
          <CityHopperBadge />
        </div>
      )}

      {/* Daily Digest email signup */}
      {!isSearchActive && <DailyDigest />}

      {/* First-timer guide — collapsible */}
      {!isSearchActive && <FirstTimerGuide />}

      {/* Choose Your Path — 3 discovery modes */}
      {!isSearchActive && (
        <ChooseYourPath
          onOpenPlanMyDay={() => setPlanMyDayOpen(true)}
          onShowTracks={() => {
            setShowTracks(prev => !prev);
            // Scroll to tracks section
            setTimeout(() => {
              document.getElementById('curated-tracks-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          onScrollToEvents={() => {
            document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      )}

      {/* Curated Tracks — shown when user picks that path */}
      {!isSearchActive && showTracks && (
        <div id="curated-tracks-section">
          <CuratedTracks />
        </div>
      )}

      {/* Events Section */}
      <div id="events-section" />

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

      {/* Parking & Venue Notes — after the event list */}
      <ParkingNotes />

      {/* Scroll to top */}
      <ScrollToTop />

      {/* Bottom Navigation Bar */}
      <BottomNav
        onOpenSchedule={() => setScheduleOpen(true)}
        onOpenHappeningNow={() => setHappeningNowOpen(true)}
        onOpenOrganizers={() => setOrganizersOpen(true)}
        onOpenMap={() => setMapOpen(true)}
        onOpenMatchmaker={() => setMatchmakerOpen(true)}
        onOpenBingo={() => setBingoOpen(true)}
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

      {/* v7.0 Modals */}
      <EventMatchmaker open={matchmakerOpen} onClose={() => setMatchmakerOpen(false)} />
      <BingoCard open={bingoOpen} onClose={() => setBingoOpen(false)} />

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
              {totalEvents} events &middot; April 6–12, 2026 &middot; Arizona &middot; v7.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
