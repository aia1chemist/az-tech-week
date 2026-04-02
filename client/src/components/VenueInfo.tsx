/*
 * Venue Info — Parking & transit tips, food nearby, speaker info
 * Provides contextual info based on city
 */
import { Car, Utensils, Bus, ParkingCircle } from "lucide-react";

interface CityInfo {
  parking: string;
  transit: string;
  food: string[];
}

const CITY_INFO: Record<string, CityInfo> = {
  "Phoenix": {
    parking: "Downtown Phoenix has metered street parking and garages ($5-15/day). Free parking available at some venues.",
    transit: "Valley Metro Rail runs through downtown. Ride-share pickup zones on Central Ave & Washington St.",
    food: ["Pizzeria Bianco", "The Churchill", "Bitter & Twisted", "Hanny's", "Welcome Diner"],
  },
  "Scottsdale": {
    parking: "Old Town Scottsdale has free 3-hour parking in city garages. Street parking metered until 6pm.",
    transit: "Scottsdale Trolley (free) runs through Old Town. Valley Metro bus routes 72 and 81.",
    food: ["FnB Restaurant", "Citizen Public House", "Hash Kitchen", "Diego Pops", "Maple & Ash"],
  },
  "Tempe": {
    parking: "ASU area has paid garages ($3-8). Mill Ave has metered parking. Free parking at Tempe Marketplace.",
    transit: "Valley Metro Rail stops at University/Rural and Mill Ave. ASU Orbit shuttle is free.",
    food: ["House of Tricks", "Postino Annex", "Culinary Dropout", "Four Peaks Brewing", "Pedal Haus"],
  },
  "Mesa": {
    parking: "Downtown Mesa has free 2-hour street parking. City garages available near Main St.",
    transit: "Valley Metro Light Rail extends to Mesa. Bus routes serve major corridors.",
    food: ["Worth Takeaway", "Pacino's", "The Handlebar Pub", "Republica Empanada", "Nami"],
  },
  "Chandler": {
    parking: "Downtown Chandler has free parking garages and street parking. Most venues have lots.",
    transit: "Valley Metro bus routes. Ride-share recommended for most venues.",
    food: ["SanTan Brewing", "The Brickyard Downtown", "Serrano's", "Crust Simply Italian"],
  },
  "Gilbert": {
    parking: "Heritage District has free parking. Most venues have dedicated lots.",
    transit: "Limited transit — ride-share recommended. Bus route 112 serves Gilbert Rd.",
    food: ["Joe's Farm Grill", "Liberty Market", "Postino Gilbert", "Joyride Taco House"],
  },
  "Tucson": {
    parking: "Downtown Tucson has metered parking and garages. 4th Ave has free side-street parking.",
    transit: "Sun Link streetcar runs through downtown and University area. SunTran buses available.",
    food: ["El Charro Cafe", "Cafe Poca Cosa", "Tumerico", "Bata", "The Cup Cafe"],
  },
};

const DEFAULT_INFO: CityInfo = {
  parking: "Most venues have free parking. Check event page for specific directions.",
  transit: "Ride-share (Uber/Lyft) recommended. Valley Metro serves major corridors.",
  food: ["Check local restaurants near the venue on Google Maps"],
};

interface VenueInfoProps {
  city: string;
}

export function ParkingInfo({ city }: VenueInfoProps) {
  const info = CITY_INFO[city] || DEFAULT_INFO;
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
      <ParkingCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Parking</span>
        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{info.parking}</p>
      </div>
    </div>
  );
}

export function TransitInfo({ city }: VenueInfoProps) {
  const info = CITY_INFO[city] || DEFAULT_INFO;
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
      <Bus className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Transit</span>
        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{info.transit}</p>
      </div>
    </div>
  );
}

export function FoodNearby({ city }: VenueInfoProps) {
  const info = CITY_INFO[city] || DEFAULT_INFO;
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
      <Utensils className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">Food Nearby</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {info.food.map((place) => (
            <a
              key={place}
              href={`https://www.google.com/maps/search/${encodeURIComponent(place + " " + city + " AZ")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700 hover:bg-orange-200 transition-all"
            >
              {place}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Combined venue info panel */
export default function VenueInfoPanel({ city }: VenueInfoProps) {
  return (
    <div className="space-y-1.5">
      <ParkingInfo city={city} />
      <TransitInfo city={city} />
      <FoodNearby city={city} />
    </div>
  );
}
