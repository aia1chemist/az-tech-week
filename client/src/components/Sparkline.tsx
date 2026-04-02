/*
 * Sparkline — tiny inline SVG chart showing RSVP momentum
 * Generates synthetic trend data based on event going count + capacity fill rate
 * Shows a rising/falling/steady trend line in a compact inline format
 */

interface SparklineProps {
  going: number;
  capacity: number;
  spotsLeft: number;
  className?: string;
}

function generateTrendData(going: number, capacity: number, spotsLeft: number): number[] {
  // Generate 7 data points simulating RSVP growth over the past week
  // Events with high going counts and low spots left = steep upward trend
  // Events with low going counts = gentle upward or flat trend
  const points: number[] = [];
  const fillRate = capacity > 0 ? (capacity - spotsLeft) / capacity : 0;
  const momentum = going > 100 ? 1.5 : going > 50 ? 1.2 : going > 20 ? 1.0 : 0.7;

  // Seed from event going count for deterministic output
  let seed = going * 17 + (capacity || 1) * 7;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const baseValue = Math.max(going * 0.15, 1);
  for (let i = 0; i < 7; i++) {
    const progress = i / 6;
    const trend = baseValue + (going - baseValue) * Math.pow(progress, 1 / momentum);
    const noise = (pseudoRandom() - 0.5) * going * 0.08;
    points.push(Math.max(0, trend + noise));
  }

  return points;
}

export default function Sparkline({ going, capacity, spotsLeft, className = "" }: SparklineProps) {
  if (!going || going < 5) return null;

  const data = generateTrendData(going, capacity, spotsLeft);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 48;
  const height = 16;
  const padding = 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Color based on trend direction (last vs first)
  const trend = data[data.length - 1] - data[0];
  const isRising = trend > 0;
  const strokeColor = isRising ? "#10b981" : "#f59e0b"; // emerald or amber
  const fillColor = isRising ? "#10b98120" : "#f59e0b20";

  // Fill area under the line
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block ${className}`}
      aria-label={`RSVP trend: ${isRising ? "rising" : "steady"}`}
    >
      <path d={areaD} fill={fillColor} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dot at the end */}
      <circle
        cx={parseFloat(points[points.length - 1].split(",")[0])}
        cy={parseFloat(points[points.length - 1].split(",")[1])}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
}
