import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star,
  GitFork,
  Copy,
  Check,
  GitPullRequest,
  GitMerge,
  GitPullRequestClosed,
  MessageSquare,
  History,
  FileText,
  BookOpen,
  MonitorPlay,
  Braces,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Eye,
  Scale,
  Clock,
  Folder,
  Cpu,
  Database,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { Prompt, FeedbackThread, EditSuggestion } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { openAuthModal } from '../lib/events';
import { extractVariables, formatCount, timeAgo } from '../lib/format';
import { resolveMediaUrl } from '../lib/media';
import { LiveAppSandbox } from '../components/prompt/LiveAppSandbox';
import { LineageGraph } from '../components/prompt/LineageGraph';
import { VariableReplacerModal } from '../components/prompt/VariableReplacerModal';
import { SuggestEditModal } from '../components/prompt/SuggestEditModal';
import { EditPromptModal } from '../components/prompt/EditPromptModal';
import { DiffView } from '../components/prompt/DiffView';
import { Avatar } from '../components/common/Avatar';
import { UseInAiButton } from '../components/prompt/UseInAiButton';
import { Markdown } from '../components/common/Markdown';
import { EmptyState, ModelBadge, PromptText } from '../components/common/ui';

const isUploadedFileName = (caption?: string | null): boolean => {
  if (!caption) return false;
  const s = caption.trim();
  if (/^whatsapp image/i.test(s)) return true;
  if (/^(img|dsc|pxl|screenshot|photo|image|capture|output|download)[-_\s0-9]/i.test(s)) return true;
  if (/\d{4}[-_ ]\d{2}[-_ ]\d{2}/.test(s)) return true;
  if (/\.(jpg|jpeg|png|webp|gif|svg|mp4|webm|mov|mp3)$/i.test(s)) return true;
  return false;
};

type Tab = 'prompt' | 'preview' | 'versions' | 'suggestions' | 'discussions' | 'forks';

const REACTIONS = [
  { type: 'FIRE', label: 'Works well', icon: ThumbsUp },
  { type: 'CONFUSED', label: 'Inconsistent', icon: HelpCircle },
  { type: 'BROKEN', label: 'Broken', icon: ThumbsDown },
];

const CountButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  disabled?: boolean;
}> = ({ onClick, icon, label, count, disabled }) => (
  <div className="inline-flex rounded-md border border-line overflow-hidden">
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 h-8 px-3 bg-subtle text-[13px] font-medium transition-colors hover:bg-line-muted disabled:opacity-60"
    >
      {icon}
      {label}
    </button>
    <span className="inline-flex items-center h-8 px-2.5 border-l border-line bg-canvas text-xs font-medium tabular-nums">
      {formatCount(count)}
    </span>
  </div>
);

const SuggestionIcon: React.FC<{ status: EditSuggestion['status'] }> = ({ status }) =>
  status === 'MERGED' ? (
    <GitMerge className="w-4 h-4 text-done shrink-0 mt-0.5" />
  ) : status === 'REJECTED' ? (
    <GitPullRequestClosed className="w-4 h-4 text-danger shrink-0 mt-0.5" />
  ) : (
    <GitPullRequest className="w-4 h-4 text-success shrink-0 mt-0.5" />
  );

const DetailSkeleton: React.FC = () => (
  <>
    <div className="border-b border-line">
      <div className="page pt-6 pb-4 space-y-3">
        <div className="skeleton h-4 w-56" />
        <div className="skeleton h-7 w-2/3" />
        <div className="skeleton h-4 w-80 mt-6" />
      </div>
    </div>
    <div className="page py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_296px] gap-8">
      <div className="space-y-6">
        <div className="skeleton aspect-[16/9] rounded-lg" />
        <div className="skeleton h-40 rounded-lg" />
      </div>
      <div className="space-y-3">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
      </div>
    </div>
  </>
);

export const PromptDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [starsCount, setStarsCount] = useState(0);
  const [copyCount, setCopyCount] = useState(0);
  const [showVarModal, setShowVarModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [threads, setThreads] = useState<FeedbackThread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newCommentBody, setNewCommentBody] = useState('');
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [reacted, setReacted] = useState<Set<string>>(new Set());
  const [forking, setForking] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const loadPromptData = () => {
    if (!idOrSlug) return;
    setLoading(true);
    api.getPrompt(idOrSlug)
      .then((data) => {
        setPrompt(data);
        setIsStarred(data.isStarred || false);
        setStarsCount(data.starsCount || 0);
        setCopyCount(data.copyCount || 0);
        setReactions(data.reactionCounts || {});
        setActiveMediaIndex(0);
        return api.getDiscussions(data.id);
      })
      .then((discData) => {
        if (discData?.threads) setThreads(discData.threads);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPromptData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrSlug]);

  if (loading) return <DetailSkeleton />;

  if (!prompt) {
    return (
      <div className="page py-24 text-center">
        <h1 className="text-2xl font-semibold">Prompt not found</h1>
        <p className="text-fg-muted mt-2">It may have been renamed, made private, or deleted.</p>
        <Link to="/explore" className="btn btn-default mt-6">
          Back to Explore
        </Link>
      </div>
    );
  }

  const variables = extractVariables(prompt.fullPrompt);
  const latestVersion = prompt.versions?.[0];
  const currentMedia = prompt.media?.[activeMediaIndex] || prompt.media?.[0];
  const isAuthor = user?.id === prompt.authorId;
  const suggestions = prompt.editSuggestions || [];
  const openSuggestions = suggestions.filter((s) => s.status === 'OPEN').length;
  const wordCount = prompt.fullPrompt.trim().split(/\s+/).length;

  let parameters: Record<string, unknown> = {};
  try {
    if (latestVersion?.parametersJson) parameters = JSON.parse(latestVersion.parametersJson);
  } catch {
    // Malformed parameters are simply not shown.
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'prompt', label: 'Prompt', icon: FileText },
    ...(prompt.sandboxCode ? [{ key: 'preview' as Tab, label: 'Live preview', icon: MonitorPlay }] : []),
    { key: 'versions', label: 'Versions', icon: History, count: prompt.versions?.length ?? 0 },
    { key: 'suggestions', label: 'Suggestions', icon: GitPullRequest, count: openSuggestions },
    { key: 'discussions', label: 'Discussions', icon: MessageSquare, count: threads.length },
    { key: 'forks', label: 'Forks', icon: GitFork, count: prompt.forksCount || 0 },
  ];
  const tabParam = searchParams.get('tab');
  const activeTab: Tab = tabs.some((t) => t.key === tabParam) ? (tabParam as Tab) : 'prompt';

  const setActiveTab = (tab: Tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'prompt') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const requireUser = () => {
    if (user) return true;
    openAuthModal('login');
    return false;
  };

  const handleCopy = async () => {
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
      // Clipboard access can be denied; the prompt text is still selectable.
    }
  };

  const handleStar = async () => {
    if (!requireUser()) return;
    try {
      const res = await api.toggleStar(prompt.id);
      setIsStarred(res.starred);
      if (typeof res?.starsCount === 'number') {
        setStarsCount(res.starsCount);
      } else {
        setStarsCount((n) => (res.starred ? n + 1 : Math.max(0, n - 1)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFork = async () => {
    if (!requireUser()) return;
    setForking(true);
    try {
      const res = await api.forkPrompt(prompt.id);
      navigate(`/prompts/${res.prompt.slug}`);
    } catch (err) {
      console.error(err);
    } finally {
      setForking(false);
    }
  };

  const handleReact = async (type: string) => {
    if (!requireUser() || reacted.has(type)) return;
    try {
      await api.reactToPrompt(prompt.id, type);
      setReactions((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
      setReacted((prev) => new Set(prev).add(type));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMergeSuggestion = async (suggestionId: string) => {
    try {
      await api.mergeSuggestion(suggestionId);
      loadPromptData();
    } catch (err: any) {
      alert(err.message || 'Failed to merge suggestion');
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !user) return;
    try {
      await api.createDiscussion(prompt.id, newThreadTitle, newCommentBody);
      setNewThreadTitle('');
      setNewCommentBody('');
      const disc = await api.getDiscussions(prompt.id);
      if (disc?.threads) setThreads(disc.threads);
    } catch (err) {
      console.error(err);
    }
  };

  const openSuggest = () => {
    if (requireUser()) setShowSuggestModal(true);
  };

  return (
    <>
      {/* Header */}
      <div className="border-b border-line">
        <div className="page pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-fg-muted">
                <Avatar src={prompt.author.avatarUrl} name={prompt.author.username} size={20} />
                <Link to={`/users/${prompt.author.username}`} className="hover:text-link">
                  {prompt.author.username}
                </Link>
                <span className="text-fg-subtle">/</span>
                <Link to={`/explore?category=${prompt.category.slug}`} className="hover:text-link">
                  {prompt.category.name}
                </Link>
                <span className="pill">{prompt.visibility === 'PRIVATE' ? 'Private' : 'Public'}</span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight leading-snug">{prompt.title}</h1>
              {prompt.forkedFrom && (
                <p className="mt-1 flex items-center gap-1 text-[13px] text-fg-muted">
                  <GitFork className="w-3.5 h-3.5" />
                  Forked from{' '}
                  <Link to={`/prompts/${prompt.forkedFrom.slug}`} className="link">
                    {prompt.forkedFrom.author.username}/{prompt.forkedFrom.title}
                  </Link>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAuthor && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-default flex items-center gap-1.5"
                  title="Edit prompt details, outputs, and parameters"
                >
                  <Pencil className="w-4 h-4 text-fg-muted" />
                  <span>Edit prompt</span>
                </button>
              )}
              <CountButton
                onClick={handleStar}
                icon={<Star className={`w-4 h-4 ${isStarred ? 'fill-attention text-attention' : 'text-fg-muted'}`} />}
                label={isStarred ? 'Starred' : 'Star'}
                count={starsCount}
              />
              <CountButton
                onClick={handleFork}
                disabled={forking}
                icon={<GitFork className="w-4 h-4 text-fg-muted" />}
                label={forking ? 'Forking…' : 'Fork'}
                count={prompt.forksCount || 0}
              />
              <button onClick={handleCopy} className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy prompt'}
              </button>
              <Link
                to={`/studio?prompt=${encodeURIComponent(prompt.fullPrompt)}&model=${encodeURIComponent(prompt.model?.slug || '')}`}
                className="btn btn-default flex items-center gap-1.5 border-attention/30 hover:border-attention text-fg"
                title="Generate with Higgsfield AI Studio"
              >
                <Sparkles className="w-4 h-4 text-attention" />
                <span>Studio</span>
              </Link>
              <UseInAiButton prompt={prompt} size="md" />
            </div>
          </div>

          <nav role="tablist" className="mt-4 -mb-px flex gap-2 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className="tab"
              >
                <Icon className="w-4 h-4 text-fg-subtle" />
                {label}
                {count !== undefined && count > 0 && <span className="counter">{count}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="page py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_296px] gap-8 lg:gap-10">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {activeTab === 'prompt' && (
            <>
              {prompt.sandboxCode && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg border border-line bg-subtle text-[13px]">
                  <span className="flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4 text-fg-muted" />
                    This prompt includes a runnable preview of its output.
                  </span>
                  <button onClick={() => setActiveTab('preview')} className="btn btn-sm btn-default">
                    Open preview
                  </button>
                </div>
              )}

              {currentMedia && (
                <figure className="box overflow-hidden">
                  <div className="relative bg-inset/40 flex items-center justify-center overflow-hidden p-2 sm:p-4 min-h-[260px]">
                    {currentMedia.mediaType === 'VIDEO' ? (
                      <video
                        key={currentMedia.id}
                        src={currentMedia.url}
                        poster={currentMedia.thumbnailUrl || undefined}
                        controls
                        loop
                        muted
                        playsInline
                        className="max-w-full max-h-[720px] w-auto h-auto rounded-md shadow-sm"
                      />
                    ) : currentMedia.mediaType === 'AUDIO' ? (
                      <div className="w-full max-w-md px-6 py-6">
                        <audio key={currentMedia.id} src={currentMedia.url} controls className="w-full" />
                      </div>
                    ) : (
                      <img
                        src={resolveMediaUrl(currentMedia.url)}
                        alt={prompt.title}
                        className="max-w-full max-h-[720px] w-auto h-auto object-contain rounded-md shadow-sm select-none"
                      />
                    )}
                  </div>
                  {(prompt.media.length > 1 || (currentMedia.caption && !isUploadedFileName(currentMedia.caption))) && (
                    <figcaption className="flex items-center gap-3 px-3 py-2 border-t border-line-muted">
                      {prompt.media.length > 1 && (
                        <div className="flex gap-1.5 shrink-0">
                          {prompt.media.map((m, index) => (
                            <button
                              key={m.id}
                              onClick={() => setActiveMediaIndex(index)}
                              aria-label={`Show output ${index + 1}`}
                              className={`w-12 h-8 rounded overflow-hidden border bg-inset ${
                                index === activeMediaIndex ? 'border-link ring-2 ring-link/30' : 'border-line opacity-70 hover:opacity-100'
                              }`}
                            >
                              {m.mediaType === 'VIDEO' && !m.thumbnailUrl ? (
                                <video src={`${m.url}#t=0.1`} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                              ) : (
                                m.mediaType !== 'AUDIO' && <img src={resolveMediaUrl(m.thumbnailUrl || m.url)} alt="" className="w-full h-full object-cover" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {currentMedia.caption && !isUploadedFileName(currentMedia.caption) && (
                        <span className="text-[13px] text-fg-muted truncate">{currentMedia.caption}</span>
                      )}
                      {prompt.media.length > 1 && (
                        <span className="ml-auto text-xs text-fg-subtle tabular-nums shrink-0">
                          {activeMediaIndex + 1} / {prompt.media.length}
                        </span>
                      )}
                    </figcaption>
                  )}
                </figure>
              )}

              <section className="box">
                <div className="box-header flex-wrap">
                  <div className="flex items-center gap-2 min-w-0 text-fg-muted">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium text-fg">Prompt</span>
                    {latestVersion && <span className="font-mono text-xs">{latestVersion.versionNumber}</span>}
                    <span className="text-xs">· {wordCount} words</span>
                    {variables.length > 0 && (
                      <span className="text-xs">
                        · {variables.length} {variables.length === 1 ? 'variable' : 'variables'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {variables.length > 0 && (
                      <button onClick={() => setShowVarModal(true)} className="btn btn-sm btn-default">
                        <Braces className="w-3.5 h-3.5" />
                        Fill variables
                      </button>
                    )}
                    {isAuthor ? (
                      <button onClick={() => setShowEditModal(true)} className="btn btn-sm btn-default flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit prompt
                      </button>
                    ) : (
                      <button onClick={openSuggest} className="btn btn-sm btn-default">
                        <GitPullRequest className="w-3.5 h-3.5" />
                        Suggest edit
                      </button>
                    )}
                    <UseInAiButton prompt={prompt} size="sm" />
                    <button onClick={handleCopy} className="btn btn-sm btn-ghost btn-icon w-7" aria-label="Copy prompt" title="Copy prompt">
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <pre className="p-4 font-mono text-[13px] leading-6 whitespace-pre-wrap break-words">
                  <PromptText text={prompt.fullPrompt} />
                </pre>
              </section>

              {prompt.descriptionMd?.trim() && (
                <section className="box">
                  <div className="box-header">
                    <span className="flex items-center gap-2 font-medium">
                      <BookOpen className="w-4 h-4 text-fg-muted" />
                      README
                    </span>
                  </div>
                  <div className="px-6 py-5">
                    <Markdown source={prompt.descriptionMd} />
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === 'preview' && prompt.sandboxCode && (
            <LiveAppSandbox code={prompt.sandboxCode} title={prompt.title} />
          )}

          {activeTab === 'versions' &&
            (prompt.versions && prompt.versions.length > 0 ? (
              <div className="box">
                <div className="box-header">
                  <span className="font-medium">
                    {prompt.versions.length} {prompt.versions.length === 1 ? 'version' : 'versions'}
                  </span>
                </div>
                <ol>
                  {prompt.versions.map((ver, i) => (
                    <li key={ver.id} className="flex items-start gap-3 px-4 py-3 border-t border-line-muted first:border-t-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-medium">{ver.title}</span>
                          {i === 0 && <span className="pill border-success/40 text-success">Latest</span>}
                        </div>
                        <p className="text-[13px] text-fg-muted mt-0.5">{ver.changelog || 'No changelog provided.'}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-fg-muted">
                          {ver.editor && (
                            <>
                              <Avatar src={ver.editor.avatarUrl} name={ver.editor.username} size={16} />
                              <span className="font-medium text-fg">{ver.editor.username}</span>
                            </>
                          )}
                          <span>committed {timeAgo(ver.createdAt)}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center h-6 px-2 rounded-md border border-line bg-subtle font-mono text-xs shrink-0">
                        {ver.versionNumber}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <EmptyState icon={History} title="No version history yet" />
            ))}

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-fg-muted">
                  Suggest an improvement. The author can review the changes and merge them into a new version.
                </p>
                <button onClick={openSuggest} className="btn btn-sm btn-primary">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  New suggestion
                </button>
              </div>

              {suggestions.length > 0 ? (
                <div className="box">
                  <div className="box-header justify-start gap-5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <GitPullRequest className="w-4 h-4" />
                      {openSuggestions} open
                    </span>
                    <span className="flex items-center gap-1.5 text-fg-muted">
                      <GitMerge className="w-4 h-4" />
                      {suggestions.filter((s) => s.status === 'MERGED').length} merged
                    </span>
                  </div>
                  <ul>
                    {suggestions.map((sug) => {
                      const expanded = expandedSuggestion === sug.id;
                      return (
                        <li key={sug.id} className="px-4 py-3 border-t border-line-muted first:border-t-0">
                          <div className="flex items-start gap-3">
                            <SuggestionIcon status={sug.status} />
                            <div className="min-w-0 flex-1">
                              <button
                                onClick={() => setExpandedSuggestion(expanded ? null : sug.id)}
                                className="text-left text-[14px] font-semibold hover:text-link"
                              >
                                {sug.proposedTitle}
                              </button>
                              <p className="text-xs text-fg-muted mt-0.5">
                                #{sug.id.slice(0, 6)} {sug.status === 'MERGED' ? 'merged' : 'opened'}{' '}
                                {timeAgo(sug.mergedAt || sug.createdAt)} by {sug.author.username}
                              </p>
                              {sug.notes && <p className="text-[13px] mt-2">{sug.notes}</p>}
                              <button
                                onClick={() => setExpandedSuggestion(expanded ? null : sug.id)}
                                className="mt-2 text-xs link"
                              >
                                {expanded ? 'Hide changes' : 'Show changes'}
                              </button>
                              {expanded && (
                                <div className="mt-3">
                                  <DiffView before={prompt.fullPrompt} after={sug.proposedPromptText} />
                                </div>
                              )}
                            </div>
                            {isAuthor && sug.status === 'OPEN' && (
                              <button onClick={() => handleMergeSuggestion(sug.id)} className="btn btn-sm btn-success shrink-0">
                                <GitMerge className="w-3.5 h-3.5" />
                                Merge
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <EmptyState icon={GitPullRequest} title="No suggestions yet">
                  Spotted a way to get better outputs? Propose an edit and the author can merge it.
                </EmptyState>
              )}
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="space-y-4">
              {user ? (
                <form onSubmit={handleCreateThread} className="box">
                  <div className="box-header">
                    <span className="font-medium">Start a discussion</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      required
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      placeholder="Title"
                      aria-label="Discussion title"
                      className="input"
                    />
                    <textarea
                      rows={3}
                      value={newCommentBody}
                      onChange={(e) => setNewCommentBody(e.target.value)}
                      placeholder="What did you try, which model and settings did you use, and what happened?"
                      aria-label="Discussion body"
                      className="input resize-y"
                    />
                    <div className="flex justify-end">
                      <button type="submit" disabled={!newThreadTitle.trim()} className="btn btn-sm btn-primary">
                        Start discussion
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="box flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px]">
                  <span className="text-fg-muted">Sign in to ask a question or report a problem with this prompt.</span>
                  <button onClick={() => openAuthModal('login')} className="btn btn-sm btn-default">
                    Sign in
                  </button>
                </div>
              )}

              {threads.length > 0 ? (
                threads.map((t) => (
                  <article key={t.id} className="box">
                    <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-line-muted">
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold">{t.title}</h3>
                        <p className="text-xs text-fg-muted mt-0.5">
                          {t.author.username} opened {timeAgo(t.createdAt)} · {t.comments?.length || 0}{' '}
                          {t.comments?.length === 1 ? 'comment' : 'comments'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="pill">{t.tag}</span>
                        <span className={`pill ${t.status === 'RESOLVED' ? 'border-done/40 text-done' : 'border-success/40 text-success'}`}>
                          {t.status === 'RESOLVED' ? 'Resolved' : 'Open'}
                        </span>
                      </div>
                    </header>
                    {t.comments?.length > 0 && (
                      <ul>
                        {t.comments.map((c) => (
                          <li key={c.id} className="flex gap-3 px-4 py-3 border-t border-line-muted first:border-t-0">
                            <Avatar src={c.user.avatarUrl} name={c.user.username} size={24} />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs">
                                <span className="font-semibold">{c.user.username}</span>{' '}
                                <span className="text-fg-muted">{timeAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-[13px] mt-0.5 leading-relaxed whitespace-pre-wrap">{c.bodyMd}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))
              ) : (
                <EmptyState icon={MessageSquare} title="No discussions yet">
                  Questions, edge cases and results from other models all belong here.
                </EmptyState>
              )}
            </div>
          )}

          {activeTab === 'forks' && <LineageGraph promptId={prompt.id} />}
        </div>

        {/* Sidebar */}
        <aside className="text-[13px] divide-y divide-line-muted [&>section]:py-6 [&>section:first-child]:pt-0">
          <section>
            <h2 className="text-[15px] font-semibold mb-2">About</h2>
            <p className="leading-relaxed">{prompt.shortDescription}</p>

            {prompt.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {prompt.tags.map((t) => (
                  <Link key={t} to={`/explore?tag=${encodeURIComponent(t)}`} className="topic">
                    {t}
                  </Link>
                ))}
              </div>
            )}

            <ul className="mt-4 space-y-2 text-fg-muted">
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 shrink-0" />
                <ModelBadge model={prompt.model} link className="text-fg" />
              </li>
              <li className="flex items-center gap-2">
                <Folder className="w-4 h-4 shrink-0" />
                {prompt.category.name}
              </li>
              <li className="flex items-center gap-2">
                <Scale className="w-4 h-4 shrink-0" />
                {prompt.license} license
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 shrink-0" />
                <span><strong className="font-semibold text-fg">{formatCount(starsCount)}</strong> {starsCount === 1 ? 'star' : 'stars'}</span>
              </li>
              <li className="flex items-center gap-2">
                <GitFork className="w-4 h-4 shrink-0" />
                <span><strong className="font-semibold text-fg">{formatCount(prompt.forksCount || 0)}</strong> {prompt.forksCount === 1 ? 'fork' : 'forks'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Copy className="w-4 h-4 shrink-0" />
                <span><strong className="font-semibold text-fg">{formatCount(copyCount)}</strong> {copyCount === 1 ? 'copy' : 'copies'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Eye className="w-4 h-4 shrink-0" />
                <span><strong className="font-semibold text-fg">{formatCount(prompt.viewsCount || 0)}</strong> {prompt.viewsCount === 1 ? 'view' : 'views'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                Updated {timeAgo(prompt.updatedAt)}
              </li>
              {prompt.sourceName && (
                <li className="flex items-center gap-2 min-w-0">
                  <Database className="w-4 h-4 shrink-0" />
                  {prompt.sourceUrl ? (
                    <a href={prompt.sourceUrl} target="_blank" rel="noreferrer" className="link truncate">
                      {prompt.sourceName}
                    </a>
                  ) : (
                    <span className="truncate">{prompt.sourceName}</span>
                  )}
                </li>
              )}
            </ul>
            {prompt.attribution && <p className="mt-3 text-xs text-fg-muted leading-relaxed">{prompt.attribution}</p>}
          </section>

          {Object.keys(parameters).length > 0 && (
            <section>
              <h2 className="text-[15px] font-semibold mb-3">Parameters</h2>
              <dl className="rounded-md border border-line divide-y divide-line-muted">
                {Object.entries(parameters).map(([key, val]) => (
                  <div key={key} className="flex items-baseline justify-between gap-3 px-3 py-2">
                    <dt className="font-mono text-xs text-fg-muted">{key}</dt>
                    <dd className="font-mono text-xs text-right break-all">{String(val)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section>
            <h2 className="text-[15px] font-semibold">Did it work for you?</h2>
            <p className="text-xs text-fg-muted mt-0.5 mb-3">Help others know what to expect.</p>
            <div className="flex flex-wrap gap-1.5">
              {REACTIONS.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => handleReact(type)}
                  aria-pressed={reacted.has(type)}
                  className={`btn btn-sm btn-default ${reacted.has(type) ? 'border-link/50 text-link' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className="counter">{reactions[type] ?? 0}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-3">Author</h2>
            <Link to={`/users/${prompt.author.username}`} className="flex items-center gap-3 group">
              <Avatar src={prompt.author.avatarUrl} name={prompt.author.username} size={40} />
              <div className="min-w-0">
                <div className="font-semibold truncate group-hover:text-link">{prompt.author.name || prompt.author.username}</div>
                <div className="text-xs text-fg-muted truncate">@{prompt.author.username}</div>
              </div>
            </Link>
          </section>
        </aside>
      </div>

      <VariableReplacerModal prompt={prompt} isOpen={showVarModal} onClose={() => setShowVarModal(false)} />

      <SuggestEditModal
        prompt={prompt}
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
        onSuccess={() => {
          loadPromptData();
          setActiveTab('suggestions');
        }}
      />

      {isAuthor && (
        <EditPromptModal
          prompt={prompt}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            if (updated) {
              setPrompt(updated);
            } else {
              loadPromptData();
            }
          }}
        />
      )}
    </>
  );
};
