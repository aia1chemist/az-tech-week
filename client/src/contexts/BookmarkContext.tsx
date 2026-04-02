/*
 * Bookmark / My Schedule context
 * Uses localStorage for anonymous users, syncs to server DB when logged in.
 * On login, merges local bookmarks with server bookmarks (union).
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface BookmarkContextValue {
  bookmarkedIds: Set<number>;
  toggle: (id: number) => void;
  isBookmarked: (id: number) => boolean;
  count: number;
  clear: () => void;
  synced: boolean;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

const STORAGE_KEY = "aztw-bookmarks";

function loadBookmarks(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch {}
  return new Set();
}

function saveBookmarks(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(loadBookmarks);
  const [synced, setSynced] = useState(false);
  const hasSynced = useRef(false);

  // Check auth state
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const isLoggedIn = Boolean(meQuery.data);

  // Server bookmark queries (only when logged in)
  const serverBookmarks = trpc.bookmarks.list.useQuery(undefined, {
    enabled: isLoggedIn,
    retry: false,
  });

  const addMutation = trpc.bookmarks.add.useMutation();
  const removeMutation = trpc.bookmarks.remove.useMutation();
  const syncMutation = trpc.bookmarks.sync.useMutation();

  // Merge local + server bookmarks on first login
  useEffect(() => {
    if (!isLoggedIn || !serverBookmarks.data || hasSynced.current) return;
    hasSynced.current = true;

    const local = loadBookmarks();
    const server = new Set(serverBookmarks.data);
    const merged = new Set([...Array.from(local), ...Array.from(server)]);

    // If there are local bookmarks not on server, sync them up
    const localOnly = Array.from(local).filter(id => !server.has(id));
    if (localOnly.length > 0) {
      syncMutation.mutate({ eventIds: Array.from(merged) });
    }

    setBookmarkedIds(merged);
    saveBookmarks(merged);
    setSynced(true);
  }, [isLoggedIn, serverBookmarks.data]);

  // Save to localStorage on every change
  useEffect(() => {
    saveBookmarks(bookmarkedIds);
  }, [bookmarkedIds]);

  const toggle = useCallback((id: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      const removing = next.has(id);
      if (removing) {
        next.delete(id);
        if (isLoggedIn) removeMutation.mutate({ eventId: id });
      } else {
        next.add(id);
        if (isLoggedIn) addMutation.mutate({ eventId: id });
      }
      return next;
    });
  }, [isLoggedIn, addMutation, removeMutation]);

  const isBookmarked = useCallback(
    (id: number) => bookmarkedIds.has(id),
    [bookmarkedIds]
  );

  const clear = useCallback(() => {
    setBookmarkedIds(new Set());
    if (isLoggedIn) syncMutation.mutate({ eventIds: [] });
  }, [isLoggedIn, syncMutation]);

  return (
    <BookmarkContext.Provider
      value={{ bookmarkedIds, toggle, isBookmarked, count: bookmarkedIds.size, clear, synced }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}
