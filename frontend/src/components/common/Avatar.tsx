import React, { useState } from 'react';
import { resolveMediaUrl } from '../../lib/media';

const HUES = [12, 32, 145, 190, 215, 260, 330];

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  square?: boolean;
  className?: string;
}

// Photo avatar with a deterministic monogram fallback when there is no URL or it fails to load.
export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 20, square = false, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const shape = square ? 'rounded-md' : 'rounded-full';
  const dimensions = { width: size, height: size };

  if (src && !failed) {
    return (
      <img
        src={resolveMediaUrl(src)}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        style={dimensions}
        className={`${shape} shrink-0 object-cover bg-line-muted ring-1 ring-line/60 ${className}`}
      />
    );
  }

  const hue = HUES[Array.from(name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % HUES.length];
  const initial = name.replace(/[^a-z0-9]/gi, '').charAt(0) || '?';

  return (
    <span
      aria-hidden="true"
      style={{
        ...dimensions,
        fontSize: Math.max(9, Math.round(size * 0.42)),
        backgroundColor: `hsl(${hue} 45% 86%)`,
        color: `hsl(${hue} 45% 28%)`,
      }}
      className={`${shape} inline-flex shrink-0 items-center justify-center font-semibold uppercase select-none ${className}`}
    >
      {initial}
    </span>
  );
};
