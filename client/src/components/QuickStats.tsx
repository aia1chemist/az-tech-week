/*
 * Design: Copper Circuit — Quick stats bar showing day summary
 * Compact horizontal row with key metrics for selected day
 */
import { useMemo } from "react";
import { Sparkles, MapPin, Tag, Users, Flame } from "lucide-react";
import eventsData from "@/data/events.json";
import type { EventsData, Event } from "@/data/types";

const data = eventsData as EventsData;

interface QuickStatsProps {
  selectedDay: string;
}

export default function QuickStats({ selectedDay }: QuickStatsProps) {
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

  return (
    <div className="px-4 py-2.5 bg-secondary/30 border-b border-border/30">
      <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="font-semibold text-foreground">{stats.total}</span> events
        </span>
        <span className="w-px h-3 bg-border" />
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary" />
          <span className="font-semibold text-foreground">{stats.cities}</span> cities
        </span>
        <span className="w-px h-3 bg-border" />
        <span className="flex items-center gap-1">
          <Tag className="w-3 h-3 text-primary" />
          <span className="font-semibold text-foreground">{stats.categories}</span> topics
        </span>
        <span className="w-px h-3 bg-border" />
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 text-primary" />
          <span className="font-semibold text-foreground">{stats.publicEvents}</span> open
        </span>
        {stats.fillingUp > 0 && (
          <>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1 text-orange-600">
              <Flame className="w-3 h-3" />
              <span className="font-semibold">{stats.fillingUp}</span> filling up
            </span>
          </>
        )}
      </div>
    </div>
  );
}
