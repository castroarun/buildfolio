'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 40, text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 56, text: 'text-3xl', gap: 'gap-3' }
  }

  const { icon, text, gap } = sizes[size]

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* Icon - SVG matching the app icon */}
      <svg
        viewBox="0 0 512 512"
        width={icon}
        height={icon}
        className="rounded-xl"
      >
        <defs>
          <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
          <linearGradient id="logoOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="logoGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="512" height="512" rx="96" fill="url(#logoBg)" />

        {/* Barbell bar */}
        <rect x="80" y="244" width="352" height="24" rx="12" fill="#374151" />

        {/* Left weight plates (double) */}
        <rect x="60" y="180" width="40" height="152" rx="8" fill="url(#logoOrange)" />
        <rect x="108" y="200" width="28" height="112" rx="6" fill="url(#logoOrange)" opacity="0.8" />

        {/* Right weight plates (double) */}
        <rect x="412" y="180" width="40" height="152" rx="8" fill="url(#logoOrange)" />
        <rect x="376" y="200" width="28" height="112" rx="6" fill="url(#logoOrange)" opacity="0.8" />

        {/* R Letter */}
        <text
          x="256"
          y="295"
          fontFamily="Arial Black, Arial, sans-serif"
          fontSize="160"
          fontWeight="900"
          fill="url(#logoGreen)"
          textAnchor="middle"
        >
          R
        </text>

        {/* Progress dots */}
        <circle cx="200" cy="400" r="12" fill="#374151" />
        <circle cx="256" cy="400" r="12" fill="#22c55e" />
        <circle cx="312" cy="400" r="12" fill="#374151" />
      </svg>

      {/* Text */}
      {showText && (
        <div className={`font-black tracking-tight ${text}`}>
          <span style={{ color: '#22c55e' }}>REP</span>
          <span style={{ color: '#f97316' }}>PIT</span>
        </div>
      )}
    </div>
  )
}

export default Logo
