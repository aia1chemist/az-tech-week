import { useState, useMemo, useCallback, useEffect } from "react";
import bundledEventsData from "@/data/events.json";
import type { Event, EventsData, SortOption } from "@/data/types";

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/aia1chemist/az-tech-week/main/client/src/data/events.json";

// Cache duration: 5 minutes (in ms)
const CACHE_TTL = 5 * 60 * 1000;

let cachedData: EventsData | null = null;
let cacheTimestamp = 0;

const bundled = bundledEventsData as EventsData;

export interface Filters {
  day: string;
  categories: string[];
  city: string;
  timeOfDay: string;
  search: string;
  inviteOnly: "all" | "public" | "invite";
  sort: SortOption;
}

const DEFAULT_FILTERS: Filters = {
  day: "Monday, April 6",
  categories: [],
  city: "",
  timeOfDay: "",
  search: "",
  inviteOnly: "all",
  sort: "time",
};

function parseTime(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toLowerCase();
  if (ampm === "pm" && hours !== 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function sortEvents(events: Event[], sort: SortOption): Event[] {
  const sorted = [...events];
  switch (sort) {
    case "time":
      sorted.sort((a, b) => parseTime(a.time) - parseTime(b.time));
      break;
    case "popular":
      sorted.sort((a, b) => {
        const scoreA = a.going + a.interested * 0.5;
        const scoreB = b.going + b.interested * 0.5;
        return scoreB - scoreA;
      });
      break;
    case "filling":
      sorted.sort((a, b) => {
        if (a.sold_out && !b.sold_out) return -1;
        if (!a.sold_out && b.sold_out) return 1;
        if (a.spots_left === 0 && b.spots_left !== 0) return -1;
        if (a.spots_left !== 0 && b.spots_left === 0) return 1;
        const fillA = a.capacity > 0 && a.spots_left >= 0 ? (a.capacity - a.spots_left) / a.capacity : 0;
        const fillB = b.capacity > 0 && b.spots_left >= 0 ? (b.capacity - b.spots_left) / b.capacity : 0;
        return fillB - fillA;
      });
      break;
    case "alpha":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }
  return sorted;
}

function matchesSearch(e: Event, q: string): boolean {
  return (
    e.title.toLowerCase().includes(q) ||
    e.organizer.toLowerCase().includes(q) ||
    e.city.toLowerCase().includes(q) ||
    e.categories.some((c) => c.toLowerCase().includes(q)) ||
    (e.description ? e.description.toLowerCase().includes(q) : false)
  );
}

function applyNonDayFilters(events: Event[], filters: Filters): Event[] {
  let result = events;

  if (filters.categories.length > 0) {
    result = result.filter((e) =>
      filters.categories.some((cat) => e.categories.includes(cat))
    );
  }

  if (filters.city) {
    result = result.filter((e) => e.city === filters.city);
  }

  if (filters.timeOfDay) {
    result = result.filter((e) => e.time_of_day === filters.timeOfDay);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((e) => matchesSearch(e, q));
  }

  if (filters.inviteOnly === "public") {
    result = result.filter((e) => !e.invite_only);
  } else if (filters.inviteOnly === "invite") {
    result = result.filter((e) => e.invite_only);
  }

  return result;
}

export function useEvents() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [liveData, setLiveData] = useState<EventsData>(bundled);
  const [dataSource, setDataSource] = useState<"bundled" | "live">("bundled");

  // Fetch live data from GitHub on mount, with 5-min cache
  useEffect(() => {
    const now = Date.now();
    if (cachedData && now - cacheTimestamp < CACHE_TTL) {
      setLiveData(cachedData);
      setDataSource("live");
      return;
    }

    let cancelled = false;
    fetch(GITHUB_RAW_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: EventsData) => {
        if (cancelled) return;
        // Validate the data has events
        if (json && json.events && json.events.length > 0) {
          cachedData = json;
          cacheTimestamp = Date.now();
          setLiveData(json);
          setDataSource("live");
        }
      })
      .catch(() => {
        // Silently fall back to bundled data
        if (!cancelled) {
          setDataSource("bundled");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const data = liveData;

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, day: prev.day }));
  }, []);

  const nextDay = useCallback(() => {
    setFilters((prev) => {
      const idx = data.days.indexOf(prev.day);
      if (idx < data.days.length - 1) {
        return { ...prev, day: data.days[idx + 1] };
      }
      return prev;
    });
  }, [data.days]);

  const prevDay = useCallback(() => {
    setFilters((prev) => {
      const idx = data.days.indexOf(prev.day);
      if (idx > 0) {
        return { ...prev, day: data.days[idx - 1] };
      }
      return prev;
    });
  }, [data.days]);

  const isSearchActive = filters.search.length > 0;

  const filteredEvents = useMemo(() => {
    let result = data.events as Event[];

    if (isSearchActive) {
      result = applyNonDayFilters(result, filters);
    } else {
      if (filters.day) {
        result = result.filter((e) => e.full_date === filters.day);
      }
      result = applyNonDayFilters(result, filters);
    }

    if (isSearchActive) {
      const dayOrder = data.days;
      result = [...result].sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.full_date) - dayOrder.indexOf(b.full_date);
        if (dayDiff !== 0) return dayDiff;
        return parseTime(a.time) - parseTime(b.time);
      });
    } else {
      result = sortEvents(result, filters.sort);
    }

    return result;
  }, [filters, isSearchActive, data]);

  const searchDayBreakdown = useMemo(() => {
    if (!isSearchActive) return null;
    const breakdown: Record<string, number> = {};
    filteredEvents.forEach((e) => {
      breakdown[e.full_date] = (breakdown[e.full_date] || 0) + 1;
    });
    return breakdown;
  }, [filteredEvents, isSearchActive]);

  const groupedEvents = useMemo(() => {
    if (isSearchActive) {
      const groups: Record<string, Event[]> = {};
      filteredEvents.forEach((e) => {
        const day = e.full_date;
        if (!groups[day]) groups[day] = [];
        groups[day].push(e);
      });
      return groups;
    }
    const groups: Record<string, Event[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
      TBD: [],
    };
    filteredEvents.forEach((e) => {
      const tod = e.time_of_day || "TBD";
      if (groups[tod]) {
        groups[tod].push(e);
      }
    });
    return groups;
  }, [filteredEvents, isSearchActive]);

  const trendingEvents = useMemo(() => {
    const dayEvents = (data.events as Event[]).filter((e) => e.full_date === filters.day);
    return dayEvents
      .filter((e) => e.going > 0 || e.interested > 0 || (e.capacity > 0 && e.spots_left >= 0 && e.spots_left <= 10))
      .sort((a, b) => {
        const scoreA = a.going + a.interested * 0.5 + (a.spots_left === 0 ? 100 : 0);
        const scoreB = b.going + b.interested * 0.5 + (b.spots_left === 0 ? 100 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 6);
  }, [filters.day, data]);

  const dayStats = useMemo(() => {
    const dayEvents = data.events.filter((e) => e.full_date === filters.day);
    const cityCount = new Set(dayEvents.map((e) => e.city).filter(Boolean)).size;
    const catCount = new Set(dayEvents.flatMap((e) => e.categories)).size;
    return {
      total: dayEvents.length,
      cities: cityCount,
      categories: catCount,
    };
  }, [filters.day, data]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.city) count++;
    if (filters.timeOfDay) count++;
    if (filters.search) count++;
    if (filters.inviteOnly !== "all") count++;
    return count;
  }, [filters]);

  return {
    events: filteredEvents,
    groupedEvents,
    trendingEvents,
    filters,
    updateFilter,
    toggleCategory,
    clearFilters,
    nextDay,
    prevDay,
    allDays: data.days,
    allCities: data.cities,
    allCategories: data.categories,
    dayStats,
    activeFilterCount,
    totalEvents: data.events.length,
    isSearchActive,
    searchDayBreakdown,
    dataSource,
  };
}
