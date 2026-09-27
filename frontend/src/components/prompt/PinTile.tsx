import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Copy, Check, Braces, MonitorPlay, Music2 } from 'lucide-react';
import { Prompt } from '../../types';
import { api } from '../../services/api';
import { extractVariables } from '../../lib/format';
import { resolveMediaUrl } from '../../lib/media';
import { useClipboard, useStar } from '../../lib/promptHooks';
import { Avatar } from '../common/Avatar';
import { ModelBadge, PromptText } from '../common/ui';

const RATIOS = [2 / 3, 3 / 4, 4 / 5, 1, 3 / 4, 4 / 3, 2 / 3, 4 / 5];

// Deterministic per prompt, so the gallery layout is identical on every render and visit.
export const pinRatio = (prompt: Prompt): number => {
  // Prompt-text cards only fill a few lines, so a tall tile would leave dead space.
  if (!prompt.media?.[0]) return 4 / 5;
  if (prompt.media[0].mediaType === 'AUDIO') return 1;
  const hash = Array.from(prompt.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return RATIOS[hash % RATIOS.length];
};

// Tile height relative to column width: the media plus the caption under it.
export const pinHeight = (prompt: Prompt) => 1 / pinRatio(prompt) + 0.3;

// Only one audio preview plays at a time across the gallery.
let activeAudio: HTMLAudioElement | null = null;

const isPlainClick = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

const roundButton =
  'pointer-events-auto inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm transition-colors hover:bg-white';

interface PinTileProps {
  prompt: Prompt;
  onOpen: (prompt: Prompt) => void;
  onUse: (prompt: Prompt) => void;
  onStarChange?: (id: string, starred: boolean) => void;
}

export const PinTile: React.FC<PinTileProps> = ({ prompt, onOpen, onUse, onStarChange }) => {
  const media = prompt.media?.[0];
  const ratio = pinRatio(prompt);
  const href = `/prompts/${prompt.slug}`;
  const variables = extractVariables(prompt.fullPrompt);
  const [hovered, setHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { starred, toggle } = useStar(prompt, onStarChange);
  const { copied, copy } = useClipboard();

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovered) video.play().catch(() => {});
    else video.pause();
  }, [hovered]);

  const open = (e: React.MouseEvent) => {
    if (!isPlainClick(e)) return; // Let ctrl/cmd-click open the full page in a new tab.
    e.preventDefault();
    onOpen(prompt);
  };

  const toggleAudio = () => {
    if (!media) return;
    if (!audioRef.current) {
      const audio = new Audio(media.url);
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => setPlaying(false);
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    if (audio.paused) {
      if (activeAudio && activeAudio !== audio) activeAudio.pause();
      activeAudio = audio;
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  };

  const handleCopy = async () => {
    if (variables.length > 0) {
      onUse(prompt);
      return;
    }
    if (await copy(prompt.fullPrompt)) api.recordCopy(prompt.id);
  };

  const showPromptText = !media || (imageFailed && media.mediaType !== 'AUDIO');

  return (
    <div className="group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative">
        <Link
          to={href}
          onClick={open}
          aria-label={prompt.title}
          className="relative block overflow-hidden rounded-2xl bg-inset"
          style={{ aspectRatio: String(ratio) }}
        >
          {showPromptText ? (
            <div className="absolute inset-0 p-4 font-mono text-[11px] leading-5 text-fg-muted overflow-hidden [mask-image:linear-gradient(to_bottom,black_65%,transparent)]">
              <PromptText text={prompt.fullPrompt} />
            </div>
          ) : media!.mediaType === 'AUDIO' ? (
            <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-6">
              {Array.from({ length: 28 }, (_, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-fg-subtle/45"
                  style={{ height: `${16 + ((prompt.id.charCodeAt(i % prompt.id.length) * (i + 5)) % 60)}%` }}
                />
              ))}
            </div>
          ) : media!.mediaType === 'VIDEO' && !media!.thumbnailUrl ? (
            // No poster image: the browser shows the first frame, and the clip plays in place on hover.
            <video
              ref={videoRef}
              src={`${media!.url}#t=0.1`}
              preload="metadata"
              muted
              loop
              playsInline
              onError={() => setImageFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <img
                src={resolveMediaUrl(media!.mediaType === 'VIDEO' ? media!.thumbnailUrl || media!.url : media!.url)}
                alt=""
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {media!.mediaType === 'VIDEO' && hovered && (
                <video src={media!.url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
              )}
            </>
          )}
        </Link>

        {/* Always-visible markers */}
        {media?.mediaType === 'VIDEO' && !showPromptText && (
          <span className="pointer-events-none absolute left-3 top-3 inline-flex w-7 h-7 items-center justify-center rounded-full bg-black/55 text-white">
            <Play className="w-3 h-3 fill-current ml-px" />
          </span>
        )}
        {media?.mediaType === 'AUDIO' && (
          <>
            <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-canvas/90 text-fg text-[11px] font-medium border border-line">
              <Music2 className="w-3 h-3" />
              Audio
            </span>
            <button
              onClick={toggleAudio}
              aria-label={playing ? 'Pause preview' : 'Play preview'}
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 inline-flex w-12 h-12 items-center justify-center rounded-full bg-fg text-canvas shadow-md transition-transform hover:scale-105"
            >
              {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
          </>
        )}
        {prompt.sandboxCode && (
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-canvas/90 text-fg text-[11px] font-medium border border-line">
            <MonitorPlay className="w-3 h-3" />
            Live preview
          </span>
        )}

        {/* Hover layer */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/30 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100" />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="flex justify-end">
            <button
              onClick={toggle}
              aria-pressed={starred}
              className={`pointer-events-auto h-9 px-4 rounded-full text-[13px] font-semibold shadow-sm transition-colors ${
                starred ? 'bg-fg text-canvas' : 'bg-accent text-white hover:bg-accent/90'
              }`}
            >
              {starred ? 'Saved' : 'Save'}
            </button>
          </div>
          <div className="flex items-end justify-between gap-2">
            <span className="inline-flex min-w-0 max-w-[75%] items-center h-7 px-2.5 rounded-full bg-white/90 text-neutral-900 text-xs font-medium">
              <ModelBadge model={prompt.model} />
            </span>
            <button
              onClick={handleCopy}
              className={roundButton}
              aria-label={variables.length > 0 ? 'Fill in variables and copy' : 'Copy prompt'}
              title={variables.length > 0 ? 'Fill in variables and copy' : 'Copy prompt'}
            >
              {copied ? <Check className="w-4 h-4 text-green-700" /> : variables.length > 0 ? <Braces className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-1 pt-2">
        <Link to={href} onClick={open} className="block text-[13px] font-medium leading-snug line-clamp-2 hover:underline underline-offset-2">
          {prompt.title}
        </Link>
        <Link to={`/users/${prompt.author.username}`} className="mt-1.5 flex items-center gap-1.5 min-w-0 text-xs text-fg-muted hover:text-fg">
          <Avatar src={prompt.author.avatarUrl} name={prompt.author.username} size={20} />
          <span className="truncate">{prompt.author.username}</span>
        </Link>
      </div>
    </div>
  );
};
