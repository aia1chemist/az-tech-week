import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User bookmarks — persisted across devices via login
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * RSVP snapshots — periodic scrapes of Partiful event attendance
 */
/**
 * Daily digest email subscribers
 */
export const digestSubscribers = mysqlTable("digest_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  userId: int("userId"),  // nullable — can subscribe without login
  active: int("active").default(1).notNull(),  // 1=active, 0=unsubscribed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DigestSubscriber = typeof digestSubscribers.$inferSelect;
export type InsertDigestSubscriber = typeof digestSubscribers.$inferInsert;

/**
 * RSVP snapshots — periodic scrapes of Partiful event attendance
 */
export const rsvpSnapshots = mysqlTable("rsvp_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  going: int("going").default(0),
  interested: int("interested").default(0),
  maybe: int("maybe").default(0),
  spotsLeft: int("spotsLeft"),
  scrapedAt: timestamp("scrapedAt").defaultNow().notNull(),
});
