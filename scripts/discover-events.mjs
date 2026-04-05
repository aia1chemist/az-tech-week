#!/usr/bin/env node
/**
 * Event Discovery — Checks AZ Commerce calendar for new events
 * 
 * Scrapes the AZ Tech Week calendar page for events with Partiful links
 * that aren't already in our events.json, and adds them automatically.
 * 
 * Usage: node scripts/discover-events.mjs
 * 
 * Runs before the Partiful scraper to ensure new events are discovered
 * before their RSVP data is fetched.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = resolve(__dirname, "../client/src/data/events.json");
const CALENDAR_URL = "https://www.azcommerce.com/az-tech-week/aztw-calendar/";
const REQUEST_TIMEOUT_MS = 30000;

/* ── Category mapping from AZ Commerce themes to our categories ── */
const THEME_TO_CATEGORIES = {
  "ai": "AI & Machine Learning",
  "artificial intelligence": "AI & Machine Learning",
  "machine learning": "AI & Machine Learning",
  "blockchain": "Blockchain & Crypto",
  "crypto": "Blockchain & Crypto",
  "web3": "Blockchain & Crypto",
  "cybersecurity": "Cybersecurity",
  "cyber": "Cybersecurity",
  "data": "Data & Analytics",
  "analytics": "Data & Analytics",
  "devops": "DevOps & Engineering",
  "engineering": "DevOps & Engineering",
  "cloud": "DevOps & Engineering",
  "education": "Education & Workforce",
  "workforce": "Education & Workforce",
  "energy": "Energy & Sustainability",
  "sustainability": "Energy & Sustainability",
  "clean energy": "Energy & Sustainability",
  "fintech": "Fintech",
  "finance": "Fintech",
  "health": "Health & Biotech",
  "biotech": "Health & Biotech",
  "healthcare": "Health & Biotech",
  "bioscience": "Health & Biotech",
  "investing": "Investing & VC",
  "vc": "Investing & VC",
  "venture": "Investing & VC",
  "investor": "Investing & VC",
  "legal": "Legal & Policy",
  "policy": "Legal & Policy",
  "manufacturing": "Manufacturing & Hardware",
  "hardware": "Manufacturing & Hardware",
  "marketing": "Sales & Marketing",
  "sales": "Sales & Marketing",
  "b2b": "Sales & Marketing",
  "networking": "Networking & Social",
  "social": "Networking & Social",
  "community": "Networking & Social",
  "real estate": "Real Estate",
  "proptech": "Real Estate",
  "space": "Space & Aerospace",
  "aerospace": "Space & Aerospace",
  "defense": "Space & Aerospace",
  "startup": "Startups & Entrepreneurship",
  "entrepreneur": "Startups & Entrepreneurship",
  "founder": "Startups & Entrepreneurship",
  "women": "Women in Tech",
  "entertainment": "Arts & Entertainment",
  "media": "Arts & Entertainment",
  "creators": "Arts & Entertainment",
  "gaming": "Arts & Entertainment",
  "tours": "Tours & Demos",
  "demo": "Tours & Demos",
  "tour": "Tours & Demos",
};

function inferCategories(event) {
  const categories = new Set();
  const searchText = `${event.title} ${event.eventTheme || ""} ${event.targetAudience || ""} ${event.host || ""}`.toLowerCase();
  
  for (const [keyword, category] of Object.entries(THEME_TO_CATEGORIES)) {
    if (searchText.includes(keyword)) {
      categories.add(category);
    }
  }
  
  // Default to General Tech if no categories matched
  if (categories.size === 0) {
    categories.add("General Tech");
  }
  
  return [...categories];
}

function parseTime(timeStr) {
  if (!timeStr) return { time: "", time_of_day: "Morning", start_time: "", end_time: "" };
  
  const lower = timeStr.toLowerCase().trim();
  const match = lower.match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
  if (!match) return { time: timeStr, time_of_day: "Morning", start_time: timeStr, end_time: "" };
  
  const hour = parseInt(match[1]);
  const isPM = match[3] === "pm";
  const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
  
  let time_of_day = "Morning";
  if (hour24 >= 12 && hour24 < 17) time_of_day = "Afternoon";
  else if (hour24 >= 17) time_of_day = "Evening";
  
  return {
    time: `${match[1]}:${match[2]} ${match[3]}`,
    time_of_day,
    start_time: `${match[1]}:${match[2]} ${match[3]}`,
    end_time: "",
  };
}

function parseDateDisplay(dateStr, dateISO) {
  // dateDisplay is like "MON. 4/6", dateISO is like "2026-04-06"
  const dayMap = {
    "mon": "Monday", "tue": "Tuesday", "wed": "Wednesday",
    "thu": "Thursday", "fri": "Friday", "sat": "Saturday", "sun": "Sunday",
  };
  
  const dayMatch = dateStr?.toLowerCase().match(/^(mon|tue|wed|thu|fri|sat|sun)/);
  const dayOfWeek = dayMatch ? dayMap[dayMatch[1]] : "";
  
  // Parse ISO date to "April 10" format
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  if (dateISO) {
    const parts = dateISO.split("-");
    const monthIdx = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return {
      full_date: `${dayOfWeek}, ${months[monthIdx]} ${day}`,
      date: `${months[monthIdx]} ${day}`,
      day_of_week: dayOfWeek,
    };
  }
  
  return { full_date: "", date: "", day_of_week: dayOfWeek };
}

async function fetchCalendarPage() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  try {
    const res = await fetch(CALENDAR_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractEventsData(html) {
  const match = html.match(/var\s+eventsData\s*=\s*(\[[\s\S]*?\]);\s*\n/);
  if (!match) {
    throw new Error("Could not find eventsData in calendar page");
  }
  return JSON.parse(match[1]);
}

async function main() {
  console.log("=== Event Discovery ===");
  console.log(`Started at: ${new Date().toISOString()}`);
  
  // Read current events.json
  const raw = readFileSync(EVENTS_PATH, "utf-8");
  const data = JSON.parse(raw);
  const existingLinks = new Set(data.events.map((e) => e.link).filter(Boolean));
  const maxId = Math.max(...data.events.map((e) => (typeof e.id === "number" ? e.id : parseInt(e.id) || 0)));
  
  console.log(`Current events: ${data.events.length}, Max ID: ${maxId}`);
  
  // Fetch AZ Commerce calendar
  console.log("Fetching AZ Commerce calendar...");
  let html;
  try {
    html = await fetchCalendarPage();
  } catch (err) {
    console.error(`Failed to fetch calendar: ${err.message}`);
    console.log("Skipping discovery, will try again next run.");
    return;
  }
  
  // Extract events
  let calendarEvents;
  try {
    calendarEvents = extractEventsData(html);
  } catch (err) {
    console.error(`Failed to parse calendar data: ${err.message}`);
    return;
  }
  
  console.log(`Calendar has ${calendarEvents.length} events`);
  
  // Find events with Partiful links that we don't have
  const newEvents = calendarEvents.filter(
    (e) => e.partifulLink && e.partifulLink.trim() && !existingLinks.has(e.partifulLink.trim())
  );
  
  console.log(`New events to add: ${newEvents.length}`);
  
  if (newEvents.length === 0) {
    console.log("No new events found. Done.");
    return;
  }
  
  // Convert and add new events
  let nextId = maxId + 1;
  for (const calEvent of newEvents) {
    const timeInfo = parseTime(calEvent.time);
    const dateInfo = parseDateDisplay(calEvent.dateDisplay, calEvent.date);
    const categories = inferCategories(calEvent);
    
    const newEvent = {
      id: nextId++,
      title: calEvent.title || "Untitled Event",
      city: calEvent.city || "",
      time: timeInfo.time,
      organizer: calEvent.host || "",
      description: "",
      link: calEvent.partifulLink.trim(),
      full_date: dateInfo.full_date,
      categories,
      going: 0,
      interested: 0,
      maybe: 0,
      capacity: null,
      spots_left: null,
      invite_only: !!calEvent.isInviteOnly,
      day_of_week: dateInfo.day_of_week,
      date: dateInfo.date,
      time_of_day: timeInfo.time_of_day,
      sold_out: false,
      space_limited: false,
      duration: "",
      duration_minutes: 0,
      start_time: timeInfo.start_time,
      end_time: timeInfo.end_time,
      image_url: "",
      last_updated: new Date().toISOString(),
    };
    
    data.events.push(newEvent);
    console.log(`  + [${newEvent.id}] ${newEvent.title} (${newEvent.city}, ${newEvent.full_date})`);
  }
  
  // Rebuild metadata
  data.cities = [...new Set(data.events.map((e) => e.city).filter(Boolean))].sort();
  data.categories = [...new Set(data.events.flatMap((e) => e.categories || []))].sort();
  
  // Write updated events.json
  writeFileSync(EVENTS_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
  
  console.log(`\n=== Discovery Complete ===`);
  console.log(`Added ${newEvents.length} new events. Total: ${data.events.length}`);
  console.log(`Finished at: ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
