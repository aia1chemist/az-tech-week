import { useState, useMemo, useCallback } from "react";
import eventsData from "@/data/events.json";
import type { Event, EventsData, SortOption } from "@/data/types";

const data = eventsData as EventsData;

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
        // Sold out first, then by fill percentage (highest first), then by spots left (lowest first)
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

export function useEvents() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

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
  }, []);

  const prevDay = useCallback(() => {
    setFilters((prev) => {
      const idx = data.days.indexOf(prev.day);
      if (idx > 0) {
        return { ...prev, day: data.days[idx - 1] };
      }
      return prev;
    });
  }, []);

  const filteredEvents = useMemo(() => {
    let result = data.events as Event[];

    // Day filter
    if (filters.day) {
      result = result.filter((e) => e.full_date === filters.day);
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((e) =>
        filters.categories.some((cat) => e.categories.includes(cat))
      );
    }

    // City filter
    if (filters.city) {
      result = result.filter((e) => e.city === filters.city);
    }

    // Time of day filter
    if (filters.timeOfDay) {
      result = result.filter((e) => e.time_of_day === filters.timeOfDay);
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.categories.some((c) => c.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q))
      );
    }

    // Invite only filter
    if (filters.inviteOnly === "public") {
      result = result.filter((e) => !e.invite_only);
    } else if (filters.inviteOnly === "invite") {
      result = result.filter((e) => e.invite_only);
    }

    // Sort
    result = sortEvents(result, filters.sort);

    return result;
  }, [filters]);

  // Group events by time of day
  const groupedEvents = useMemo(() => {
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
  }, [filteredEvents]);

  // Trending events for current day (top by going + interested)
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
  }, [filters.day]);

  // Stats for current day
  const dayStats = useMemo(() => {
    const dayEvents = data.events.filter((e) => e.full_date === filters.day);
    const cityCount = new Set(dayEvents.map((e) => e.city).filter(Boolean)).size;
    const catCount = new Set(dayEvents.flatMap((e) => e.categories)).size;
    return {
      total: dayEvents.length,
      cities: cityCount,
      categories: catCount,
    };
  }, [filters.day]);

  // Active filter count (excluding day and sort)
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
  };
}
