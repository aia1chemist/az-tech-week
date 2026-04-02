/*
 * DailyDigest — Email signup for daily event briefing
 * Now uses tRPC to persist subscriptions in the database
 */
import { useState, useEffect } from "react";
import { Mail, Check, Bell, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useBookmarks } from "@/contexts/BookmarkContext";

interface DailyDigestProps {
  selectedDay?: string;
}

export default function DailyDigest({ selectedDay = "Monday, April 6" }: DailyDigestProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useAuth();
  const { bookmarkedIds } = useBookmarks();

  // Pre-fill email from user profile
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  // Check if already subscribed
  useEffect(() => {
    if (email && email.includes("@")) {
      const stored = localStorage.getItem("aztw-digest-subscribed");
      if (stored === email) setSubmitted(true);
    }
  }, [email]);

  const subscribeMutation = trpc.digest.subscribe.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      localStorage.setItem("aztw-digest-subscribed", email);
      if (data.alreadySubscribed) {
        toast.success("Welcome back! Your digest is reactivated.");
      } else {
        toast.success("You're signed up for daily digests!");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to subscribe");
    },
  });

  // Email preview query
  const previewQuery = trpc.digest.preview.useQuery(
    { day: selectedDay, bookmarkedEventIds: Array.from(bookmarkedIds) },
    { enabled: previewOpen }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    subscribeMutation.mutate({ email });
  };

  if (dismissed) return null;

  if (submitted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Daily digest active</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">({email})</span>
          </div>
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium"
          >
            <Eye className="w-3 h-3" />
            {previewOpen ? "Hide" : "Preview"}
          </button>
        </div>

        {/* Email Preview */}
        {previewOpen && (
          <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Email Preview — {selectedDay}</span>
              <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-white" style={{ maxHeight: "500px", overflow: "auto" }}>
              {previewQuery.isLoading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading preview...</div>
              ) : previewQuery.data?.html ? (
                <iframe
                  srcDoc={previewQuery.data.html}
                  className="w-full border-0"
                  style={{ height: "500px" }}
                  title="Email Preview"
                />
              ) : (
                <div className="p-8 text-center text-sm text-gray-400">Could not load preview</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      <div className="relative rounded-xl border border-teal-200/60 dark:border-teal-800/40 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10 px-4 py-3">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Daily Digest</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
              Get a morning briefing of your bookmarked events + trending events you might be missing
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Mail className="w-3 h-3" />
                {subscribeMutation.isPending ? "..." : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
