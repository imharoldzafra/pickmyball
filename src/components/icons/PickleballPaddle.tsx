import React from 'react';

interface PickleballPaddleProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export default function PickleballPaddle({ className = "w-6 h-6", size = 24, ...props }: PickleballPaddleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Pickleball Paddle Face */}
      <rect x="4" y="3" width="12" height="13" rx="4" />
      
      {/* Paddle Neck / Throat Accent */}
      <path d="M7 16L9 19" />
      <path d="M13 16L11 19" />
      
      {/* Paddle Handle & Grip */}
      <path d="M10 19V22" strokeWidth="2.5" />
      <path d="M8.5 22H11.5" />

      {/* Perforated Pickleball (Wiffle Ball) */}
      <circle cx="18" cy="8" r="3.5" />
      {/* Ball Holes */}
      <circle cx="18" cy="8" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16.8" cy="6.8" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="19.2" cy="9.2" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
