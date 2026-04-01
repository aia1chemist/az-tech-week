/*
 * Bottom Navigation Bar — Floating pill with quick access to all features
 * My Schedule, Happening Now, Venue Clusters, Organizers
 */
import { motion } from "framer-motion";
import { Heart, Radio, MapPin, User, Sparkles } from "lucide-react";
import { useBookmarks } from "@/contexts/BookmarkContext";

interface BottomNavProps {
  onOpenSchedule: () => void;
  onOpenHappeningNow: () => void;
  onOpenVenueClusters: () => void;
  onOpenOrganizers: () => void;
}

export default function BottomNav({
  onOpenSchedule,
  onOpenHappeningNow,
  onOpenVenueClusters,
  onOpenOrganizers,
}: BottomNavProps) {
  const { count } = useBookmarks();

  const items = [
    {
      label: "Live",
      Icon: Radio,
      onClick: onOpenHappeningNow,
      color: "text-green-600",
      bgActive: "bg-green-50",
      badge: null,
      pulse: true,
    },
    {
      label: "Schedule",
      Icon: Heart,
      onClick: onOpenSchedule,
      color: "text-pink-500",
      bgActive: "bg-pink-50",
      badge: count > 0 ? count : null,
      pulse: false,
    },
    {
      label: "Venues",
      Icon: MapPin,
      onClick: onOpenVenueClusters,
      color: "text-blue-600",
      bgActive: "bg-blue-50",
      badge: null,
      pulse: false,
    },
    {
      label: "Hosts",
      Icon: User,
      onClick: onOpenOrganizers,
      color: "text-purple-600",
      bgActive: "bg-purple-50",
      badge: null,
      pulse: false,
    },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.5 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-white/95 backdrop-blur-lg border border-gray-200 shadow-xl shadow-gray-300/30">
        {items.map(({ label, Icon, onClick, color, bgActive, badge, pulse }) => (
          <button
            key={label}
            onClick={onClick}
            className={`relative flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-xl transition-all hover:${bgActive} active:scale-95 group`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
              {pulse && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
              )}
              {badge !== null && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
