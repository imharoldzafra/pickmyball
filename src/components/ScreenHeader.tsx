import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface ScreenHeaderProps {
  /** Callback triggered when back button is pressed */
  onBack: () => void;
  /** Optional title pill rendered to the right of the back button with a clean gap */
  titlePill?: React.ReactNode;
  /** Optional slot on the right side of the header */
  rightSlot?: React.ReactNode;
  /** Accessibility label for the back button (defaults to "Go back") */
  ariaLabel?: string;
  /** Optional additional CSS class names */
  className?: string;
}

/**
 * 📱 Unified Screen Header Component
 *
 * Guarantees that the circular back-arrow button is consistently positioned across
 * all screens (Match Setup, Live Scoreboard, etc.):
 * - Always the first child, anchored directly to the left screen boundary.
 * - Sits outside inner content column wrappers to span the full phone frame container width.
 * - Standardized 44x44px touch target with aria-label="Go back".
 * - Optional title pill is slotted to the right with a small gap and CANNOT shift or push the back button.
 */
export default function ScreenHeader({
  onBack,
  titlePill,
  rightSlot,
  ariaLabel = 'Go back',
  className = '',
}: ScreenHeaderProps) {
  return (
    <header className={`app-header relative flex items-center justify-between shrink-0 select-none z-20 pb-2 ${className}`}>
      {/* 1. Left-anchored Back Button: Always at the exact same left coordinate */}
      <button
        type="button"
        onClick={onBack}
        aria-label={ariaLabel}
        className="flex-shrink-0 flex items-center justify-center rounded-full bg-white hover:bg-[#F3F1EB] border border-[#E2DDD4] text-[#18281E] transition-all active:scale-95 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#244434]/20 z-20"
        style={{
          width: 'var(--back-btn-size, 44px)',
          height: 'var(--back-btn-size, 44px)',
          minWidth: 'var(--back-btn-size, 44px)',
          minHeight: 'var(--back-btn-size, 44px)',
        }}
      >
        <ArrowLeft className="w-4 h-4 text-[#18281E]" />
      </button>

      {/* 2. Dead-Centered Title Pill: Center of the screen, single-line nowrap */}
      {titlePill && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto z-10 whitespace-nowrap">
          {titlePill}
        </div>
      )}

      {/* 3. Right Slot or invisible spacer matching back button size */}
      {rightSlot ? (
        <div className="flex-shrink-0 ml-auto z-20">
          {rightSlot}
        </div>
      ) : (
        <div
          className="pointer-events-none invisible flex-shrink-0 z-10"
          style={{
            width: 'var(--back-btn-size, 44px)',
            height: 'var(--back-btn-size, 44px)',
          }}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
