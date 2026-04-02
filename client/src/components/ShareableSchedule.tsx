/*
 * Shareable Schedule — Encode bookmarked event IDs into a URL parameter
 * and allow sharing via link. Also reads ?schedule= param on load.
 */
import { useEffect } from "react";
import { toast } from "sonner";
import { Link2, Share2 } from "lucide-react";
import { useBookmarks } from "@/contexts/BookmarkContext";

/* Encode IDs to compact base36 string */
function encodeIds(ids: Set<number>): string {
  return Array.from(ids).sort((a, b) => a - b).map((id) => id.toString(36)).join("-");
}

function decodeIds(str: string): number[] {
  if (!str) return [];
  return str.split("-").map((s) => parseInt(s, 36)).filter((n) => !isNaN(n));
}

/* Hook to load shared schedule from URL on mount */
export function useSharedScheduleLoader() {
  const { toggle, bookmarkedIds } = useBookmarks();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scheduleParam = params.get("schedule");
    if (scheduleParam) {
      const ids = decodeIds(scheduleParam);
      if (ids.length > 0) {
        let added = 0;
        ids.forEach((id) => {
          if (!bookmarkedIds.has(id)) {
            toggle(id);
            added++;
          }
        });
        if (added > 0) {
          toast.success(`Loaded ${added} event${added !== 1 ? "s" : ""} from shared schedule!`, { duration: 3000 });
        }
        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete("schedule");
        window.history.replaceState({}, "", url.toString());
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* Share button for My Schedule */
export function ShareScheduleButton() {
  const { bookmarkedIds, count } = useBookmarks();

  const handleShare = () => {
    if (count === 0) {
      toast("Save some events first!", { icon: "💡" });
      return;
    }
    const encoded = encodeIds(bookmarkedIds);
    const url = `${window.location.origin}?schedule=${encoded}`;

    if (navigator.share) {
      navigator.share({
        title: "My AZ Tech Week Schedule",
        text: `Check out my AZ Tech Week schedule — ${count} events!`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Schedule link copied! Share it with friends.");
      }).catch(() => {
        toast.error("Could not copy link");
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium hover:bg-blue-100 transition-all dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
    >
      <Link2 className="w-3 h-3" />
      Share
    </button>
  );
}
