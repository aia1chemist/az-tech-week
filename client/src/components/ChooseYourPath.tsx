/*
 * ChooseYourPath — Visual section presenting 3 discovery modes:
 * 1. Plan My Day (AI-optimized itinerary)
 * 2. Curated Tracks (quick-start bundles)
 * 3. Browse All (pick your own)
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Layers,
  Search,
  ChevronDown,
  ArrowRight,
  Zap,
  Clock,
  Compass,
} from "lucide-react";

interface ChooseYourPathProps {
  onOpenPlanMyDay: () => void;
  onShowTracks: () => void;
  onScrollToEvents: () => void;
}

export default function ChooseYourPath({
  onOpenPlanMyDay,
  onShowTracks,
  onScrollToEvents,
}: ChooseYourPathProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const paths = [
    {
      id: "plan",
      icon: Sparkles,
      title: "Plan My Day",
      subtitle: "AI-optimized itinerary",
      description:
        "Pick a day and your interests — we'll build an optimized schedule with travel time between cities factored in.",
      accent: "teal",
      gradient: "from-teal-500 to-emerald-500",
      lightBg: "bg-teal-50",
      border: "border-teal-200",
      hoverBorder: "hover:border-teal-400",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      textColor: "text-teal-700",
      badge: "Recommended",
      badgeBg: "bg-teal-100 text-teal-700",
      tag: Clock,
      tagLabel: "~2 min setup",
      action: onOpenPlanMyDay,
      actionLabel: "Start Planning",
    },
    {
      id: "tracks",
      icon: Layers,
      title: "Curated Tracks",
      subtitle: "Quick-start bundles",
      description:
        "Don't know where to start? Pick a pre-built track like AI, Founders, or Networking and bookmark the whole thing.",
      accent: "amber",
      gradient: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-50",
      border: "border-amber-200",
      hoverBorder: "hover:border-amber-400",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
      badge: "6 tracks",
      badgeBg: "bg-amber-100 text-amber-700",
      tag: Zap,
      tagLabel: "One-click save",
      action: onShowTracks,
      actionLabel: "Browse Tracks",
    },
    {
      id: "browse",
      icon: Search,
      title: "Browse All Events",
      subtitle: "Pick your own",
      description:
        "Filter by day, city, category, or keyword. Sort by popularity or time. Build your schedule event by event.",
      accent: "violet",
      gradient: "from-violet-500 to-purple-500",
      lightBg: "bg-violet-50",
      border: "border-violet-200",
      hoverBorder: "hover:border-violet-400",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      textColor: "text-violet-700",
      badge: "414+ events",
      badgeBg: "bg-violet-100 text-violet-700",
      tag: Compass,
      tagLabel: "Full control",
      action: onScrollToEvents,
      actionLabel: "Explore Events",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      {/* Section header */}
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          How do you want to explore?
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Choose your path to build the perfect AZ Tech Week schedule
        </p>
      </div>

      {/* 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paths.map((path, index) => {
          const Icon = path.icon;
          const TagIcon = path.tag;
          const isHovered = hoveredCard === path.id;

          return (
            <motion.button
              key={path.id}
              onClick={path.action}
              onMouseEnter={() => setHoveredCard(path.id)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`relative group text-left rounded-2xl border-2 ${path.border} ${path.hoverBorder} ${path.lightBg} dark:bg-gray-800/60 dark:border-gray-700 dark:hover:border-gray-500 p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer`}
            >
              {/* Step number */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${path.badgeBg} dark:bg-gray-700 dark:text-gray-300`}>
                  {path.badge}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${path.iconBg} dark:bg-gray-700 flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${path.iconColor} dark:text-gray-300`} />
              </div>

              {/* Title + subtitle */}
              <h3 className={`text-sm font-bold ${path.textColor} dark:text-white`}>
                {path.title}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-2">
                {path.subtitle}
              </p>

              {/* Description */}
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                {path.description}
              </p>

              {/* Tag */}
              <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mb-3">
                <TagIcon className="w-3 h-3" />
                <span>{path.tagLabel}</span>
              </div>

              {/* CTA */}
              <div className={`flex items-center gap-1.5 text-xs font-bold ${path.textColor} dark:text-gray-200 group-hover:gap-2.5 transition-all`}>
                <span>{path.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
