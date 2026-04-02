/*
 * ScheduleRoast — Tongue-in-cheek analysis of the user's bookmarked schedule
 * Generates funny, shareable commentary based on their event picks
 */
import { useMemo } from "react";
import { Flame, Share2, Trophy, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

interface Roast {
  emoji: string;
  title: string;
  text: string;
  severity: "mild" | "medium" | "spicy";
}

function generateRoasts(bookmarkedEvents: typeof data.events): Roast[] {
  const roasts: Roast[] = [];
  const cats: Record<string, number> = {};
  const cities: Record<string, number> = {};
  const times: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0 };
  const days: Record<string, number> = {};

  for (const e of bookmarkedEvents) {
    for (const c of e.categories) cats[c] = (cats[c] || 0) + 1;
    if (e.city) cities[e.city] = (cities[e.city] || 0) + 1;
    times[e.time_of_day] = (times[e.time_of_day] || 0) + 1;
    days[e.full_date] = (days[e.full_date] || 0) + 1;
  }

  const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0];
  const busiestDay = Object.entries(days).sort((a, b) => b[1] - a[1])[0];
  const totalEvents = bookmarkedEvents.length;

  // Category obsession
  if (topCat && topCat[1] >= 3) {
    const catRoasts: Record<string, string> = {
      "AI & Machine Learning": "You picked {n} AI events. We get it, you want robots to do your job. Same.",
      "Startups & Entrepreneurship": "With {n} startup events, you're either building the next unicorn or collecting free pizza. No judgment.",
      "Networking & Social": "You have {n} networking events. Are you building connections or just avoiding your inbox?",
      "Investing & VC": "{n} investor events? You're either raising a round or really enjoy saying 'what's your TAM?'",
      "Blockchain & Crypto": "{n} crypto events. Bold strategy in 2026. We respect the commitment.",
      "Health & Biotech": "{n} health tech events. You're either saving lives or have a really intense Fitbit habit.",
      "Space & Aerospace": "{n} space events. Houston, we have a fanboy.",
      "Cybersecurity": "{n} cybersecurity events. You probably use a different password for everything. We're impressed.",
    };
    const template = catRoasts[topCat[0]] || `You picked {n} ${topCat[0]} events. That's... a personality trait at this point.`;
    roasts.push({
      emoji: "🎯",
      title: "Category Obsession",
      text: template.replace("{n}", String(topCat[1])),
      severity: topCat[1] >= 5 ? "spicy" : "medium",
    });
  }

  // No networking events
  if (!cats["Networking & Social"] || cats["Networking & Social"] === 0) {
    roasts.push({
      emoji: "🙈",
      title: "Introvert Alert",
      text: "Zero networking events? Are you planning to attend AZ Tech Week from your couch? The whole point is meeting people!",
      severity: "spicy",
    });
  }

  // All evening events
  if (times.Evening > totalEvents * 0.6 && totalEvents >= 3) {
    roasts.push({
      emoji: "🦉",
      title: "Night Owl",
      text: `${times.Evening} out of ${totalEvents} events are in the evening. You're basically a vampire who codes.`,
      severity: "medium",
    });
  }

  // All morning events
  if (times.Morning > totalEvents * 0.5 && totalEvents >= 3) {
    roasts.push({
      emoji: "🐓",
      title: "Early Bird",
      text: `${times.Morning} morning events? You're the person who shows up 15 minutes early to everything. We see you.`,
      severity: "mild",
    });
  }

  // Too many events in one day
  if (busiestDay && busiestDay[1] >= 5) {
    roasts.push({
      emoji: "🏃",
      title: "Overachiever",
      text: `${busiestDay[1]} events on one day? That's not a schedule, that's a marathon. Bring snacks.`,
      severity: "spicy",
    });
  }

  // Single city loyalty
  if (topCity && topCity[1] === totalEvents && totalEvents >= 3) {
    roasts.push({
      emoji: "📍",
      title: "Hometown Hero",
      text: `All ${totalEvents} events in ${topCity[0]}? Arizona has other cities, you know. Some of them even have events.`,
      severity: "medium",
    });
  }

  // Multi-city chaos
  const cityCount = Object.keys(cities).length;
  if (cityCount >= 4) {
    roasts.push({
      emoji: "🗺️",
      title: "Road Warrior",
      text: `${cityCount} different cities? Your Uber driver is going to need therapy. And a raise.`,
      severity: "medium",
    });
  }

  // Too few events
  if (totalEvents <= 2) {
    roasts.push({
      emoji: "😴",
      title: "Minimalist",
      text: `Only ${totalEvents} event${totalEvents === 1 ? "" : "s"}? There are 414 events and you picked ${totalEvents}. That's not curating, that's barely participating.`,
      severity: "spicy",
    });
  }

  // Way too many events
  if (totalEvents >= 20) {
    roasts.push({
      emoji: "🤯",
      title: "FOMO Level: Maximum",
      text: `${totalEvents} events bookmarked?! You know you can't clone yourself, right? ...Right?`,
      severity: "spicy",
    });
  }

  // No waitlisted events
  const waitlisted = bookmarkedEvents.filter(e => e.sold_out).length;
  if (waitlisted >= 3) {
    roasts.push({
      emoji: "🎰",
      title: "Eternal Optimist",
      text: `${waitlisted} of your picks are waitlisted. You're the person who buys lottery tickets 'as an investment strategy.'`,
      severity: "medium",
    });
  }

  // Compliment
  if (totalEvents >= 5 && cityCount >= 2 && Object.keys(cats).length >= 3) {
    roasts.push({
      emoji: "👑",
      title: "Actually Great Taste",
      text: "OK real talk — diverse categories, multiple cities, good mix of times. You actually know what you're doing. Respect.",
      severity: "mild",
    });
  }

  return roasts.slice(0, 4);
}

export default function ScheduleRoast() {
  const { bookmarkedIds } = useBookmarks();
  const bookmarkedEvents = useMemo(
    () => data.events.filter(e => bookmarkedIds.has(e.id)),
    [bookmarkedIds]
  );

  const roasts = useMemo(() => generateRoasts(bookmarkedEvents), [bookmarkedEvents]);

  if (bookmarkedEvents.length === 0) return null;

  const handleShare = () => {
    const text = `My AZ Tech Week Schedule Roast 🔥\n\n${roasts.map(r => `${r.emoji} ${r.title}: ${r.text}`).join("\n\n")}\n\nGet roasted at aztechweek.manus.space`;
    if (navigator.share) {
      navigator.share({ title: "My AZ Tech Week Roast", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => toast.success("Roast copied!")).catch(() => {});
    }
  };

  const severityColors = {
    mild: "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800",
    medium: "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800",
    spicy: "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800",
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-3">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Schedule Roast</h3>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">Based on your {bookmarkedEvents.length} bookmarks</span>
          </div>
          <button onClick={handleShare} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {roasts.map((roast, i) => (
            <div key={i} className={`p-3 rounded-lg border ${severityColors[roast.severity]}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{roast.emoji}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{roast.title}</span>
                {roast.severity === "spicy" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">🌶️ SPICY</span>}
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{roast.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
