/*
 * digestEmail.ts — Generates the Daily Digest email HTML
 * Beautiful, responsive email template showing:
 * 1. Your bookmarked events for the day
 * 2. Trending events you might be missing
 * 3. Weather for the day
 * 4. Travel time tips
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load events data at module level
let allEvents: any[] = [];
try {
  const raw = readFileSync(resolve(process.cwd(), "client/src/data/events.json"), "utf-8");
  allEvents = JSON.parse(raw).events || [];
} catch {
  console.warn("[DigestEmail] Could not load events.json");
}

// Weather data for April 6-12
const WEATHER: Record<string, { high: number; low: number; condition: string; icon: string; uv: number }> = {
  "Monday, April 6": { high: 89, low: 64, condition: "Sunny", icon: "\u2600\ufe0f", uv: 9 },
  "Tuesday, April 7": { high: 91, low: 66, condition: "Sunny", icon: "\u2600\ufe0f", uv: 9 },
  "Wednesday, April 8": { high: 93, low: 67, condition: "Hot & Sunny", icon: "\ud83d\udd25", uv: 10 },
  "Thursday, April 9": { high: 90, low: 65, condition: "Partly Cloudy", icon: "\u26c5", uv: 8 },
  "Friday, April 10": { high: 87, low: 63, condition: "Pleasant", icon: "\ud83c\udf24\ufe0f", uv: 7 },
  "Saturday, April 11": { high: 85, low: 62, condition: "Nice", icon: "\ud83c\udf24\ufe0f", uv: 7 },
  "Sunday, April 12": { high: 88, low: 64, condition: "Sunny", icon: "\u2600\ufe0f", uv: 8 },
};

// Travel times between cities
const TRAVEL_TIPS: Record<string, string> = {
  "Phoenix-Scottsdale": "~25 min drive",
  "Phoenix-Tempe": "~15 min drive",
  "Phoenix-Mesa": "~25 min drive",
  "Phoenix-Chandler": "~30 min drive",
  "Phoenix-Tucson": "~1.5 hr drive",
  "Scottsdale-Tempe": "~20 min drive",
  "Scottsdale-Mesa": "~25 min drive",
};

function getTravelTime(city1: string, city2: string): string | null {
  if (city1 === city2) return null;
  const key1 = `${city1}-${city2}`;
  const key2 = `${city2}-${city1}`;
  return TRAVEL_TIPS[key1] || TRAVEL_TIPS[key2] || "~30-45 min drive";
}

function cleanTitle(title: string): string {
  return title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").trim();
}

export function generateDigestHtml(day: string, bookmarkedEventIds: number[]): string {
  const dayEvents = allEvents.filter((e: any) => e.full_date === day);
  const bookmarkedForDay = dayEvents.filter((e: any) => bookmarkedEventIds.includes(e.id));
  const weather = WEATHER[day];

  // Get trending events (highest going count) that aren't bookmarked
  const trendingEvents = dayEvents
    .filter((e: any) => !bookmarkedEventIds.includes(e.id) && !e.sold_out)
    .sort((a: any, b: any) => (b.going || 0) - (a.going || 0))
    .slice(0, 5);

  // Sort bookmarked by time
  bookmarkedForDay.sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));

  // Build travel tips between consecutive bookmarked events
  const travelTips: string[] = [];
  for (let i = 0; i < bookmarkedForDay.length - 1; i++) {
    const curr = bookmarkedForDay[i];
    const next = bookmarkedForDay[i + 1];
    if (curr.city && next.city && curr.city !== next.city) {
      const time = getTravelTime(curr.city, next.city);
      if (time) {
        travelTips.push(`${curr.city} \u2192 ${next.city}: ${time}`);
      }
    }
  }

  const dateShort = day.replace("day, ", ". ").replace("nesday", ".");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AZ Tech Week Daily Digest - ${day}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d9488,#059669);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Your Daily Digest</p>
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">AZ TECH WEEK</h1>
              <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.9);font-weight:600;">${day}</p>
            </td>
          </tr>

          <!-- Weather Bar -->
          ${weather ? `
          <tr>
            <td style="background-color:#ffffff;padding:16px 24px;border-bottom:1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:24px;width:40px;">${weather.icon}</td>
                  <td style="padding-left:12px;">
                    <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${weather.high}\u00b0F / ${weather.low}\u00b0F</p>
                    <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${weather.condition}${weather.uv >= 9 ? ` \u00b7 UV ${weather.uv} \u2014 bring sunscreen!` : ""}</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    ${weather.high >= 90 ? '<span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:10px;font-weight:700;padding:4px 8px;border-radius:12px;">HOT DAY</span>' : '<span style="display:inline-block;background:#ecfdf5;color:#065f46;font-size:10px;font-weight:700;padding:4px 8px;border-radius:12px;">NICE DAY</span>'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Your Schedule -->
          <tr>
            <td style="background-color:#ffffff;padding:24px;">
              <h2 style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:1px;">
                \ud83d\udcc5 Your Schedule
              </h2>
              <p style="margin:0 0 16px;font-size:12px;color:#9ca3af;">
                ${bookmarkedForDay.length > 0 ? `${bookmarkedForDay.length} event${bookmarkedForDay.length > 1 ? "s" : ""} bookmarked for today` : "No events bookmarked for today \u2014 check out trending events below!"}
              </p>

              ${bookmarkedForDay.length > 0 ? bookmarkedForDay.map((event: any, i: number) => `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${i < bookmarkedForDay.length - 1 ? "12" : "0"}px;">
                <tr>
                  <td style="width:60px;vertical-align:top;padding-top:2px;">
                    <span style="display:inline-block;background:#f0fdfa;color:#0d9488;font-size:11px;font-weight:700;padding:4px 8px;border-radius:8px;white-space:nowrap;">${event.start_time || event.time}</span>
                  </td>
                  <td style="padding-left:12px;border-left:2px solid #e5e7eb;padding-bottom:${i < bookmarkedForDay.length - 1 ? "12" : "0"}px;">
                    <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${cleanTitle(event.title)}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">
                      \ud83d\udccd ${event.city}${event.going ? ` \u00b7 ${event.going} going` : ""}${event.sold_out ? ' \u00b7 <span style="color:#dc2626;font-weight:600;">WAITLIST</span>' : event.spots_left && event.spots_left < 20 ? ` \u00b7 <span style="color:#d97706;font-weight:600;">${event.spots_left} spots left</span>` : ""}
                    </p>
                    ${event.link ? `<a href="${event.link}" style="display:inline-block;margin-top:6px;font-size:11px;color:#0d9488;font-weight:600;text-decoration:none;">RSVP \u2192</a>` : ""}
                  </td>
                </tr>
              </table>
              `).join("") : `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;padding:16px;background:#f9fafb;border-radius:12px;">
                    <p style="margin:0;font-size:13px;color:#6b7280;">Browse events and bookmark the ones you want to attend!</p>
                  </td>
                </tr>
              </table>
              `}
            </td>
          </tr>

          <!-- Travel Tips -->
          ${travelTips.length > 0 ? `
          <tr>
            <td style="background-color:#fffbeb;padding:16px 24px;border-top:1px solid #fde68a;">
              <h3 style="margin:0 0 8px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;">
                \ud83d\ude97 Travel Tips
              </h3>
              ${travelTips.map(tip => `<p style="margin:0 0 4px;font-size:12px;color:#78350f;">\u2022 ${tip}</p>`).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- Trending Events -->
          ${trendingEvents.length > 0 ? `
          <tr>
            <td style="background-color:#ffffff;padding:24px;border-top:1px solid #e5e7eb;">
              <h2 style="margin:0 0 4px;font-size:14px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">
                \ud83d\udd25 Trending Today
              </h2>
              <p style="margin:0 0 16px;font-size:12px;color:#9ca3af;">Events gaining traction that you haven't bookmarked yet</p>

              ${trendingEvents.map((event: any, i: number) => `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${i < trendingEvents.length - 1 ? "10" : "0"}px;">
                <tr>
                  <td style="width:28px;vertical-align:top;">
                    <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background:${i === 0 ? "#fef2f2" : "#f9fafb"};color:${i === 0 ? "#dc2626" : "#6b7280"};font-size:11px;font-weight:700;border-radius:50%;">${i + 1}</span>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="margin:0;font-size:13px;font-weight:600;color:#111827;">${cleanTitle(event.title)}</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">
                      ${event.start_time || event.time} \u00b7 ${event.city} \u00b7 <span style="color:#059669;font-weight:600;">${event.going} going</span>
                    </p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    ${event.link ? `<a href="${event.link}" style="display:inline-block;background:#f0fdfa;color:#0d9488;font-size:10px;font-weight:700;padding:6px 10px;border-radius:8px;text-decoration:none;">RSVP</a>` : ""}
                  </td>
                </tr>
              </table>
              `).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- Day Stats -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 24px;border-top:1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width:33%;">
                    <p style="margin:0;font-size:20px;font-weight:800;color:#0d9488;">${dayEvents.length}</p>
                    <p style="margin:2px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Events</p>
                  </td>
                  <td align="center" style="width:34%;">
                    <p style="margin:0;font-size:20px;font-weight:800;color:#0d9488;">${new Set(dayEvents.map((e: any) => e.city).filter(Boolean)).size}</p>
                    <p style="margin:2px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Cities</p>
                  </td>
                  <td align="center" style="width:33%;">
                    <p style="margin:0;font-size:20px;font-weight:800;color:#0d9488;">${dayEvents.filter((e: any) => !e.sold_out).length}</p>
                    <p style="margin:2px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Open</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#111827;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.6);">
                AZ Tech Week 2026 \u00b7 April 6\u201312 \u00b7 Arizona
              </p>
              <p style="margin:0 0 12px;font-size:11px;color:rgba(255,255,255,0.4);">
                Made by <a href="https://www.linkedin.com/in/tlegwinski/" style="color:#5eead4;text-decoration:none;">Trevor Legwinski</a> \u00b7 Powered by <a href="https://manus.im" style="color:#5eead4;text-decoration:none;">Manus AI</a>
              </p>
              <a href="#unsubscribe" style="font-size:10px;color:rgba(255,255,255,0.3);text-decoration:underline;">Unsubscribe from daily digest</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
