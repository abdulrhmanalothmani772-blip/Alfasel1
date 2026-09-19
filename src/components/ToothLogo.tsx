import React from 'react';

interface ToothLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  theme?: 'dark' | 'light';
  showPhone?: boolean;
}

export const ToothLogo: React.FC<ToothLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'dark',
  showPhone = true,
}) => {
  const isLight = theme === 'light';

  // Dimension scaling
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  const subSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl',
  }[size];

  const englishSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-sm',
    xl: 'text-base',
  }[size];

  // Stylized tooth SVG inspired by Al Faisal Dental Center brand
  const ToothGraphic = (
    <div className={`relative ${iconDimensions} flex items-center justify-center shrink-0`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="toothGrad" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00D2FF" />
            <stop offset="0.5" stopColor="#0284C7" />
            <stop offset="1" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="40" y1="20" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0F2FE" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* Outer stylized tooth contour */}
        <path
          d="M60 12C38 12 24 26 24 50C24 70 33 90 40 108C42 113 47 114 50 108C53 102 56 82 60 82C64 82 67 102 70 108C73 114 78 113 80 108C87 90 96 70 96 50C96 26 82 12 60 12Z"
          fill="url(#toothGrad)"
        />

        {/* Inner swoop highlight */}
        <path
          d="M60 22C44 22 34 32 34 50C34 66 41 82 46 96C47 99 50 99 51 96C54 88 56 72 60 72C64 72 66 88 69 96C70 99 73 99 74 96C79 82 86 66 86 50C86 32 76 22 60 22Z"
          fill="#0A192F"
          fillOpacity={isLight ? '0.1' : '0.4'}
        />

        {/* Dynamic artistic swoosh with tooth profile */}
        <path
          d="M42 38C44 32 50 28 58 28C68 28 74 34 76 44C78 52 74 62 68 70C64 76 56 80 50 82C48 83 46 81 47 79C51 72 58 64 62 56C66 48 64 42 58 42C53 42 47 46 44 50C43 51 41 50 42 48Z"
          fill="url(#accentGrad)"
        />

        {/* Sparkle star */}
        <circle cx="78" cy="30" r="3" fill="#FFFFFF" />
        <path d="M78 24V36M72 30H84" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{ToothGraphic}</div>;
  }

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className} ${
        isLight ? 'text-slate-900' : 'text-white'
      }`}
    >
      {ToothGraphic}

      <div className="flex flex-col text-right">
        {/* Main Arabic Center Name */}
        <div className="flex items-baseline gap-1.5 leading-tight font-extrabold tracking-tight">
          <span className={`text-cyan-400 font-black ${titleSizes} drop-shadow-sm`}>الفيصل</span>
          <span
            className={`${titleSizes} ${
              isLight ? 'text-slate-800' : 'text-white'
            } font-bold`}
          >
            لطب الأسنان
          </span>
        </div>

        {/* Subtitle / English Name */}
        <span
          className={`font-semibold tracking-wider uppercase text-cyan-300 ${englishSizes} opacity-95`}
          style={{ letterSpacing: '0.12em' }}
        >
          AL FAISAL DENTAL CENTER
        </span>

        {/* Phone numbers */}
        {showPhone && (
          <div className="flex items-center gap-1.5 mt-0.5 text-emerald-400 font-mono text-[11px] font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span dir="ltr">778043029 - 789843741</span>
          </div>
        )}
      </div>
    </div>
  );
};
