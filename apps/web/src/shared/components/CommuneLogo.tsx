import React from 'react';

interface CommuneLogoProps {
  size?: number;
  showText?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
}

/**
 * Commune App Logo — A modern hexagonal network icon
 * representing community connections.
 */
const CommuneLogo: React.FC<CommuneLogoProps> = ({
  size = 32,
  showText = true,
  collapsed = false,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: collapsed ? 0 : 10,
      ...style,
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer hexagon ring */}
      <path
        d="M24 4L41.32 14V34L24 44L6.68 34V14L24 4Z"
        stroke="url(#logoGrad)"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Center dot */}
      <circle cx="24" cy="24" r="4" fill="url(#logoGrad)" />
      {/* Connection lines from center to vertices */}
      <line x1="24" y1="24" x2="24" y2="10" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
      <line x1="24" y1="24" x2="36" y2="17" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
      <line x1="24" y1="24" x2="36" y2="31" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
      <line x1="24" y1="24" x2="24" y2="38" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
      <line x1="24" y1="24" x2="12" y2="31" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
      <line x1="24" y1="24" x2="12" y2="17" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
      {/* Small circles at vertices */}
      <circle cx="24" cy="10" r="2.5" fill="url(#logoGrad)" opacity="0.85" />
      <circle cx="36" cy="17" r="2.5" fill="url(#logoGrad)" opacity="0.85" />
      <circle cx="36" cy="31" r="2.5" fill="url(#logoGrad)" opacity="0.85" />
      <circle cx="24" cy="38" r="2.5" fill="url(#logoGrad)" opacity="0.85" />
      <circle cx="12" cy="31" r="2.5" fill="url(#logoGrad)" opacity="0.85" />
      <circle cx="12" cy="17" r="2.5" fill="url(#logoGrad)" opacity="0.85" />
      <defs>
        <linearGradient id="logoGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B8AFB" />
          <stop offset="1" stopColor="#7C6AEF" />
        </linearGradient>
      </defs>
    </svg>
    {showText && !collapsed && (
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: size * 0.55,
          color: 'var(--c-text-bright)',
          letterSpacing: 2.5,
          lineHeight: 1,
        }}
      >
        COMMUNE
      </span>
    )}
  </div>
);

export default CommuneLogo;
