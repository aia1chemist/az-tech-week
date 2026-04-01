/*
 * Organizer Profiles — Shows top organizers with event counts, categories, and links
 */
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, ChevronRight, Calendar, MapPin, Star } from "lucide-react";
import eventsData from "@/data/events.json";
import type { Event, EventsData } from "@/data/types";
import { CATEGORY_ICONS } from "@/data/types";

const data = eventsData as EventsData;

interface OrganizerData {
  name: string;
  eventCount: number;
  totalGoing: number;
  cities: string[];
  categories: string[];
  days: string[];
  events: Event[];
}

interface OrganizerProfilesProps {
  open: boolean;
  onClose: () => void;
  onSearchOrganizer: (name: string) => void;
}

export default function OrganizerProfiles({ open, onClose, onSearchOrganizer }: OrganizerProfilesProps) {
  const organizers = useMemo(() => {
    const orgMap: Record<string, OrganizerData> = {};

    (data.events as Event[]).forEach((e) => {
      const name = e.organizer;
      if (!orgMap[name]) {
        orgMap[name] = { name, eventCount: 0, totalGoing: 0, cities: [], categories: [], days: [], events: [] };
      }
      orgMap[name].eventCount += 1;
      orgMap[name].totalGoing += e.going || 0;
      orgMap[name].events.push(e);
      if (e.city && !orgMap[name].cities.includes(e.city)) orgMap[name].cities.push(e.city);
      e.categories.forEach((c) => { if (!orgMap[name].categories.includes(c)) orgMap[name].categories.push(c); });
      if (!orgMap[name].days.includes(e.full_date)) orgMap[name].days.push(e.full_date);
    });

    return Object.values(orgMap)
      .filter((o) => o.eventCount >= 2)
      .sort((a, b) => b.eventCount - a.eventCount || b.totalGoing - a.totalGoing);
  }, []);

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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] bg-white rounded-t-2xl shadow-2xl flex flex-col"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Top Organizers</h2>
                  <p className="text-[10px] text-gray-500">{organizers.length} organizers with 2+ events</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {organizers.map((org, i) => {
                const topCats = org.categories.slice(0, 3);
                return (
                  <motion.button
                    key={org.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => { onSearchOrganizer(org.name); onClose(); }}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left group"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-sm font-bold text-purple-600 flex-shrink-0 border border-purple-200">
                      {org.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{org.name}</span>
                        {org.eventCount >= 5 && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-bold border border-amber-200">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> Power Host
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" /> {org.eventCount} events
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {org.cities.slice(0, 2).join(", ")}
                        </span>
                        {org.totalGoing > 0 && (
                          <span>{org.totalGoing} going</span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {topCats.map((cat) => {
                          const icon = CATEGORY_ICONS[cat] || "\u{1F4A1}";
                          return (
                            <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              {icon} {cat}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0 mt-2" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
