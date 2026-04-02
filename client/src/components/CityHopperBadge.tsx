/*
 * CityHopperBadge — Awards badges based on city diversity in bookmarked events
 * "Phoenix Local" → "Valley Explorer" → "Arizona Road Warrior"
 */
import { useMemo } from "react";
import { MapPin, Award } from "lucide-react";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

interface Badge {
  name: string;
  emoji: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  minCities: number;
}

const BADGES: Badge[] = [
  { name: "Phoenix Local", emoji: "🌵", description: "Events in 1 city", color: "text-teal-700 dark:text-teal-300", bg: "bg-teal-50 dark:bg-teal-900/20", border: "border-teal-200 dark:border-teal-700", minCities: 1 },
  { name: "Valley Explorer", emoji: "🗺️", description: "Events in 2-3 cities", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-700", minCities: 2 },
  { name: "Arizona Road Warrior", emoji: "🏜️", description: "Events in 4+ cities", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-700", minCities: 4 },
  { name: "State Champion", emoji: "🏆", description: "Events in 6+ cities", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-700", minCities: 6 },
];

export default function CityHopperBadge() {
  const { bookmarkedIds } = useBookmarks();

  const { badge, cities, cityCount } = useMemo(() => {
    const bookmarked = data.events.filter(e => bookmarkedIds.has(e.id));
    const citySet = new Set(bookmarked.map(e => e.city).filter(Boolean));
    const count = citySet.size;
    const earned = [...BADGES].reverse().find(b => count >= b.minCities) || null;
    return { badge: earned, cities: Array.from(citySet), cityCount: count };
  }, [bookmarkedIds]);

  if (!badge || bookmarkedIds.size === 0) return null;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badge.bg} ${badge.border}`}>
      <span className="text-base">{badge.emoji}</span>
      <div>
        <div className={`text-xs font-bold ${badge.color}`}>{badge.name}</div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400">{cityCount} cities: {cities.slice(0, 4).join(", ")}{cities.length > 4 ? ` +${cities.length - 4}` : ""}</div>
      </div>
    </div>
  );
}
