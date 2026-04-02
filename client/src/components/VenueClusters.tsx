/*
 * Venue Clustering — Group events by city with counts, capacity stats, and quick filter
 * Shows a visual map-like grid of cities with event density
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, ChevronRight, Users, Flame, ChevronDown, ChevronUp, Info } from "lucide-react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import VenueInfoPanel from "./VenueInfo";

const data = eventsData as EventsData;

interface CityCluster {
  city: string;
  events: number;
  going: number;
  categories: string[];
  fillingUp: number;
  topEvent: string;
}

interface VenueClustersProps {
  open: boolean;
  onClose: () => void;
  onFilterCity: (city: string) => void;
  selectedDay: string;
}

export default function VenueClusters({ open, onClose, onFilterCity, selectedDay }: VenueClustersProps) {
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const clusters = useMemo(() => {
    const dayEvents = (data.events as Event[]).filter((e) => e.full_date === selectedDay);
    const cityMap: Record<string, { events: Event[] }> = {};

    dayEvents.forEach((e) => {
      if (!e.city) return;
      if (!cityMap[e.city]) cityMap[e.city] = { events: [] };
      cityMap[e.city].events.push(e);
    });

    return Object.entries(cityMap)
      .map(([city, { events }]): CityCluster => {
        const going = events.reduce((sum, e) => sum + (e.going || 0), 0);
        const cats = Array.from(new Set(events.flatMap((e) => e.categories)));
        const fillingUp = events.filter((e) => (e.spots_left >= 0 && e.spots_left <= 10) || e.sold_out).length;
        const topEvent = events.sort((a, b) => (b.going || 0) - (a.going || 0))[0]?.title || "";
        return { city, events: events.length, going, categories: cats.slice(0, 3), fillingUp, topEvent };
      })
      .sort((a, b) => b.events - a.events);
  }, [selectedDay]);

  const maxEvents = Math.max(...clusters.map((c) => c.events), 1);

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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] bg-white rounded-t-2xl shadow-2xl flex flex-col"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Venue Clusters</h2>
                  <p className="text-[10px] text-gray-500">{clusters.length} cities with events today</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {clusters.map((cluster, i) => {
                const intensity = cluster.events / maxEvents;
                return (
                  <div key={cluster.city}>
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { onFilterCity(cluster.city); onClose(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
                  >
                    {/* Intensity indicator */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border flex-shrink-0"
                      style={{
                        backgroundColor: intensity > 0.6 ? "#0d9488" : intensity > 0.3 ? "#5eead4" : "#ccfbf1",
                        borderColor: intensity > 0.6 ? "#0f766e" : intensity > 0.3 ? "#14b8a6" : "#99f6e4",
                        color: intensity > 0.5 ? "white" : "#0f766e",
                      }}
                    >
                      {cluster.events}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{cluster.city}</span>
                        {cluster.fillingUp > 0 && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-orange-600">
                            <Flame className="w-2.5 h-2.5" /> {cluster.fillingUp} hot
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        {cluster.going > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5" /> {cluster.going} going
                          </span>
                        )}
                        <span className="truncate">{cluster.categories.join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedCity(expandedCity === cluster.city ? null : cluster.city); }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-teal-500 transition-all"
                        title="City info"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                  </motion.button>
                  {/* Expandable venue info */}
                  <AnimatePresence>
                    {expandedCity === cluster.city && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden -mt-1 mb-1 ml-2 mr-2"
                      >
                        <div className="p-2 rounded-b-lg border border-t-0 border-gray-200 bg-gray-50">
                          <VenueInfoPanel city={cluster.city} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
