/*
 * Design: Copper Circuit — Warm hero with desert tech imagery
 * Compact on mobile, shows key stats, scrolls to content
 */
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Sparkles, ChevronDown } from "lucide-react";

const HERO_DESKTOP = "https://d2xsxph8kpxj0f.cloudfront.net/310519663332946355/akrRM8ZRc9zFgPZYYwkCrW/hero-banner-26FVEgmdJnLhmYKAfMrXei.webp";
const HERO_MOBILE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663332946355/akrRM8ZRc9zFgPZYYwkCrW/hero-mobile-msd3rB4tkT2GVC2AYiM7fu.webp";

interface HeroSectionProps {
  totalEvents: number;
  totalCities: number;
}

export default function HeroSection({ totalEvents, totalCities }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 640px)" srcSet={HERO_MOBILE} />
          <img
            src={HERO_DESKTOP}
            alt="Arizona desert skyline at sunset"
            className="w-full h-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative px-4 pt-10 pb-8 sm:pt-16 sm:pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-amber-300 mb-2">
            April 6 – 12, 2026 &middot; Arizona
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3">
            AZ Tech Week
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto mb-6">
            Arizona's inaugural tech week. Browse every event, filter by what matters to you, and RSVP in one tap.
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-1.5 text-white/90">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-semibold">{totalEvents}+</span>
              <span className="text-xs text-white/70">Events</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1.5 text-white/90">
              <CalendarDays className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-semibold">7</span>
              <span className="text-xs text-white/70">Days</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1.5 text-white/90">
              <MapPin className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-semibold">{totalCities}</span>
              <span className="text-xs text-white/70">Cities</span>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-6"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-5 h-5 text-white/50 mx-auto" />
        </motion.div>
      </div>
    </div>
  );
}
