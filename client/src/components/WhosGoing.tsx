/*
 * WhosGoing — Anonymized attendee avatar row on event cards
 * Shows generated initials + colors for social proof: "TL, JK, and 47 others going"
 */

const AVATAR_COLORS = [
  "bg-teal-500", "bg-emerald-500", "bg-sky-500", "bg-violet-500",
  "bg-rose-500", "bg-amber-500", "bg-indigo-500", "bg-pink-500",
  "bg-cyan-500", "bg-orange-500", "bg-lime-500", "bg-fuchsia-500",
];

const FIRST_NAMES = [
  "Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Quinn",
  "Avery", "Blake", "Cameron", "Dakota", "Emery", "Finley", "Harper", "Jamie",
  "Kai", "Logan", "Micah", "Nico", "Parker", "Reese", "Sage", "Tyler",
  "Val", "Wren", "Zion", "Ash", "Drew", "Eden", "Gray", "Hayden",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateAvatars(eventId: number, going: number) {
  const rand = seededRandom(eventId * 31 + going * 7);
  const count = Math.min(going, 5);
  const avatars: Array<{ initials: string; color: string; name: string }> = [];

  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(rand() * FIRST_NAMES.length);
    const lastInitial = String.fromCharCode(65 + Math.floor(rand() * 26));
    const name = FIRST_NAMES[nameIdx];
    const initials = name[0] + lastInitial;
    const colorIdx = Math.floor(rand() * AVATAR_COLORS.length);
    avatars.push({ initials, color: AVATAR_COLORS[colorIdx], name: `${name} ${lastInitial}.` });
  }

  return avatars;
}

interface WhosGoingProps {
  eventId: number;
  going: number;
}

export default function WhosGoing({ eventId, going }: WhosGoingProps) {
  if (!going || going < 3) return null;

  const avatars = generateAvatars(eventId, going);
  const remaining = going - avatars.length;

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="flex -space-x-1.5">
        {avatars.map((a, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full ${a.color} flex items-center justify-center text-[7px] font-bold text-white ring-1 ring-white dark:ring-gray-800`}
            title={a.name}
          >
            {a.initials}
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          +{remaining.toLocaleString()} others
        </span>
      )}
    </div>
  );
}
