import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getUserBookmarks, addBookmark, removeBookmark, setBookmarks, subscribeDigest, unsubscribeDigest, isSubscribed, getActiveSubscribers, getUserBookmarks as getBookmarksForUser } from "./db";
import { TRPCError } from "@trpc/server";
import { scrapePartifulEvent, saveRsvpSnapshot, getRsvpHistory, getLatestRsvpCounts } from "./partiful";
import { generateDigestHtml } from "./digestEmail";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Bookmarks (persistent across devices) ───
  bookmarks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserBookmarks(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({ eventId: z.coerce.number() }))
      .mutation(async ({ ctx, input }) => {
        await addBookmark(ctx.user.id, input.eventId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ eventId: z.coerce.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeBookmark(ctx.user.id, input.eventId);
        return { success: true };
      }),

    sync: protectedProcedure
      .input(z.object({ eventIds: z.array(z.coerce.number()) }))
      .mutation(async ({ ctx, input }) => {
        await setBookmarks(ctx.user.id, input.eventIds);
        return { success: true };
      }),
  }),

  // ─── RSVP live data ───
  rsvp: router({
    latest: publicProcedure.query(async () => {
      return getLatestRsvpCounts();
    }),

    history: publicProcedure
      .input(z.object({ eventId: z.coerce.number() }))
      .query(async ({ input }) => {
        return getRsvpHistory(input.eventId);
      }),

    // Manual scrape trigger (admin only or rate-limited)
    scrape: protectedProcedure
      .input(z.object({ eventId: z.coerce.number(), url: z.string().url() }))
      .mutation(async ({ input }) => {
        const data = await scrapePartifulEvent(input.url);
        if (data) {
          await saveRsvpSnapshot(input.eventId, data);
          return { success: true, data };
        }
        return { success: false, data: null };
      }),
  }),

  // ─── Daily Digest ───
  digest: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id;
        const result = await subscribeDigest(input.email, userId);
        // Notify owner of new subscriber
        if (!result.alreadySubscribed) {
          notifyOwner({ title: "New Digest Subscriber", content: `${input.email} subscribed to the daily digest.` }).catch(() => {});
        }
        return result;
      }),

    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await unsubscribeDigest(input.email);
        return { success: true };
      }),

    status: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const subscribed = await isSubscribed(input.email);
        return { subscribed };
      }),

    // Preview the email template for a given day
    preview: publicProcedure
      .input(z.object({ day: z.string(), bookmarkedEventIds: z.array(z.coerce.number()).optional() }))
      .query(async ({ input }) => {
        const html = generateDigestHtml(input.day, input.bookmarkedEventIds || []);
        return { html };
      }),

    // Admin: send digest to all active subscribers
    sendAll: protectedProcedure
      .input(z.object({ day: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Admin-only
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        const subscribers = await getActiveSubscribers();
        let sent = 0;
        let failed = 0;
        for (const sub of subscribers) {
          try {
            // Get user's bookmarks if they have a userId
            const bookmarks = sub.userId ? await getBookmarksForUser(sub.userId) : [];
            const html = generateDigestHtml(input.day, bookmarks);
            // Use notifyOwner as a proxy for now (in production, use a proper email service)
            await notifyOwner({
              title: `Daily Digest - ${input.day}`,
              content: `Digest sent to ${sub.email} with ${bookmarks.length} bookmarked events.`,
            });
            sent++;
          } catch {
            failed++;
          }
        }
        return { sent, failed, total: subscribers.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
