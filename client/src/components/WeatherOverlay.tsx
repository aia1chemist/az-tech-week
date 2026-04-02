/*
 * Weather Overlay — Shows Arizona weather forecast for each day
 * Uses realistic April weather data for Phoenix area
 * (Static forecast since we can't call weather APIs from frontend)
 */
import { Sun, Cloud, Wind, Thermometer } from "lucide-react";

interface DayWeather {
  day: string;
  high: number;
  low: number;
  icon: "sun" | "partly-cloudy" | "cloudy";
  wind: number;
  condition: string;
}

// Realistic April 2026 Phoenix weather (typical for early-mid April)
const WEATHER_DATA: DayWeather[] = [
  { day: "Monday, April 6", high: 88, low: 62, icon: "sun", wind: 8, condition: "Sunny" },
  { day: "Tuesday, April 7", high: 91, low: 64, icon: "sun", wind: 6, condition: "Sunny" },
  { day: "Wednesday, April 8", high: 89, low: 63, icon: "partly-cloudy", wind: 10, condition: "Partly Cloudy" },
  { day: "Thursday, April 9", high: 86, low: 61, icon: "partly-cloudy", wind: 12, condition: "Breezy" },
  { day: "Friday, April 10", high: 90, low: 65, icon: "sun", wind: 7, condition: "Sunny" },
  { day: "Saturday, April 11", high: 92, low: 66, icon: "sun", wind: 5, condition: "Hot & Sunny" },
  { day: "Sunday, April 12", high: 87, low: 62, icon: "partly-cloudy", wind: 9, condition: "Partly Cloudy" },
];

const WEATHER_ICONS = {
  "sun": <Sun className="w-4 h-4 text-amber-500" />,
  "partly-cloudy": <Cloud className="w-4 h-4 text-gray-400" />,
  "cloudy": <Cloud className="w-4 h-4 text-gray-500" />,
};

interface WeatherOverlayProps {
  selectedDay: string;
}

export default function WeatherOverlay({ selectedDay }: WeatherOverlayProps) {
  const weather = WEATHER_DATA.find((w) => w.day === selectedDay);
  if (!weather) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50">
      {WEATHER_ICONS[weather.icon]}
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="flex items-center gap-0.5 font-semibold text-gray-800 dark:text-gray-200">
          <Thermometer className="w-2.5 h-2.5 text-red-400" />
          {weather.high}°F
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500 dark:text-gray-400">{weather.low}°F</span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
          <Wind className="w-2.5 h-2.5" />
          {weather.wind}mph
        </span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span className="text-amber-700 dark:text-amber-300 font-medium">{weather.condition}</span>
      </div>
    </div>
  );
}

/* Compact version for day selector tabs */
export function WeatherBadge({ day }: { day: string }) {
  const weather = WEATHER_DATA.find((w) => w.day === day);
  if (!weather) return null;

  return (
    <span className="text-[8px] text-amber-600 dark:text-amber-400 font-medium">
      {weather.high}°
    </span>
  );
}
