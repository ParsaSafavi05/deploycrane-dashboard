interface DCLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export default function DCLogo({ size = 36, className = '', animated = true }: DCLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'logo-glow' : ''} ${className}`}
    >
      {/* Outer ring */}
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="url(#dc-gradient)"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      {/* D letter */}
      <path
        d="M9 12h7c4.4 0 8 3.6 8 8s-3.6 8-8 8H9V12zm3 3v10h4c2.8 0 5-2.2 5-5s-2.2-5-5-5h-4z"
        fill="url(#dc-gradient)"
      />
      {/* C letter */}
      <path
        d="M29.5 15.5c-1.1-1.5-2.8-2.5-4.5-2.5v3c.8 0 1.6.4 2.1.9.6.6 1 1.5 1 2.6s-.4 2-1 2.6c-.5.5-1.3.9-2.1.9v3c1.7 0 3.4-1 4.5-2.5 1-1.3 1.5-2.9 1.5-4.5s-.5-3.2-1.5-4.5z"
        fill="url(#dc-gradient)"
        opacity="0.9"
      />
      {/* Defs */}
      <defs>
        <linearGradient id="dc-gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
