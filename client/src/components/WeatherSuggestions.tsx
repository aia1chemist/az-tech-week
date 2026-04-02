/*
 * WeatherSuggestions — Weather-aware event recommendations
 * Supports inline mode for compact display inside day context bar
 */
import { Sun } from "lucide-react";

// AZ weather data for April 6-12, 2026 (typical early April)
const WEATHER: Record<string, { high: number; low: number; condition: string; icon: string; uv: number }> = {
  "Monday, April 6": { high: 89, low: 64, condition: "Sunny", icon: "☀️", uv: 9 },
  "Tuesday, April 7": { high: 91, low: 66, condition: "Sunny", icon: "☀️", uv: 9 },
  "Wednesday, April 8": { high: 93, low: 67, condition: "Hot & Sunny", icon: "🔥", uv: 10 },
  "Thursday, April 9": { high: 90, low: 65, condition: "Partly Cloudy", icon: "⛅", uv: 8 },
  "Friday, April 10": { high: 87, low: 63, condition: "Pleasant", icon: "🌤️", uv: 7 },
  "Saturday, April 11": { high: 85, low: 62, condition: "Nice", icon: "🌤️", uv: 7 },
  "Sunday, April 12": { high: 88, low: 64, condition: "Sunny", icon: "☀️", uv: 8 },
};

interface WeatherSuggestionsProps {
  selectedDay: string;
  inline?: boolean;
}

export default function WeatherSuggestions({ selectedDay, inline }: WeatherSuggestionsProps) {
  const weather = WEATHER[selectedDay];
  if (!weather) return null;

  const isHot = weather.high >= 90;
  const highUV = weather.uv >= 9;

  if (inline) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">
        <span className="text-sm">{weather.icon}</span>
        <span className={`font-semibold ${isHot ? "text-amber-600 dark:text-amber-400" : "text-gray-800 dark:text-gray-200"}`}>
          {weather.high}°/{weather.low}°
        </span>
        <span className="text-gray-400 dark:text-gray-500">{weather.condition}</span>
        {highUV && (
          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
            <Sun className="w-2 h-2" /> UV {weather.uv}
          </span>
        )}
      </div>
    );
  }

  const isVeryHot = weather.high >= 95;

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
        isVeryHot
          ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40"
          : isHot
          ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40"
          : "bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-800/40"
      }`}>
        <span className="text-lg flex-shrink-0">{weather.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold ${
              isVeryHot ? "text-red-700 dark:text-red-300" : isHot ? "text-amber-700 dark:text-amber-300" : "text-sky-700 dark:text-sky-300"
            }`}>
              {weather.high}°F / {weather.low}°F
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{weather.condition}</span>
            {highUV && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700">
                <Sun className="w-2.5 h-2.5" /> UV {weather.uv}
              </span>
            )}
          </div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            {isVeryHot
              ? "🥵 Extreme heat — prioritize indoor events, bring water, wear sunscreen"
              : isHot
              ? "☀️ Hot day — stay hydrated, outdoor events may be intense in the afternoon"
              : "🌤️ Pleasant weather — great for outdoor events and walking between venues"}
          </div>
        </div>
      </div>
    </div>
  );
}
