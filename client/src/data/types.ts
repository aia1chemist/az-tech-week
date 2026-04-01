export interface Event {
  id: number;
  organizer: string;
  title: string;
  day_of_week: string;
  date: string;
  time: string;
  city: string;
  link: string;
  full_date: string;
  time_of_day: "Morning" | "Afternoon" | "Evening" | "TBD";
  invite_only: boolean;
  categories: string[];
  going: number;
  interested: number;
  maybe: number;
  capacity: number;
  spots_left: number; // -1 = unknown
  sold_out: boolean;
  space_limited: boolean;
  description?: string;
  duration: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
}

export interface EventsData {
  events: Event[];
  cities: string[];
  categories: string[];
  days: string[];
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "AI & Machine Learning": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  "Arts & Entertainment": { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300" },
  "Blockchain & Crypto": { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-300" },
  "Cybersecurity": { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  "Data & Analytics": { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300" },
  "DevOps & Engineering": { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
  "Education & Workforce": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  "Energy & Sustainability": { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  "Fintech": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  "General Tech": { bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-300" },
  "Health & Biotech": { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-300" },
  "Investing & VC": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  "Legal & Policy": { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
  "Manufacturing & Hardware": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  "Networking & Social": { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
  "Real Estate": { bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-300" },
  "Sales & Marketing": { bg: "bg-fuchsia-100", text: "text-fuchsia-800", border: "border-fuchsia-300" },
  "Space & Aerospace": { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
  "Startups & Entrepreneurship": { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-300" },
  "Tours & Demos": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
};

export const CATEGORY_ICONS: Record<string, string> = {
  "AI & Machine Learning": "🧠",
  "Arts & Entertainment": "🎨",
  "Blockchain & Crypto": "⛓",
  "Cybersecurity": "🔒",
  "Data & Analytics": "📊",
  "DevOps & Engineering": "⚙️",
  "Education & Workforce": "🎓",
  "Energy & Sustainability": "⚡",
  "Fintech": "💳",
  "General Tech": "💡",
  "Health & Biotech": "🧬",
  "Investing & VC": "💰",
  "Legal & Policy": "⚖️",
  "Manufacturing & Hardware": "🔧",
  "Networking & Social": "🤝",
  "Real Estate": "🏠",
  "Sales & Marketing": "📣",
  "Space & Aerospace": "🚀",
  "Startups & Entrepreneurship": "🚀",
  "Tours & Demos": "🗺️",
};

export const DAY_SHORT: Record<string, string> = {
  "Monday, April 6": "Mon 4/6",
  "Tuesday, April 7": "Tue 4/7",
  "Wednesday, April 8": "Wed 4/8",
  "Thursday, April 9": "Thu 4/9",
  "Friday, April 10": "Fri 4/10",
  "Saturday, April 11": "Sat 4/11",
  "Sunday, April 12": "Sun 4/12",
};

export const TIME_OF_DAY_ICONS: Record<string, string> = {
  Morning: "☀️",
  Afternoon: "🌤️",
  Evening: "🌙",
  TBD: "❓",
};

export type SortOption = "time" | "popular" | "filling" | "alpha";
