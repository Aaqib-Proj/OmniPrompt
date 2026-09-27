import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, GitFork, Copy, Check, Play, Music2, Braces, MonitorPlay } from 'lucide-react';
import { Prompt } from '../../types';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { openAuthModal } from '../../lib/events';
import { extractVariables, formatCount } from '../../lib/format';
import { resolveMediaUrl } from '../../lib/media';
import { Avatar } from '../common/Avatar';
import { PromptText } from '../common/ui';
import { pinRatio } from './PinTile';

interface PromptCardProps {
  prompt: Prompt;
  onOpenVariables?: (prompt: Prompt) => void;
  onStarToggle?: (promptId: string, starred: boolean, exactCount?: number) => void;
}

// Masonry height relative to column width: media (its own ratio) plus the stats footer.
export const cardHeight = (prompt: Prompt) => 1 / pinRatio(prompt) + 0.26;

const MediaChip: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`absolute inline-flex items-center gap-1 h-5 px-1.5 rounded text-[11px] font-medium ${className}`}>
    {children}
  </span>
);

const CardMedia: React.FC<{ prompt: Prompt; hovered: boolean }> = ({ prompt, hovered }) => {
  const media = prompt.media?.[0];
  const [failed, setFailed] = useState(false);

  // No output attached, or the image link is dead: show the prompt itself instead of an empty box.
  if (!media || (failed && media.mediaType !== 'AUDIO')) {
    return (
      <div className="absolute inset-0 p-4 font-mono text-[11px] leading-5 text-fg-muted overflow-hidden">
        <p className="line-clamp-6">
          <PromptText text={prompt.fullPrompt} />
        </p>
      </div>
    );
  }

  if (media.mediaType === 'AUDIO') {
    // Deterministic pseudo-waveform so each track looks distinct but stable.
    const bars = Array.from({ length: 36 }, (_, i) => 18 + ((prompt.id.charCodeAt(i % prompt.id.length) * (i + 7)) % 72));
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-8">
          {bars.map((h, i) => (
            <span key={i} className="w-[3px] rounded-full bg-fg-subtle/50" style={{ height: `${h}%` }} />
          ))}
        </div>
        <MediaChip className="left-2 bottom-2 bg-canvas/90 text-fg border border-line">
          <Music2 className="w-3 h-3" />
          Audio
        </MediaChip>
      </>
    );
  }

  const isVideo = media.mediaType === 'VIDEO';

  return (
    <>
      {isVideo && !media.thumbnailUrl ? (
        // No poster: browser shows the first frame as the still.
        <video
          src={`${media.url}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={resolveMediaUrl(isVideo ? media.thumbnailUrl || media.url : media.url)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* On hover the clip plays in place; unmounting on leave stops and resets it. */}
      {isVideo && hovered && (
        <video
          src={media.url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {isVideo && !hovered && (
        <MediaChip className="left-2 bottom-2 bg-black/65 text-white">
          <Play className="w-3 h-3 fill-current" />
          Video
        </MediaChip>
      )}
    </>
  );
};

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onOpenVariables, onStarToggle }) => {
  const [copied, setCopied] = useState(false);
  const [isStarred, setIsStarred] = useState(prompt.isStarred || false);
  const [starsCount, setStarsCount] = useState(prompt.starsCount || 0);
  const [copyCount, setCopyCount] = useState(prompt.copyCount || 0);
  const [hovered, setHovered] = useState(false);
  const { user } = useAuthStore();

  const variables = extractVariables(prompt.fullPrompt);
  const href = `/prompts/${prompt.slug}`;

  const handleCopy = async () => {
    if (variables.length > 0 && onOpenVariables) {
      onOpenVariables(prompt);
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt.fullPrompt);
      setCopied(true);
      const res = await api.recordCopy(prompt.id);
      if (typeof res?.copyCount === 'number') {
        setCopyCount(res.copyCount);
      } else {
        setCopyCount((n) => n + 1);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; nothing useful to show on a card.
    }
  };

  const handleStar = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleStar(prompt.id);
      setIsStarred(res.starred);
      if (typeof res.starsCount === 'number') {
        setStarsCount(res.starsCount);
      } else {
        setStarsCount((n) => (res.starred ? n + 1 : Math.max(0, n - 1)));
      }
      onStarToggle?.(prompt.id, res.starred, res.starsCount);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <article
      className="group box flex flex-col overflow-hidden transition-colors hover:border-fg-subtle/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={href}
        aria-label={prompt.title}
        className="relative block bg-inset overflow-hidden"
        style={{ aspectRatio: String(pinRatio(prompt)) }}
      >
        <CardMedia prompt={prompt} hovered={hovered} />
        {prompt.sandboxCode && (
          <MediaChip className="left-2 top-2 bg-canvas/90 text-fg border border-line">
            <MonitorPlay className="w-3 h-3" />
            Live preview
          </MediaChip>
        )}

        {/* Creator + title revealed on hover — plain text, no box */}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
            <Avatar src={prompt.author.avatarUrl} name={prompt.author.username} size={14} />
            <span className="truncate">{prompt.author.username}</span>
          </div>
          <div className="text-[13px] font-semibold text-white leading-snug line-clamp-2 mt-0.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
            {prompt.title}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-0.5 px-2 py-1.5 border-t border-line-muted text-xs text-fg-muted">
        <button
          onClick={handleStar}
          aria-pressed={isStarred}
          title={isStarred ? 'Unstar' : 'Star'}
          className={`inline-flex items-center gap-1 h-7 px-1.5 rounded-md transition-colors hover:bg-subtle ${
            isStarred ? 'text-attention' : 'hover:text-fg'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current' : ''}`} />
          <span className="tabular-nums">{formatCount(starsCount)}</span>
        </button>
        <Link
          to={`${href}?tab=forks`}
          title="Forks"
          className="inline-flex items-center gap-1 h-7 px-1.5 rounded-md transition-colors hover:bg-subtle hover:text-fg"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span className="tabular-nums">{formatCount(prompt.forksCount || 0)}</span>
        </Link>
        <span className="inline-flex items-center gap-1 h-7 px-1.5" title="Times copied">
          <Copy className="w-3.5 h-3.5" />
          <span className="tabular-nums">{formatCount(copyCount)}</span>
        </span>

        <button
          onClick={handleCopy}
          className={`ml-auto btn btn-sm ${copied ? 'btn-success' : 'btn-default'}`}
          title={variables.length > 0 ? 'Fill in variables, then copy' : 'Copy prompt'}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied
            </>
          ) : variables.length > 0 ? (
            <>
              <Braces className="w-3.5 h-3.5" />
              Use
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </article>
  );
};
