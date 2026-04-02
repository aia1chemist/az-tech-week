/*
 * Countdown Timer — Shows days/hours/minutes/seconds until AZ Tech Week starts
 * April 6, 2026 at 7:00 AM MST (no DST in Arizona)
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TARGET = new Date("2026-04-06T07:00:00-07:00").getTime(); // MST

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function getTimeLeft(): TimeLeft {
  const now = Date.now();
  const total = TARGET - now;
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xl sm:text-2xl font-black text-white font-display tabular-nums"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          {value.toString().padStart(2, "0")}
        </motion.span>
      </div>
      <span className="text-[8px] sm:text-[9px] text-white/70 uppercase tracking-widest font-medium mt-1">{label}</span>
    </div>
  );
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  // If event has started, show "Happening Now!"
  if (time.total <= 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
        <span className="text-sm font-bold text-white uppercase tracking-wider">Happening Now!</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex items-center gap-2 sm:gap-3"
    >
      <Digit value={time.days} label="Days" />
      <span className="text-white/50 text-lg font-bold mt-[-12px]">:</span>
      <Digit value={time.hours} label="Hours" />
      <span className="text-white/50 text-lg font-bold mt-[-12px]">:</span>
      <Digit value={time.minutes} label="Min" />
      <span className="text-white/50 text-lg font-bold mt-[-12px]">:</span>
      <Digit value={time.seconds} label="Sec" />
    </motion.div>
  );
}
