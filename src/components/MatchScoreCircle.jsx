import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display}</>;
}

export default function MatchScoreCircle({ score, size = 48 }) {
  const strokeWidth = Math.max(4, size * 0.1);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 70) return '#2E8B57'; // Emerald Green
    if (s >= 40) return '#F4C430'; // Soft Yellow
    return '#EF4444'; // Red
  };

  const getTrackColor = (s) => {
    if (s >= 70) return 'text-[#2E8B57]/20';
    if (s >= 40) return 'text-[#F4C430]/20';
    return 'text-red-500/20';
  };

  const color = getColor(score);
  const isHighMatch = score >= 80;

  return (
    <div 
      className="relative flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Subtle pulse glow for high match */}
      {isHighMatch && (
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}

      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={getTrackColor(score)}
        />
        {/* Animated Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Text */}
      <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
        <span className="font-bold text-slate-800 tracking-tighter" style={{ fontSize: size * 0.3 }}>
            <AnimatedCount value={score} />
          </span>
      </div>
    </div>
  );
}
