/*
 * DigestPreview — Full-page preview of the Daily Digest email template
 * Accessible at /digest-preview
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";

const DAYS = [
  "Monday, April 6",
  "Tuesday, April 7",
  "Wednesday, April 8",
  "Thursday, April 9",
  "Friday, April 10",
  "Saturday, April 11",
  "Sunday, April 12",
];

export default function DigestPreview() {
  const [dayIndex, setDayIndex] = useState(0);
  const { bookmarkedIds } = useBookmarks();
  const bookmarkArray = useMemo(() => Array.from(bookmarkedIds), [bookmarkedIds]);

  const previewQuery = trpc.digest.preview.useQuery(
    { day: DAYS[dayIndex], bookmarkedEventIds: bookmarkArray },
    { enabled: true }
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to site
          </a>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">Daily Digest Preview</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDayIndex(Math.max(0, dayIndex - 1))}
              disabled={dayIndex === 0}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[120px] text-center">
              {DAYS[dayIndex]}
            </span>
            <button
              onClick={() => setDayIndex(Math.min(DAYS.length - 1, dayIndex + 1))}
              disabled={dayIndex === DAYS.length - 1}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Fake email header */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-xs font-bold text-teal-700">AZ</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">AZ Tech Week</p>
                <p className="text-[10px] text-gray-400">digest@aztechweek.com</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your {DAYS[dayIndex]} Briefing — {bookmarkedIds.size} events bookmarked
            </p>
          </div>

          {/* Rendered email */}
          {previewQuery.isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-400">Generating preview...</p>
            </div>
          ) : previewQuery.data?.html ? (
            <iframe
              srcDoc={previewQuery.data.html}
              className="w-full border-0"
              style={{ height: "800px" }}
              title="Email Preview"
            />
          ) : (
            <div className="p-12 text-center text-sm text-gray-400">Could not load preview</div>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-4">
          This is a preview of what subscribers will receive each morning at 7:00 AM MST during AZ Tech Week.
        </p>
      </div>
    </div>
  );
}
