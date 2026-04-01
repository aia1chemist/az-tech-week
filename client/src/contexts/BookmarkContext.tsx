/*
 * Bookmark / My Schedule context
 * Persists saved event IDs to localStorage, provides toggle + check helpers
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface BookmarkContextValue {
  bookmarkedIds: Set<number>;
  toggle: (id: number) => void;
  isBookmarked: (id: number) => boolean;
  count: number;
  clear: () => void;
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

  useEffect(() => {
    saveBookmarks(bookmarkedIds);
  }, [bookmarkedIds]);

  const toggle = useCallback((id: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (id: number) => bookmarkedIds.has(id),
    [bookmarkedIds]
  );

  return (
    <BookmarkContext.Provider
      value={{ bookmarkedIds, toggle, isBookmarked, count: bookmarkedIds.size, clear: () => setBookmarkedIds(new Set()) }}
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
