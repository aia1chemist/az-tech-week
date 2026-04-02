/*
 * Personal Stats — Summary of user's bookmarked schedule
 * "You're attending 12 events across 4 cities over 5 days"
 */
import { useMemo } from "react";
import { Calendar, MapPin, Clock, Zap, TrendingUp } from "lucide-react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

export default function PersonalStats() {
  const { bookmarkedIds } = useBookmarks();

  const stats = useMemo(() => {
    const events = (data.events as Event[]).filter((e) => bookmarkedIds.has(e.id));
    if (events.length === 0) return null;

    const cities = new Set(events.map((e) => e.city).filter(Boolean));
    const days = new Set(events.map((e) => e.full_date));
    const categories = new Set(events.flatMap((e) => e.categories));
    const totalMinutes = events.reduce((sum, e) => sum + (e.duration_minutes > 0 ? e.duration_minutes : 60), 0);
    const totalHours = Math.round(totalMinutes / 60);
    const totalGoing = events.reduce((sum, e) => sum + e.going, 0);

    // Busiest day
    const dayCount: Record<string, number> = {};
    events.forEach((e) => { dayCount[e.full_date] = (dayCount[e.full_date] || 0) + 1; });
    const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];

    // Top category
    const catCount: Record<string, number> = {};
    events.forEach((e) => e.categories.forEach((c) => { catCount[c] = (catCount[c] || 0) + 1; }));
    const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];

    return {
      eventCount: events.length,
      cityCount: cities.size,
      dayCount: days.size,
      categoryCount: categories.size,
      totalHours,
      totalGoing,
      busiestDay: busiestDay ? { day: busiestDay[0].split(", ")[0]?.slice(0, 3) || busiestDay[0], count: busiestDay[1] } : null,
      topCategory: topCategory ? topCategory[0] : null,
    };
  }, [bookmarkedIds]);

  if (!stats) return null;

  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 border border-teal-200 dark:border-teal-700 mb-3">
      <div className="text-[10px] uppercase tracking-wider text-teal-700 dark:text-teal-300 font-bold mb-2 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        Your Tech Week at a Glance
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <div className="text-lg font-black text-teal-700 dark:text-teal-300 font-display">{stats.eventCount}</div>
          <div className="text-[9px] text-gray-600 dark:text-gray-400">Events</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-display">{stats.cityCount}</div>
          <div className="text-[9px] text-gray-600 dark:text-gray-400">Cities</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-blue-700 dark:text-blue-300 font-display">{stats.dayCount}</div>
          <div className="text-[9px] text-gray-600 dark:text-gray-400">Days</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-orange-600 dark:text-orange-300 font-display">{stats.totalHours}h</div>
          <div className="text-[9px] text-gray-600 dark:text-gray-400">Total</div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-teal-200/50 dark:border-teal-700/50">
        {stats.busiestDay && (
          <span className="text-[10px] text-gray-600 dark:text-gray-400">
            <Calendar className="w-2.5 h-2.5 inline mr-0.5" />
            Busiest: <span className="font-semibold text-gray-800 dark:text-gray-200">{stats.busiestDay.day}</span> ({stats.busiestDay.count})
          </span>
        )}
        {stats.topCategory && (
          <span className="text-[10px] text-gray-600 dark:text-gray-400">
            <Zap className="w-2.5 h-2.5 inline mr-0.5" />
            Top: <span className="font-semibold text-gray-800 dark:text-gray-200">{stats.topCategory}</span>
          </span>
        )}
      </div>
    </div>
  );
}
