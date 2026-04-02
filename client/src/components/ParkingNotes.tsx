/*
 * ParkingNotes — Crowdsourced parking & venue tips per city
 * Shows contextual tips based on the user's bookmarked event cities
 */
import { useMemo, useState } from "react";
import { Car, ChevronDown, ChevronUp, MapPin, Info } from "lucide-react";
import eventsData from "@/data/events.json";
import type { EventsData } from "@/data/types";
import { useBookmarks } from "@/contexts/BookmarkContext";

const data = eventsData as EventsData;

interface CityTip {
  city: string;
  emoji: string;
  parking: string;
  transit: string;
  food: string;
  tip: string;
}

const CITY_TIPS: CityTip[] = [
  {
    city: "Phoenix",
    emoji: "🌵",
    parking: "Free parking at most venues. Downtown Phoenix: use garage at 1st & Washington ($5/day) or street meters (free after 5pm).",
    transit: "Valley Metro Light Rail runs through downtown. Ride share is cheap ($8-15 to most venues).",
    food: "Grab lunch at The Churchill or Civic Space — walkable from most downtown venues.",
    tip: "Downtown events cluster near Roosevelt Row and the Innovation District.",
  },
  {
    city: "Scottsdale",
    emoji: "⛳",
    parking: "Most venues have free lots. Old Town Scottsdale: use the free public garage at Scottsdale & Main.",
    transit: "No light rail — plan on driving or ride share. Scottsdale Trolley is free but limited routes.",
    food: "Lots of restaurants along Scottsdale Road. Farm & Craft and Citizen Public House are tech crowd favorites.",
    tip: "Events tend to be more upscale. Business casual is safe for most Scottsdale venues.",
  },
  {
    city: "Tempe",
    emoji: "🎓",
    parking: "ASU campus parking is tricky — use the Rural/Apache garage ($3/hr). Mill Ave has paid lots ($5-10).",
    transit: "Light Rail stops at University/Rural and Mill/3rd. Best connected city for transit.",
    food: "Mill Avenue has tons of options. Four Peaks Brewery is a local institution.",
    tip: "Walking distance between most Tempe venues. Great for hitting multiple events in a day.",
  },
  {
    city: "Mesa",
    emoji: "🏙️",
    parking: "Generally easy and free. Downtown Mesa has free 2-hour street parking.",
    transit: "Light Rail extends to Mesa. Gilbert Road station is closest to most venues.",
    food: "Check out the Mesa food scene on Main Street — surprisingly good and affordable.",
    tip: "Mesa is more spread out than Tempe/Phoenix. Budget extra drive time between venues.",
  },
  {
    city: "Tucson",
    emoji: "🏜️",
    parking: "UA campus: use the Tyndall Ave garage ($8/day). Most off-campus venues have free lots.",
    transit: "SunLink streetcar runs through downtown and UA campus. Otherwise plan on driving.",
    food: "Tucson is a UNESCO City of Gastronomy — don't skip the food. El Charro and Mi Nidito are classics.",
    tip: "It's a 90-min drive from Phoenix. Consider staying overnight if you have multiple Tucson events.",
  },
  {
    city: "Chandler",
    emoji: "🏢",
    parking: "Free parking everywhere. Most tech venues are in office parks with large lots.",
    transit: "No light rail — driving or ride share only. Close to Tempe and Gilbert.",
    food: "Downtown Chandler has great restaurants. SanTan Brewing is popular for after-event drinks.",
    tip: "Home to Intel, Microchip, and other tech HQs. Manufacturing and hardware events cluster here.",
  },
  {
    city: "Gilbert",
    emoji: "🌾",
    parking: "Easy and free. Heritage District has ample street and lot parking.",
    transit: "No public transit — driving only. 15-20 min from Tempe/Chandler.",
    food: "Heritage District (Gilbert & Elliot) has a great restaurant scene. Joe's Farm Grill is iconic.",
    tip: "Gilbert is growing fast in the tech scene. Smaller, more intimate events here.",
  },
];

export default function ParkingNotes() {
  const { bookmarkedIds } = useBookmarks();
  const [expanded, setExpanded] = useState(false);

  const relevantCities = useMemo(() => {
    const bookmarked = data.events.filter(e => bookmarkedIds.has(e.id));
    const cities = new Set(bookmarked.map(e => e.city).filter(Boolean));
    if (cities.size === 0) return CITY_TIPS.slice(0, 3); // Show top 3 by default
    return CITY_TIPS.filter(t => cities.has(t.city));
  }, [bookmarkedIds]);

  if (relevantCities.length === 0) return null;

  const displayCities = expanded ? relevantCities : relevantCities.slice(0, 2);

  return (
    <section className="max-w-6xl mx-auto px-4 py-3">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Parking & Venue Tips</h3>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {bookmarkedIds.size > 0 ? "Based on your bookmarks" : "Top cities"}
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {displayCities.map(city => (
            <div key={city.city} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{city.emoji}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{city.city}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex gap-2">
                  <Car className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{city.parking}</p>
                </div>
                <div className="flex gap-2">
                  <MapPin className="w-3 h-3 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{city.transit}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[11px] mt-0.5 flex-shrink-0">🍽️</span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{city.food}</p>
                </div>
                <div className="flex gap-2">
                  <Info className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{city.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {relevantCities.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 px-4 py-2 text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 transition-colors"
          >
            {expanded ? <>Show less <ChevronUp className="w-3 h-3" /></> : <>Show all {relevantCities.length} cities <ChevronDown className="w-3 h-3" /></>}
          </button>
        )}
      </div>
    </section>
  );
}
