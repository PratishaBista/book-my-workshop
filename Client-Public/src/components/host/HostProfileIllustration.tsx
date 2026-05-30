import React from 'react';

export const HostProfileIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        viewBox="0 0 320 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
    >
        <circle cx="48" cy="60" r="28" stroke="#2D1B4E" strokeWidth="2" strokeOpacity="0.25" />
        <circle cx="48" cy="60" r="18" fill="#FF6B35" fillOpacity="0.12" />
        <path
            d="M38 58c4-8 16-8 20 0M44 66c2 2 8 2 10 0"
            stroke="#2D1B4E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.4"
        />
        <rect x="100" y="35" width="88" height="50" rx="8" stroke="#2D1B4E" strokeWidth="2" strokeOpacity="0.2" />
        <path d="M112 52h64M112 62h48M112 72h56" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.35" />
        <circle cx="248" cy="45" r="6" fill="#FF6B35" fillOpacity="0.5" />
        <circle cx="272" cy="60" r="10" stroke="#2D1B4E" strokeWidth="2" strokeOpacity="0.2" />
        <circle cx="290" cy="78" r="5" fill="#2D1B4E" fillOpacity="0.15" />
        <path
            d="M220 85c12-18 36-18 48 0"
            stroke="#FF6B35"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.4"
        />
    </svg>
);
