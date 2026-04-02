import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, bookmarks, rsvpSnapshots, digestSubscribers } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Bookmark helpers ───

export async function getUserBookmarks(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
  return rows.map(r => r.eventId);
}

export async function addBookmark(userId: number, eventId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Upsert: ignore if already exists
  try {
    await db.insert(bookmarks).values({ userId, eventId });
  } catch (err: any) {
    // Duplicate entry is fine
    if (!err?.message?.includes("Duplicate")) throw err;
  }
}

export async function removeBookmark(userId: number, eventId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(bookmarks).where(
    and(eq(bookmarks.userId, userId), eq(bookmarks.eventId, eventId))
  );
}

export async function setBookmarks(userId: number, eventIds: number[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Replace all bookmarks for this user
  await db.delete(bookmarks).where(eq(bookmarks.userId, userId));
  if (eventIds.length > 0) {
    await db.insert(bookmarks).values(eventIds.map(eventId => ({ userId, eventId })));
  }
}

// ─── Digest subscriber helpers ───

export async function subscribeDigest(email: string, userId?: number): Promise<{ success: boolean; alreadySubscribed: boolean }> {
  const db = await getDb();
  if (!db) return { success: false, alreadySubscribed: false };
  try {
    await db.insert(digestSubscribers).values({ email, userId: userId ?? null, active: 1 });
    return { success: true, alreadySubscribed: false };
  } catch (err: any) {
    if (err?.message?.includes("Duplicate")) {
      // Reactivate if previously unsubscribed
      await db.update(digestSubscribers)
        .set({ active: 1, userId: userId ?? undefined })
        .where(eq(digestSubscribers.email, email));
      return { success: true, alreadySubscribed: true };
    }
    throw err;
  }
}

export async function unsubscribeDigest(email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(digestSubscribers)
    .set({ active: 0 })
    .where(eq(digestSubscribers.email, email));
}

export async function getActiveSubscribers(): Promise<{ id: number; email: string; userId: number | null }[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(digestSubscribers).where(eq(digestSubscribers.active, 1));
  return rows.map(r => ({ id: r.id, email: r.email, userId: r.userId }));
}

export async function isSubscribed(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select().from(digestSubscribers)
    .where(and(eq(digestSubscribers.email, email), eq(digestSubscribers.active, 1)))
    .limit(1);
  return rows.length > 0;
}
