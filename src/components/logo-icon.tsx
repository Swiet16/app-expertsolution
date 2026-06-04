interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="es-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.45" stopColor="#6366f1" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id="es-star" x1="11" y1="11" x2="37" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0.85" />
        </linearGradient>
        <filter id="es-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="48" height="48" rx="13" fill="url(#es-bg)" />
      {/* Subtle top-left highlight */}
      <rect x="0.5" y="0.5" width="47" height="47" rx="12.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

      {/* Large 4-pointed star centered at 24,24 */}
      <path
        d="M24 10 L27.6 20.4 L38 24 L27.6 27.6 L24 38 L20.4 27.6 L10 24 L20.4 20.4 Z"
        fill="url(#es-star)"
        filter="url(#es-glow)"
      />

      {/* Small accent star — top right */}
      <path
        d="M38 9 L39.2 12.8 L43 14 L39.2 15.2 L38 19 L36.8 15.2 L33 14 L36.8 12.8 Z"
        fill="white"
        fillOpacity="0.55"
      />

      {/* Tiny dot — bottom left */}
      <circle cx="10" cy="38" r="2" fill="white" fillOpacity="0.4" />
    </svg>
  );
}
