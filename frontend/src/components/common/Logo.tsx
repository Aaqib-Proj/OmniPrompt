import React from 'react';

/**
 * OmniPrompt mark: a round tile (omni — every model, no edges) holding a terminal
 * chevron and an accent cursor. Flat geometry only, so it reads cleanly from a
 * 16px favicon up to hero sizes and inverts correctly between themes.
 */
export const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <circle cx="16" cy="16" r="16" className="fill-fg" />
    <path
      d="M10.5 10.5 L16 16 L10.5 21.5"
      fill="none"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-canvas"
    />
    <path d="M18.8 21.5 H22.8" strokeWidth="2.8" strokeLinecap="round" className="stroke-accent" />
  </svg>
);

export const Logo: React.FC = () => (
  <span className="inline-flex items-center gap-2">
    <LogoMark />
    <span className="text-[17px] font-semibold tracking-tight">OmniPrompt</span>
  </span>
);
