/*
 * AZTW Skeleton Card — Shimmer loading placeholder for event cards
 * Shows while day transition animation plays
 */

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex gap-3">
        {/* Image placeholder */}
        <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          {/* Title */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          {/* Organizer */}
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-1/2" />
        </div>
        {/* Heart icon placeholder */}
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700/50" />
      </div>
      <div className="mt-3 space-y-2">
        {/* Time + City */}
        <div className="flex gap-4">
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-20" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-24" />
        </div>
        {/* Description */}
        <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-full" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-2/3" />
      </div>
      <div className="mt-3 flex justify-between items-center">
        {/* Going count */}
        <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-16" />
        {/* RSVP button */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
      </div>
    </div>
  );
}

export function SkeletonSection() {
  return (
    <div className="px-4 py-2">
      {/* Section header skeleton */}
      <div className="flex items-center gap-3 mb-3 animate-pulse">
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="flex-1" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-8" />
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
