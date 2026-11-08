import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-20 h-20 rounded-3xl',
  };

  const iconSizes = {
    sm: 'w-4.5 h-4.5',
    md: 'w-6 h-6',
    lg: 'w-11 h-11',
  };

  return (
    <div
      className={`relative ${sizes[size]} ${className} bg-gradient-to-tr from-primary via-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-primary/25 border border-white/25 group-hover:scale-105 transition-all duration-300 flex-shrink-0 overflow-hidden`}
    >
      {/* Subtle Inner Reflection Glare */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/15 pointer-events-none" />

      {/* Vector Food Cloche & Aroma Emblem */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${iconSizes[size]} text-white relative z-10 drop-shadow-sm`}
      >
        {/* Steam Wisps */}
        <path d="M12 2v2.5" strokeWidth="2.5" />
        <path d="M8 3.5a2 2 0 0 1 0 2.5" strokeWidth="1.5" />
        <path d="M16 3.5a2 2 0 0 0 0 2.5" strokeWidth="1.5" />
        {/* Dome */}
        <path d="M4 17a8 8 0 0 1 16 0H4z" fill="currentColor" fillOpacity="0.25" strokeWidth="2" />
        {/* Knob */}
        <circle cx="12" cy="7" r="1.5" fill="currentColor" />
        {/* Platter Base */}
        <path d="M2 17h20" strokeWidth="2.5" />
        <path d="M6 20h12" strokeWidth="2" />
      </svg>
    </div>
  );
}