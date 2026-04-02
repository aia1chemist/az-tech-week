import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getUserBookmarks, addBookmark, removeBookmark, setBookmarks } from "./db";
import { scrapePartifulEvent, saveRsvpSnapshot, getRsvpHistory, getLatestRsvpCounts } from "./partiful";

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
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await addBookmark(ctx.user.id, input.eventId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeBookmark(ctx.user.id, input.eventId);
        return { success: true };
      }),

    sync: protectedProcedure
      .input(z.object({ eventIds: z.array(z.number()) }))
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
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return getRsvpHistory(input.eventId);
      }),

    // Manual scrape trigger (admin only or rate-limited)
    scrape: protectedProcedure
      .input(z.object({ eventId: z.number(), url: z.string().url() }))
      .mutation(async ({ input }) => {
        const data = await scrapePartifulEvent(input.url);
        if (data) {
          await saveRsvpSnapshot(input.eventId, data);
          return { success: true, data };
        }
        return { success: false, data: null };
      }),
  }),
});

export type AppRouter = typeof appRouter;
