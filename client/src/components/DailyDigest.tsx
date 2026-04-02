/*
 * DailyDigest — Email signup for daily event briefing
 * Client-side only: stores email to localStorage + shows confirmation
 * In a real deployment this would POST to a backend/Mailchimp/etc.
 */
import { useState, useEffect } from "react";
import { Mail, Check, Bell, X } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "aztw-digest-email";

export default function DailyDigest() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSubmitted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    localStorage.setItem(STORAGE_KEY, email);
    setSubmitted(true);
    toast.success("You're signed up for daily digests!");
  };

  if (dismissed || submitted) {
    if (submitted) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Daily digest active</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">({localStorage.getItem(STORAGE_KEY)})</span>
          </div>
        </div>
      );
    }
    return null;
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
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1"
              >
                <Mail className="w-3 h-3" /> Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
