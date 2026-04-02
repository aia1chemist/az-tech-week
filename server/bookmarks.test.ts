import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAnonContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("bookmarks router", () => {
  it("requires authentication for bookmark.list", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bookmarks.list()).rejects.toThrow();
  });

  it("requires authentication for bookmark.add", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bookmarks.add({ eventId: 1 })).rejects.toThrow();
  });

  it("requires authentication for bookmark.remove", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bookmarks.remove({ eventId: 1 })).rejects.toThrow();
  });

  it("requires authentication for bookmark.sync", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bookmarks.sync({ eventIds: [1, 2, 3] })).rejects.toThrow();
  });
});

describe("rsvp router", () => {
  it("allows public access to rsvp.latest", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    // Should not throw (returns empty array if no DB)
    const result = await caller.rsvp.latest();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows public access to rsvp.history", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.rsvp.history({ eventId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("requires authentication for rsvp.scrape", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.rsvp.scrape({ eventId: 1, url: "https://partiful.com/e/test" })
    ).rejects.toThrow();
  });
});
