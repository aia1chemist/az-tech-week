import { useState, useMemo, useCallback } from "react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";

const data = eventsData as EventsData;

export interface Filters {
  day: string;
  categories: string[];
  city: string;
  timeOfDay: string;
  search: string;
  inviteOnly: "all" | "public" | "invite";
}

const DEFAULT_FILTERS: Filters = {
  day: "Monday, April 6",
  categories: [],
  city: "",
  timeOfDay: "",
  search: "",
  inviteOnly: "all",
};

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
          e.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    // Invite only filter
    if (filters.inviteOnly === "public") {
      result = result.filter((e) => !e.invite_only);
    } else if (filters.inviteOnly === "invite") {
      result = result.filter((e) => e.invite_only);
    }

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

  // Active filter count (excluding day)
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
    filters,
    updateFilter,
    toggleCategory,
    clearFilters,
    allDays: data.days,
    allCities: data.cities,
    allCategories: data.categories,
    dayStats,
    activeFilterCount,
    totalEvents: data.events.length,
  };
}
