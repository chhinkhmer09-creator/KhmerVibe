import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* KhmerVibe Gradient Play Button matching the design reference */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg shadow-indigo-500/25`}>
        <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle curved glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-fuchsia-500/30" />
          {/* Play Triangle with glossy gradient */}
          <svg
            className="w-5 h-5 text-transparent relative z-10 translate-x-0.5"
            viewBox="0 0 24 24"
            fill="url(#kv-play-grad)"
          >
            <defs>
              <linearGradient id="kv-play-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
            </defs>
            <polygon points="6 4 19 12 6 20 6 4" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${textSizes[size]} text-white`}>
              Khmer<span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Vibe</span>
            </span>
          </div>
          <span className="text-[10px] font-medium text-indigo-300/80 tracking-wider hidden sm:block">
            មើល • បង្ហោះ • ចែករំលែក
          </span>
        </div>
      )}
    </div>
  );
};
