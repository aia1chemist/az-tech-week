/*
 * Google Calendar Button — One-click "Add to Google Calendar" for individual events
 */
import type { Event } from "@/data/types";

function cleanTitle(title: string): string {
  return title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").replace(/\s*#AZTECHWEEK/gi, "").replace(/\s+/g, " ").trim();
}

function parseTimeToMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toLowerCase();
  if (ampm === "pm" && hours !== 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

const DATE_MAP: Record<string, string> = {
  "Monday, April 6": "20260406",
  "Tuesday, April 7": "20260407",
  "Wednesday, April 8": "20260408",
  "Thursday, April 9": "20260409",
  "Friday, April 10": "20260410",
  "Saturday, April 11": "20260411",
  "Sunday, April 12": "20260412",
};

export function getGoogleCalUrl(event: Event): string {
  const title = encodeURIComponent(cleanTitle(event.title));
  const dateStr = DATE_MAP[event.full_date] || "20260406";
  const startMin = parseTimeToMinutes(event.start_time || event.time);
  const endMin = event.end_time ? parseTimeToMinutes(event.end_time) : (event.duration_minutes > 0 ? startMin + event.duration_minutes : startMin + 60);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const startH = Math.floor(startMin / 60);
  const startM = startMin % 60;
  const endH = Math.floor(endMin / 60);
  const endM = endMin % 60;

  // Arizona doesn't observe DST, always UTC-7
  const start = `${dateStr}T${pad(startH)}${pad(startM)}00`;
  const end = `${dateStr}T${pad(endH)}${pad(endM)}00`;

  const details = encodeURIComponent(`${event.organizer}\n${event.link}`);
  const location = encodeURIComponent(event.city || "Arizona");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&ctz=America/Phoenix&details=${details}&location=${location}`;
}

interface GoogleCalButtonProps {
  event: Event;
  compact?: boolean;
}

export default function GoogleCalButton({ event, compact }: GoogleCalButtonProps) {
  return (
    <a
      href={getGoogleCalUrl(event)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-0.5 transition-all ${
        compact
          ? "p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
          : "px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium hover:bg-blue-100"
      }`}
      title="Add to Google Calendar"
      onClick={(e) => e.stopPropagation()}
    >
      <svg className={compact ? "w-3.5 h-3.5" : "w-3 h-3"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </svg>
      {!compact && <span>Add to Cal</span>}
    </a>
  );
}
