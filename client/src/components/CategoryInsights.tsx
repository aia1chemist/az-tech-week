/*
 * Category Insights — Fun data-driven insights about event categories
 * "AI events are 3x more popular than average"
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Users, Zap } from "lucide-react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { CATEGORY_ICONS } from "@/data/types";

const data = eventsData as EventsData;

interface Insight {
  icon: string;
  text: string;
  lucideIcon: typeof TrendingUp;
  color: string;
}

function computeInsights(): Insight[] {
  const events = data.events as Event[];
  const insights: Insight[] = [];

  // Category popularity
  const catStats: Record<string, { count: number; going: number; soldOut: number }> = {};
  events.forEach((e) => {
    e.categories.forEach((c) => {
      if (!catStats[c]) catStats[c] = { count: 0, going: 0, soldOut: 0 };
      catStats[c].count++;
      catStats[c].going += e.going;
      if (e.sold_out) catStats[c].soldOut++;
    });
  });

  const avgGoing = events.reduce((s, e) => s + e.going, 0) / events.length;
  const entries = Object.entries(catStats).sort((a, b) => b[1].going - a[1].going);

  // Most popular by attendance
  if (entries.length > 0) {
    const [topCat, topData] = entries[0];
    const avgCatGoing = topData.going / topData.count;
    const multiplier = avgGoing > 0 ? Math.round(avgCatGoing / avgGoing) : 1;
    if (multiplier >= 2) {
      insights.push({
        icon: CATEGORY_ICONS[topCat] || "🔥",
        text: `${topCat} events have ${multiplier}x more attendees than average`,
        lucideIcon: TrendingUp,
        color: "text-orange-600",
      });
    }
  }

  // Most sold out category
  const soldOutCats = entries.filter(([, d]) => d.soldOut > 0).sort((a, b) => b[1].soldOut - a[1].soldOut);
  if (soldOutCats.length > 0) {
    const [cat, d] = soldOutCats[0];
    insights.push({
      icon: CATEGORY_ICONS[cat] || "🔥",
      text: `${d.soldOut} ${cat} event${d.soldOut !== 1 ? "s" : ""} already sold out`,
      lucideIcon: Flame,
      color: "text-red-600",
    });
  }

  // Biggest category by event count
  const biggest = entries.sort((a, b) => b[1].count - a[1].count)[0];
  if (biggest) {
    insights.push({
      icon: CATEGORY_ICONS[biggest[0]] || "📊",
      text: `${biggest[0]} leads with ${biggest[1].count} events`,
      lucideIcon: Users,
      color: "text-teal-600",
    });
  }

  // Evening events insight
  const eveningCount = events.filter((e) => e.time_of_day === "Evening").length;
  const eveningPct = Math.round((eveningCount / events.length) * 100);
  if (eveningPct > 30) {
    insights.push({
      icon: "🌙",
      text: `${eveningPct}% of events are evening networking sessions`,
      lucideIcon: Zap,
      color: "text-purple-600",
    });
  }

  return insights.slice(0, 3);
}

export default function CategoryInsights() {
  const insights = useMemo(computeInsights, []);

  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="max-w-lg mx-auto mt-4"
    >
      <div className="flex flex-col gap-1.5">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.15 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/10"
          >
            <span className="text-sm">{insight.icon}</span>
            <insight.lucideIcon className={`w-3 h-3 ${insight.color} opacity-80`} />
            <span className="text-[11px] text-white/90 font-medium">{insight.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
