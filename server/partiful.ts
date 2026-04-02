/**
 * Partiful scraper — fetches live RSVP counts from Partiful event pages
 * Runs server-side to avoid CORS issues
 */
import axios from "axios";
import { getDb } from "./db";
import { rsvpSnapshots } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

interface PartifulData {
  going: number;
  interested: number;
  maybe: number;
  spotsLeft: number | null;
}

/**
 * Scrape a single Partiful event page for RSVP counts.
 * Falls back gracefully if the page structure changes.
 */
export async function scrapePartifulEvent(url: string): Promise<PartifulData | null> {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html: string = res.data;

    // Partiful embeds event data in a __NEXT_DATA__ script tag
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const pageProps = nextData?.props?.pageProps;
        if (pageProps) {
          const event = pageProps.event || pageProps.eventData || {};
          const guests = pageProps.guests || pageProps.guestList || event.guests || {};

          // Try multiple paths for guest counts
          const going = guests?.going?.length ?? guests?.goingCount ?? event?.goingCount ?? 0;
          const interested = guests?.interested?.length ?? guests?.interestedCount ?? 0;
          const maybe = guests?.maybe?.length ?? guests?.maybeCount ?? 0;
          const capacity = event?.capacity ?? event?.maxGuests ?? null;
          const spotsLeft = capacity ? Math.max(0, capacity - going) : null;

          return { going, interested, maybe, spotsLeft };
        }
      } catch {
        // JSON parse failed, try regex fallback
      }
    }

    // Regex fallback: look for common patterns in the HTML
    const goingMatch = html.match(/(\d+)\s*(?:going|attending|RSVPs?)/i);
    const going = goingMatch ? parseInt(goingMatch[1], 10) : 0;

    return { going, interested: 0, maybe: 0, spotsLeft: null };
  } catch (err) {
    console.warn(`[Partiful] Failed to scrape ${url}:`, (err as Error).message);
    return null;
  }
}

/**
 * Save an RSVP snapshot to the database
 */
export async function saveRsvpSnapshot(eventId: number, data: PartifulData): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(rsvpSnapshots).values({
    eventId,
    going: data.going,
    interested: data.interested,
    maybe: data.maybe,
    spotsLeft: data.spotsLeft,
  });
}

/**
 * Get RSVP history for an event (for sparklines)
 */
export async function getRsvpHistory(eventId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(rsvpSnapshots)
    .where(eq(rsvpSnapshots.eventId, eventId))
    .orderBy(desc(rsvpSnapshots.scrapedAt))
    .limit(limit);

  return rows.reverse(); // oldest first for sparkline
}

/**
 * Get latest RSVP counts for all events that have snapshots
 */
export async function getLatestRsvpCounts() {
  const db = await getDb();
  if (!db) return [];

  // Get the most recent snapshot per event using a subquery approach
  const rows = await db
    .select()
    .from(rsvpSnapshots)
    .orderBy(desc(rsvpSnapshots.scrapedAt))
    .limit(500);

  // Deduplicate to latest per event
  const latest = new Map<number, typeof rows[0]>();
  for (const row of rows) {
    if (!latest.has(row.eventId)) {
      latest.set(row.eventId, row);
    }
  }

  return Array.from(latest.values());
}
