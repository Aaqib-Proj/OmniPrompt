import React from 'react';

/**
 * The OmniPrompt mark — "the prompt p".
 *
 * One silhouette, three readings: a lowercase p (prompt), a speech bubble whose
 * tail is the descender (talking to a model), and an accent cursor sitting where
 * the p's counter would be (where you type). The bowl is a perfect circle — omni,
 * every model — and the stem meets it through a small fillet so it reads as a
 * letterform rather than two shapes stacked together.
 *
 * Drawn on a 48-unit grid as one filled path plus the caret, so it stays crisp from
 * a 16px favicon to hero sizes and recolours with the theme. Keep these coordinates
 * in sync with the favicon in index.html and the SVGs in public/.
 */
export const MARK_BODY_PATH =
  'M7.5 19.5A16.5 16.5 0 1 1 20.09 35.53A2.5 2.5 0 0 0 17 37.96V40.25A4.75 4.75 0 0 1 7.5 40.25Z';

export const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path d={MARK_BODY_PATH} className="fill-fg" />
    <rect x="21.5" y="9.5" width="5" height="20" rx="2.5" className="logo-caret fill-accent" />
  </svg>
);

/** Mark + wordmark. The caret blinks while the lockup is hovered, like a cursor waiting for input. */
export const Logo: React.FC = () => (
  <span className="logo-lockup inline-flex items-center gap-[7px]">
    <LogoMark />
    <span className="text-[18px] font-bold tracking-[-0.045em] leading-none">omniprompt</span>
  </span>
);
