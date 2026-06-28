interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lg-bg1" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#064e3b" />
          <stop offset="0.55" stopColor="#065f46" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="lg-gold" x1="8" y1="10" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="0.45" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="lg-shine" x1="0" y1="0" x2="0" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.18" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter id="lg-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal badge background */}
      <path
        d="M26 2 L48 14 L48 38 L26 50 L4 38 L4 14 Z"
        fill="url(#lg-bg1)"
      />
      {/* Border glow */}
      <path
        d="M26 3.8 L46.5 14.9 L46.5 37.1 L26 48.2 L5.5 37.1 L5.5 14.9 Z"
        fill="none"
        stroke="rgba(245,158,11,0.5)"
        strokeWidth="1"
      />
      {/* Shine */}
      <path
        d="M26 2 L48 14 L48 30 L26 2Z"
        fill="url(#lg-shine)"
      />

      {/* Stars / accent dots */}
      <circle cx="26" cy="6" r="1.2" fill="#f59e0b" opacity="0.8" />
      <circle cx="44" cy="17" r="0.9" fill="#f59e0b" opacity="0.6" />
      <circle cx="8" cy="17" r="0.9" fill="#f59e0b" opacity="0.6" />

      {/* "E" letterform */}
      <g fill="url(#lg-gold)">
        <rect x="9" y="15" width="2.8" height="22" rx="1.4" />
        <rect x="9" y="15" width="12" height="2.8" rx="1.4" />
        <rect x="9" y="24.6" width="9.5" height="2.6" rx="1.3" />
        <rect x="9" y="34.2" width="12" height="2.8" rx="1.4" />
      </g>

      {/* "S" letterform */}
      <g fill="url(#lg-gold)">
        <rect x="23" y="15" width="12" height="2.8" rx="1.4" />
        <rect x="23" y="15" width="2.8" height="7.5" rx="1.4" />
        <rect x="23" y="24.6" width="12" height="2.6" rx="1.3" />
        <rect x="32.2" y="27.2" width="2.8" height="7.8" rx="1.4" />
        <rect x="23" y="34.2" width="12" height="2.8" rx="1.4" />
      </g>

      {/* Bottom ribbon accent */}
      <path
        d="M15 44.5 Q26 48 37 44.5"
        stroke="rgba(245,158,11,0.45)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
