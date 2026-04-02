/*
 * Ride Button — Deep links to Uber/Lyft with venue city pre-filled
 */
import { Car } from "lucide-react";

interface RideButtonProps {
  city: string;
  compact?: boolean;
}

export default function RideButton({ city, compact }: RideButtonProps) {
  // Uber universal link with destination
  const uberUrl = `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(city + ", Arizona")}`;
  // Lyft deep link
  const lyftUrl = `https://www.lyft.com/ride?destination[address]=${encodeURIComponent(city + ", Arizona")}`;

  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        <a
          href={uberUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded text-gray-400 hover:text-black hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          title="Get Uber ride"
          onClick={(e) => e.stopPropagation()}
        >
          <Car className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <a
        href={uberUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black text-white text-[10px] font-medium hover:bg-gray-800 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <Car className="w-3 h-3" />
        Uber
      </a>
      <a
        href={lyftUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-pink-600 text-white text-[10px] font-medium hover:bg-pink-700 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <Car className="w-3 h-3" />
        Lyft
      </a>
    </div>
  );
}
