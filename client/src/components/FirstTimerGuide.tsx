/*
 * FirstTimerGuide — "New to AZ Tech Week?" section
 * Practical tips, what to expect, and how to make the most of it
 * Collapsible to keep the page clean
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, MapPin, Car, Shirt, Users, Calendar, Smartphone, Sun } from "lucide-react";

const TIPS = [
  {
    icon: Calendar,
    title: "Plan Ahead",
    text: "With 400+ events across 7 days, you can't attend everything. Use the bookmark feature (heart icon) to save events, then check your Schedule for conflicts.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: MapPin,
    title: "Know the Cities",
    text: "Events span Phoenix, Scottsdale, Tempe, Mesa, Tucson, and more. Check the city filter to plan by location and minimize driving between events.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Car,
    title: "Parking & Transit",
    text: "Most Phoenix/Scottsdale venues have free parking. Downtown Tempe can be tricky — use the ASU garage or rideshare. Tucson events are clustered near UA campus.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Sun,
    title: "Arizona Weather",
    text: "Early April in AZ means 85-95°F (29-35°C). Dress light, bring sunscreen for outdoor events, and stay hydrated. Evenings cool to 65-70°F.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Shirt,
    title: "What to Wear",
    text: "Most events are business casual. Startup events and happy hours are casual. A few investor/corporate events may be more formal — check the description.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Users,
    title: "Networking Tips",
    text: "Bring business cards or have your LinkedIn QR ready. Events with 'High Networking' badges have the best mix of people. Morning events tend to be more focused, evening events more social.",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    icon: Smartphone,
    title: "RSVP Early",
    text: "Popular events fill up fast — 18 are already on waitlist. RSVP as soon as you find something interesting. You can always cancel later.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: Lightbulb,
    title: "Hidden Gems",
    text: "Don't just follow the crowd. Smaller events (under 30 people) often have the best conversations and connections. Sort by 'A-Z' and scroll past the big names to find niche gems.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function FirstTimerGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="max-w-6xl mx-auto px-4 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-50 to-sky-50 dark:from-gray-800 dark:to-gray-800 border border-teal-200/60 dark:border-gray-700 hover:border-teal-300 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">👋</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            New to AZ Tech Week?
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
            Tips for first-timers
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className={`${tip.bg} dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <tip.icon className={`w-4 h-4 ${tip.color}`} />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{tip.title}</h4>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
