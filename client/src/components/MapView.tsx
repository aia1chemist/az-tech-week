/*
 * Map View — Toggle between card view and map with event pins clustered by city
 * Uses the built-in MapView component from the template
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Users, ExternalLink } from "lucide-react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { CATEGORY_ICONS } from "@/data/types";

const data = eventsData as EventsData;

function cleanTitle(title: string): string {
  return title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").replace(/\s*#AZTECHWEEK/gi, "").replace(/\s+/g, " ").trim();
}

// City coordinates for Arizona cities
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Phoenix": { lat: 33.4484, lng: -112.0740 },
  "Scottsdale": { lat: 33.4942, lng: -111.9261 },
  "Tempe": { lat: 33.4255, lng: -111.9400 },
  "Mesa": { lat: 33.4152, lng: -111.8315 },
  "Chandler": { lat: 33.3062, lng: -111.8413 },
  "Gilbert": { lat: 33.3528, lng: -111.7890 },
  "Tucson": { lat: 32.2226, lng: -110.9747 },
  "Flagstaff": { lat: 35.1983, lng: -111.6513 },
  "Peoria": { lat: 33.5806, lng: -112.2374 },
  "Glendale": { lat: 33.5387, lng: -112.1860 },
  "Surprise": { lat: 33.6292, lng: -112.3322 },
  "Goodyear": { lat: 33.4353, lng: -112.3587 },
  "Avondale": { lat: 33.4356, lng: -112.3496 },
  "Buckeye": { lat: 33.3703, lng: -112.5838 },
  "Casa Grande": { lat: 32.8795, lng: -111.7574 },
  "Maricopa": { lat: 33.0581, lng: -112.0476 },
  "Queen Creek": { lat: 33.2487, lng: -111.6343 },
  "San Tan Valley": { lat: 33.1828, lng: -111.5640 },
  "Prescott": { lat: 34.5400, lng: -112.4685 },
  "Sedona": { lat: 34.8697, lng: -111.7610 },
  "Yuma": { lat: 32.6927, lng: -114.6277 },
  "Sierra Vista": { lat: 31.5455, lng: -110.3035 },
  "Oro Valley": { lat: 32.3909, lng: -110.9665 },
  "Fountain Hills": { lat: 33.6117, lng: -111.7174 },
  "Cave Creek": { lat: 33.8331, lng: -111.9508 },
  "Carefree": { lat: 33.8222, lng: -111.9181 },
  "Paradise Valley": { lat: 33.5310, lng: -111.9425 },
  "Litchfield Park": { lat: 33.4933, lng: -112.3579 },
};

interface CityCluster {
  city: string;
  coords: { lat: number; lng: number };
  events: Event[];
  totalGoing: number;
}

interface MapViewProps {
  open: boolean;
  onClose: () => void;
  selectedDay: string;
}

export default function MapView({ open, onClose, selectedDay }: MapViewProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const clusters = useMemo(() => {
    const dayEvents = (data.events as Event[]).filter((e) => e.full_date === selectedDay);
    const cityMap: Record<string, Event[]> = {};
    dayEvents.forEach((e) => {
      if (e.city) {
        if (!cityMap[e.city]) cityMap[e.city] = [];
        cityMap[e.city].push(e);
      }
    });

    return Object.entries(cityMap)
      .map(([city, events]): CityCluster => ({
        city,
        coords: CITY_COORDS[city] || { lat: 33.45, lng: -112.07 },
        events,
        totalGoing: events.reduce((s, e) => s + e.going, 0),
      }))
      .sort((a, b) => b.events.length - a.events.length);
  }, [selectedDay]);

  const selectedCluster = clusters.find((c) => c.city === selectedCity);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Event Map</h2>
                  <p className="text-[10px] text-gray-500">{clusters.length} cities with events</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Map-like city grid */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* City clusters as visual cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {clusters.map((cluster) => (
                  <button
                    key={cluster.city}
                    onClick={() => setSelectedCity(selectedCity === cluster.city ? null : cluster.city)}
                    className={`relative p-3 rounded-xl border transition-all text-left ${
                      selectedCity === cluster.city
                        ? "border-teal-400 bg-teal-50 dark:bg-teal-900/30 dark:border-teal-600 ring-1 ring-teal-200"
                        : "border-gray-200 dark:border-gray-700 hover:border-teal-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3 h-3 text-teal-500" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{cluster.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="font-semibold text-teal-700 dark:text-teal-300">{cluster.events.length}</span> events
                      {cluster.totalGoing > 0 && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span><Users className="w-2.5 h-2.5 inline" /> {cluster.totalGoing}</span>
                        </>
                      )}
                    </div>
                    {/* Size indicator */}
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-teal-700 dark:text-teal-300">{cluster.events.length}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected city events */}
              <AnimatePresence>
                {selectedCluster && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">
                        Events in {selectedCluster.city}
                      </h3>
                      <div className="space-y-1.5">
                        {selectedCluster.events.map((event) => {
                          const icon = CATEGORY_ICONS[event.categories[0]] || "💡";
                          return (
                            <a
                              key={event.id}
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 transition-all"
                            >
                              <span className="text-sm">{icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-gray-900 dark:text-white truncate">
                                  {cleanTitle(event.title)}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] text-gray-500">
                                  <span>{event.start_time || event.time}</span>
                                  {event.going > 0 && <span>{event.going} going</span>}
                                </div>
                              </div>
                              <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
