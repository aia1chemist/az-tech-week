/*
 * AZTW Light Theme — Quick stats bar for selected day
 * Supports inline mode for compact display inside day context bar
 */
import { useMemo } from "react";
import { Sparkles, MapPin, Tag, Users, Flame } from "lucide-react";
import eventsData from "@/data/events.json";
import type { EventsData, Event } from "@/data/types";

const data = eventsData as EventsData;

interface QuickStatsProps {
  selectedDay: string;
  inline?: boolean;
}

export default function QuickStats({ selectedDay, inline }: QuickStatsProps) {
  const stats = useMemo(() => {
    const dayEvents = (data.events as Event[]).filter((e) => e.full_date === selectedDay);
    const cities = new Set(dayEvents.map((e) => e.city).filter(Boolean));
    const categories = new Set(dayEvents.flatMap((e) => e.categories));
    const publicEvents = dayEvents.filter((e) => !e.invite_only).length;
    const fillingUp = dayEvents.filter(
      (e) => (e.spots_left >= 0 && e.spots_left <= 10) || e.sold_out
    ).length;

    return {
      total: dayEvents.length,
      cities: cities.size,
      categories: categories.size,
      publicEvents,
      fillingUp,
    };
  }, [selectedDay]);

  if (inline) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        <span className="flex items-center gap-0.5">
          <Sparkles className="w-3 h-3 text-teal-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">{stats.total}</span> events
        </span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
        <span className="flex items-center gap-0.5">
          <MapPin className="w-3 h-3 text-teal-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">{stats.cities}</span> cities
        </span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
        <span className="flex items-center gap-0.5">
          <Users className="w-3 h-3 text-teal-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">{stats.publicEvents}</span> open
        </span>
        {stats.fillingUp > 0 && (
          <>
            <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
            <span className="flex items-center gap-0.5 text-orange-500">
              <Flame className="w-3 h-3" />
              <span className="font-semibold">{stats.fillingUp}</span> filling
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.total}</span> events
        </span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-teal-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.cities}</span> cities
        </span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
        <span className="flex items-center gap-1">
          <Tag className="w-3 h-3 text-teal-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.categories}</span> topics
        </span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 text-teal-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.publicEvents}</span> open
        </span>
        {stats.fillingUp > 0 && (
          <>
            <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
            <span className="flex items-center gap-1 text-orange-500">
              <Flame className="w-3 h-3" />
              <span className="font-semibold">{stats.fillingUp}</span> filling up
            </span>
          </>
        )}
      </div>
    </div>
  );
}
