#!/usr/bin/env node
/**
 * Partiful Scraper — Standalone script for GitHub Actions
 * 
 * Fetches live RSVP data from Partiful event pages and updates events.json.
 * Designed to run on a cron schedule (e.g., hourly) via GitHub Actions.
 * 
 * Usage: node scripts/scrape-partiful.mjs
 * 
 * What it updates per event:
 *   - going (goingGuestCount)
 *   - maybe (maybeGuestCount) 
 *   - capacity (maxCapacity)
 *   - spots_left (remainingCapacity)
 *   - sold_out (atCapacity && isCapped)
 *   - waitlist_count (waitlistGuestCount)
 *   - interested (interestedGuestCount)
 *   - space_limited (isCapped)
 *   - last_updated (ISO timestamp)
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = resolve(__dirname, "../client/src/data/events.json");

// Rate limiting: delay between requests to be respectful
const DELAY_MS = 800;
// Max concurrent requests (we do sequential to be polite)
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 10000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function scrapePartifulEvent(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
      if (!res.ok) {
        console.warn(`  HTTP ${res.status} for ${url}`);
        if (attempt < MAX_RETRIES) {
          await sleep(2000 * (attempt + 1));
          continue;
        }
        return null;
      }

      const html = await res.text();

      // Extract __NEXT_DATA__ JSON
      const match = html.match(
        /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s
      );
      if (!match) {
        console.warn(`  No __NEXT_DATA__ found for ${url}`);
        return null;
      }

      const data = JSON.parse(match[1]);
      const event = data?.props?.pageProps?.event;
      if (!event) {
        console.warn(`  No event data in __NEXT_DATA__ for ${url}`);
        return null;
      }

      return {
        going: event.goingGuestCount ?? 0,
        maybe: event.maybeGuestCount ?? 0,
        capacity: event.maxCapacity ?? null,
        spots_left: event.remainingCapacity ?? null,
        sold_out: !!(event.atCapacity && event.isCapped),
        waitlist_count: event.waitlistGuestCount ?? 0,
        interested: event.interestedGuestCount ?? 0,
        space_limited: !!event.isCapped,
        status: event.status ?? "PUBLISHED",
        title_live: event.title ?? null,
      };
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn(`  Timeout for ${url} (attempt ${attempt + 1})`);
      } else {
        console.warn(
          `  Error scraping ${url} (attempt ${attempt + 1}):`,
          err.message
        );
      }
      if (attempt < MAX_RETRIES) {
        await sleep(2000 * (attempt + 1));
      }
    }
  }
  return null;
}

/* ── Category & city normalization ── */
const CATEGORY_MERGES = {
  FinTech: "Fintech",
  "Blockchain & Web3": "Blockchain & Crypto",
  "Space & Defense": "Space & Aerospace",
  "Clean Energy & Sustainability": "Energy & Sustainability",
  "Hardware & Manufacturing": "Manufacturing & Hardware",
  Networking: "Networking & Social",
  "Health Tech": "Health & Biotech",
  "Marketing & Growth": "Sales & Marketing",
  "Gaming & Entertainment": "Arts & Entertainment",
  "Real Estate & PropTech": "Real Estate",
  "Cloud & DevOps": "DevOps & Engineering",
};

const CITY_FIXES = {
  "850 PBC": "Phoenix",
  "Pima Community College West Campus | HG10": "Tucson",
  "The Funding Studio": "Phoenix",
  "Town of Prescott Valley": "Prescott Valley",
  "Arizona Commerce Authority": "Phoenix",
  "Dean Simms": "Phoenix",
};

function normalizeEvent(event) {
  return {
    ...event,
    city: CITY_FIXES[event.city] || event.city,
    categories: [...new Set(event.categories.map((c) => CATEGORY_MERGES[c] || c))],
  };
}

function rebuildMetadata(data) {
  data.cities = [...new Set(data.events.map((e) => e.city))].sort();
  data.categories = [...new Set(data.events.flatMap((e) => e.categories))].sort();
}

async function main() {
  console.log("=== Partiful Scraper ===");
  console.log(`Started at: ${new Date().toISOString()}`);

  // Read current events.json
  const raw = readFileSync(EVENTS_PATH, "utf-8");
  const data = JSON.parse(raw);

  // Normalize categories and cities on load
  data.events = data.events.map(normalizeEvent);
  rebuildMetadata(data);

  const events = data.events;

  // Filter to Partiful events only
  const partifulEvents = events.filter(
    (e) => e.link && e.link.includes("partiful.com")
  );
  console.log(
    `Total events: ${events.length}, Partiful events: ${partifulEvents.length}`
  );

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < partifulEvents.length; i++) {
    const event = partifulEvents[i];
    const progress = `[${i + 1}/${partifulEvents.length}]`;

    console.log(`${progress} Scraping: ${event.title.substring(0, 50)}...`);

    const liveData = await scrapePartifulEvent(event.link);

    if (liveData) {
      // Update the event in the original array
      const idx = events.findIndex((e) => e.id === event.id);
      if (idx !== -1) {
        events[idx] = {
          ...events[idx],
          going: liveData.going,
          maybe: liveData.maybe,
          capacity: liveData.capacity,
          spots_left: liveData.spots_left,
          sold_out: liveData.sold_out,
          space_limited: liveData.space_limited,
          interested: liveData.interested,
          last_updated: new Date().toISOString(),
        };
        updated++;
        console.log(
          `  ✓ Going: ${liveData.going}, Capacity: ${liveData.capacity ?? "unlimited"}, Spots: ${liveData.spots_left ?? "N/A"}`
        );
      }
    } else {
      failed++;
      console.log(`  ✗ Failed to scrape`);
    }

    // Rate limiting
    if (i < partifulEvents.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Add metadata
  data.last_scraped = new Date().toISOString();
  data.scrape_stats = {
    total: partifulEvents.length,
    updated,
    failed,
    skipped,
  };

  // Write updated events.json
  writeFileSync(EVENTS_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");

  console.log(`\n=== Scrape Complete ===`);
  console.log(`Updated: ${updated}, Failed: ${failed}, Skipped: ${skipped}`);
  console.log(`Finished at: ${new Date().toISOString()}`);

  // Exit with error if too many failures (>50%)
  if (failed > partifulEvents.length * 0.5) {
    console.error("Too many failures (>50%), exiting with error");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
