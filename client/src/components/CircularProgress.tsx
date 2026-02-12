import React from 'react';

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  value, 
  size = 220, 
  strokeWidth = 20,
  label,
  subLabel
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer Plate (Extruded) */}
      <div className="absolute inset-0 rounded-full shadow-neu-flat bg-neu-base" />
      
      {/* Inner Track (Sunken) */}
      <div className="absolute rounded-full shadow-neu-pressed-sm bg-neu-base flex items-center justify-center" 
           style={{ inset: strokeWidth / 2 }}>
             
        {/* SVG Progress */}
        <svg
          className="transform -rotate-90 w-full h-full absolute"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Circle */}
          <circle
            className="text-neu-base"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress Circle */}
          <circle
            className="text-neu-primary transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Inner Hub (Extruded again for text) */}
        <div className="absolute rounded-full shadow-neu-flat bg-neu-base flex flex-col items-center justify-center z-10"
             style={{ width: size - strokeWidth * 3.5, height: size - strokeWidth * 3.5 }}>
          <span className="text-3xl font-bold text-neu-dark">{value}%</span>
          {label && <span className="text-xs text-neu-text uppercase tracking-wider mt-1">{label}</span>}
          {subLabel && <span className="text-[10px] text-neu-text/60 mt-1">{subLabel}</span>}
        </div>
      </div>
    </div>
  );
};