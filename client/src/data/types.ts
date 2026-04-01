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

/* Light-theme category chips — soft tinted backgrounds with strong text */
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "AI & Machine Learning": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Arts & Entertainment": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  "Blockchain & Crypto": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  "Cybersecurity": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Data & Analytics": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  "DevOps & Engineering": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  "Education & Workforce": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Energy & Sustainability": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Fintech": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  "General Tech": { bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-200" },
  "Health & Biotech": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "Investing & VC": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  "Legal & Policy": { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  "Manufacturing & Hardware": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "Networking & Social": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  "Real Estate": { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200" },
  "Sales & Marketing": { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200" },
  "Space & Aerospace": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  "Startups & Entrepreneurship": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  "Tours & Demos": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

export const CATEGORY_ICONS: Record<string, string> = {
  "AI & Machine Learning": "\u{1F9E0}",
  "Arts & Entertainment": "\u{1F3A8}",
  "Blockchain & Crypto": "\u{26D3}",
  "Cybersecurity": "\u{1F512}",
  "Data & Analytics": "\u{1F4CA}",
  "DevOps & Engineering": "\u{2699}\u{FE0F}",
  "Education & Workforce": "\u{1F393}",
  "Energy & Sustainability": "\u{26A1}",
  "Fintech": "\u{1F4B3}",
  "General Tech": "\u{1F4A1}",
  "Health & Biotech": "\u{1F9EC}",
  "Investing & VC": "\u{1F4B0}",
  "Legal & Policy": "\u{2696}\u{FE0F}",
  "Manufacturing & Hardware": "\u{1F527}",
  "Networking & Social": "\u{1F91D}",
  "Real Estate": "\u{1F3E0}",
  "Sales & Marketing": "\u{1F4E3}",
  "Space & Aerospace": "\u{1F680}",
  "Startups & Entrepreneurship": "\u{1F680}",
  "Tours & Demos": "\u{1F5FA}\u{FE0F}",
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
  Morning: "\u{2600}\u{FE0F}",
  Afternoon: "\u{1F324}\u{FE0F}",
  Evening: "\u{1F319}",
  TBD: "\u{2753}",
};

export type SortOption = "time" | "popular" | "filling" | "alpha";
