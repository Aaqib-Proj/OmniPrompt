import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Link2, ExternalLink, Copy, Check, Braces, ArrowRight, Star, Eye, Sparkles } from 'lucide-react';
import { Prompt } from '../../types';
import { api } from '../../services/api';
import { extractVariables, formatCount } from '../../lib/format';
import { resolveMediaUrl } from '../../lib/media';
import { useClipboard, useStar } from '../../lib/promptHooks';
import { Avatar } from '../common/Avatar';
import { Masonry } from '../common/Masonry';
import { ModelBadge, PromptText } from '../common/ui';
import { PinTile, pinHeight } from './PinTile';
import { UseInAiButton } from './UseInAiButton';

interface PinCloseupProps {
  slug: string;
  onClose: () => void;
  onOpenPin: (prompt: Prompt) => void;
  onUse: (prompt: Prompt) => void;
  onStarChange?: (id: string, starred: boolean) => void;
}

const iconButton = 'inline-flex w-10 h-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-subtle';

const CloseupCard: React.FC<{ prompt: Prompt; onUse: (p: Prompt) => void; onStarChange?: (id: string, starred: boolean) => void }> = ({
  prompt,
  onUse,
  onStarChange,
}) => {
  const [mediaIndex, setMediaIndex] = useState(0);
  const { starred, count, toggle } = useStar(prompt, onStarChange);
  const promptCopy = useClipboard();
  const linkCopy = useClipboard();
  const media = prompt.media?.[mediaIndex];
  const variables = extractVariables(prompt.fullPrompt);
  const fullPageHref = `/prompts/${prompt.slug}`;

  let parameters: Record<string, unknown> = {};
  try {
    if (prompt.versions?.[0]?.parametersJson) parameters = JSON.parse(prompt.versions[0].parametersJson);
  } catch {
    // Malformed parameters are simply not shown.
  }

  const copyPrompt = async () => {
    if (await promptCopy.copy(prompt.fullPrompt)) api.recordCopy(prompt.id);
  };

  return (
    <article className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_2px_24px_rgba(0,0,0,0.08)] md:flex">
      <div className="relative md:w-1/2 bg-inset flex items-center justify-center min-h-[240px]">
        {!media ? (
          <pre className="p-8 font-mono text-[12.5px] leading-6 text-fg-muted whitespace-pre-wrap">
            <PromptText text={prompt.fullPrompt} />
          </pre>
        ) : media.mediaType === 'VIDEO' ? (
          <video
            key={media.id}
            src={media.url}
            poster={media.thumbnailUrl || undefined}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="block w-full h-auto max-h-[80vh] object-contain"
          />
        ) : media.mediaType === 'AUDIO' ? (
          <div className="w-full px-8 py-16">
            <audio key={media.id} src={media.url} controls className="w-full" />
          </div>
        ) : (
          <img src={resolveMediaUrl(media.url)} alt={media.caption || prompt.title} className="block w-full h-auto max-h-[80vh] object-contain" />
        )}

        {prompt.media.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/40 px-2 py-1.5">
            {prompt.media.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setMediaIndex(i)}
                aria-label={`Show output ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${i === mediaIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="md:w-1/2 min-w-0 flex flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 -ml-2">
            <button
              onClick={() => linkCopy.copy(`${window.location.origin}${fullPageHref}`)}
              className={iconButton}
              aria-label="Copy link"
              title={linkCopy.copied ? 'Link copied' : 'Copy link'}
            >
              {linkCopy.copied ? <Check className="w-5 h-5 text-success" /> : <Link2 className="w-5 h-5" />}
            </button>
            <Link to={fullPageHref} className={iconButton} aria-label="Open full page" title="Open full page">
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
          <button
            onClick={toggle}
            aria-pressed={starred}
            className={`h-11 px-5 rounded-full text-[14px] font-semibold transition-colors ${
              starred ? 'bg-fg text-canvas' : 'bg-accent text-white hover:bg-accent/90'
            }`}
          >
            {starred ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-muted">
          <ModelBadge model={prompt.model} link />
          <span className="text-fg-subtle">·</span>
          <Link to={`/explore?category=${prompt.category.slug}`} className="hover:text-link">
            {prompt.category.name}
          </Link>
        </div>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">{prompt.title}</h1>
        <p className="mt-2 text-fg-muted leading-relaxed">{prompt.shortDescription}</p>

        <Link to={`/users/${prompt.author.username}`} className="mt-6 flex items-center gap-3 group w-fit">
          <Avatar src={prompt.author.avatarUrl} name={prompt.author.username} size={40} />
          <div className="min-w-0">
            <div className="text-[14px] font-semibold group-hover:underline">{prompt.author.name || prompt.author.username}</div>
            <div className="text-xs text-fg-muted">@{prompt.author.username}</div>
          </div>
        </Link>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-fg-muted">
            <span className="font-medium text-fg">Prompt</span>
            {variables.length > 0 && (
              <span>
                {variables.length} {variables.length === 1 ? 'variable' : 'variables'}
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-line-muted bg-inset p-4 font-mono text-[12.5px] leading-6 whitespace-pre-wrap break-words">
            <PromptText text={prompt.fullPrompt} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={copyPrompt} className={`btn h-10 px-5 rounded-full ${promptCopy.copied ? 'btn-success' : 'btn-primary'}`}>
              {promptCopy.copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {promptCopy.copied ? 'Copied' : 'Copy prompt'}
            </button>
            {variables.length > 0 && (
              <button onClick={() => onUse(prompt)} className="btn btn-default h-10 px-5 rounded-full">
                <Braces className="w-4 h-4" />
                Fill variables
              </button>
            )}
            <Link
              to={`/studio?prompt=${encodeURIComponent(prompt.fullPrompt)}&model=${encodeURIComponent(prompt.model?.slug || '')}`}
              className="btn btn-default h-10 px-4 rounded-full flex items-center gap-1.5 border-attention/30 hover:border-attention"
              title="Open in Higgsfield AI Studio"
            >
              <Sparkles className="w-4 h-4 text-attention" />
              <span>Studio</span>
            </Link>
            <UseInAiButton prompt={prompt} size="md" />
          </div>
        </div>

        {Object.keys(parameters).length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {Object.entries(parameters).map(([key, val]) => (
              <span key={key} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-subtle font-mono text-xs">
                <span className="text-fg-muted">{key}</span>
                <span>{String(val)}</span>
              </span>
            ))}
          </div>
        )}

        {prompt.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {prompt.tags.map((t) => (
              <Link key={t} to={`/explore?tag=${encodeURIComponent(t)}`} className="topic">
                {t}
              </Link>
            ))}
          </div>
        )}

        {prompt.attribution && (
          <p className="mt-6 text-xs text-fg-muted">
            Source:{' '}
            {prompt.sourceUrl ? (
              <a href={prompt.sourceUrl} target="_blank" rel="noreferrer" className="link">
                {prompt.attribution}
              </a>
            ) : (
              prompt.attribution
            )}
          </p>
        )}

        <div className="mt-auto pt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-fg-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {formatCount(count)}
            </span>
            <span className="flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" />
              {formatCount(prompt.copyCount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatCount(prompt.viewsCount || 0)}
            </span>
          </div>
          <Link to={fullPageHref} className="link inline-flex items-center gap-1">
            Versions, suggestions & discussions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};

// Pinterest-style closeup that opens over the gallery (below the site header).
export const PinCloseup: React.FC<PinCloseupProps> = ({ slug, onClose, onOpenPin, onUse, onStarChange }) => {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [related, setRelated] = useState<Prompt[]>([]);
  const [failed, setFailed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setPrompt(null);
    setRelated([]);
    setFailed(false);
    scrollRef.current?.scrollTo({ top: 0 });

    api.getPrompt(slug)
      .then((p) => {
        if (cancelled) return;
        setPrompt(p);
        return api.getPrompts({ category: p.category.slug, sort: 'trending', limit: 30 });
      })
      .then((data) => {
        if (!cancelled && data) setRelated(data.prompts.filter((r) => r.slug !== slug));
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      // A modal opened from the closeup (e.g. Fill variables) handles its own Escape.
      if (e.key === 'Escape' && !document.querySelector('[data-modal]')) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return createPortal(
    <div ref={scrollRef} role="dialog" aria-modal="true" aria-label={prompt?.title ?? 'Prompt'} className="fixed inset-x-0 bottom-0 top-14 z-30 overflow-y-auto bg-canvas">
      <div className="page pt-4 pb-16">
        <div className="relative mx-auto max-w-[1016px]">
          <button
            onClick={onClose}
            aria-label="Back to gallery"
            title="Back"
            className="mb-3 xl:mb-0 xl:absolute xl:-left-16 xl:top-0 inline-flex w-11 h-11 items-center justify-center rounded-full transition-colors hover:bg-subtle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {prompt ? (
            <CloseupCard prompt={prompt} onUse={onUse} onStarChange={onStarChange} />
          ) : failed ? (
            <div className="box rounded-[28px] px-6 py-20 text-center">
              <h2 className="text-[15px] font-semibold">This prompt couldn’t be loaded</h2>
              <button onClick={onClose} className="btn btn-default mt-4">
                Back to gallery
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] border border-line md:flex">
              <div className="skeleton rounded-none md:w-1/2 aspect-[4/5]" />
              <div className="md:w-1/2 p-8 space-y-4">
                <div className="skeleton h-10 w-24 ml-auto rounded-full" />
                <div className="skeleton h-7 w-4/5" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-40 w-full rounded-xl" />
              </div>
            </div>
          )}
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-center text-lg font-semibold">More like this</h2>
            <Masonry
              items={related}
              getKey={(p) => p.id}
              getHeight={pinHeight}
              renderItem={(p) => <PinTile prompt={p} onOpen={onOpenPin} onUse={onUse} onStarChange={onStarChange} />}
            />
          </section>
        )}
      </div>
    </div>,
    document.body
  );
};
