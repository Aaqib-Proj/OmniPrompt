import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Star, Music2 } from 'lucide-react';
import { Prompt, Category, Challenge, Model } from '../types';
import { api } from '../services/api';
import { formatCount } from '../lib/format';
import { PromptCard, cardHeight } from '../components/prompt/PromptCard';
import { Masonry } from '../components/common/Masonry';
import { VariableReplacerModal } from '../components/prompt/VariableReplacerModal';
import { CardSkeleton, EmptyState, ModelBadge } from '../components/common/ui';

type SortKey = 'trending' | 'stars' | 'copies' | 'newest';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'stars', label: 'Most starred' },
  { key: 'copies', label: 'Most copied' },
  { key: 'newest', label: 'Newest' },
];

const SUGGESTED_SEARCHES = ['portrait', 'dashboard', 'agent', 'cinematic', 'lo-fi'];

interface Stats {
  totalPrompts: number;
  totalModels: number;
  totalCreators: number;
  totalStars: number;
  ticker: string[];
}

const Thumbnail: React.FC<{ prompt: Prompt }> = ({ prompt }) => {
  const media = prompt.media?.[0];
  const src = media?.mediaType === 'VIDEO' ? media.thumbnailUrl : media?.mediaType === 'IMAGE' ? media.url : null;

  return (
    <span className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden bg-inset border border-line-muted flex items-center justify-center text-fg-subtle">
      {src ? (
        <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
      ) : media?.mediaType === 'VIDEO' ? (
        <video src={`${media.url}#t=0.1`} preload="metadata" muted playsInline className="w-full h-full object-cover" />
      ) : (
        <Music2 className="w-4 h-4" />
      )}
    </span>
  );
};

export const HomePage: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [topStarred, setTopStarred] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSort, setActiveSort] = useState<SortKey>('trending');
  const [selectedPromptForVars, setSelectedPromptForVars] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getCategories().then((d) => setCategories(d.categories)).catch(console.error);
    api.getModels().then((d) => setModels(d.models)).catch(console.error);
    api.getStatsSummary().then(setStats).catch(console.error);
    api.getPrompts({ sort: 'stars', limit: 5 }).then((d) => setTopStarred(d.prompts)).catch(console.error);
    api.getActiveChallenge().then((d) => setChallenge(d.challenge)).catch(() => setChallenge(null));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getPrompts({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      sort: activeSort,
      limit: 12,
    })
      .then((data) => setPrompts(data.prompts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, activeSort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/explore?search=${encodeURIComponent(q)}` : '/explore');
  };

  const activeCategory = categories.find((c) => c.slug === selectedCategory);
  const categoryOptions = [{ slug: 'all', name: 'All prompts', badgeColor: '', promptsCount: stats?.totalPrompts }, ...categories];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="page py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-10 lg:gap-16 items-start">
          <div className="max-w-2xl">
            {challenge && (
              <Link
                to="/challenges"
                className="inline-flex max-w-full items-center gap-2 h-7 pl-1 pr-3 mb-6 rounded-full border border-line text-xs text-fg-muted hover:border-fg-subtle/60 hover:text-fg transition-colors"
              >
                <span className="inline-flex items-center h-5 px-2 rounded-full bg-accent/10 text-accent font-medium">
                  Challenge
                </span>
                <span className="truncate min-w-0">{challenge.title}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            )}

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08]">
              Prompts that work,
              <br className="hidden sm:block" /> shared in the open.
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-fg-muted max-w-xl">
              Find, fork and improve prompts for FLUX, Stable Diffusion, Veo, Claude, GPT-4o and more — with
              the outputs they produced, their parameters and version history.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={stats ? `Search ${stats.totalPrompts} prompts…` : 'Search prompts…'}
                  aria-label="Search prompts"
                  className="input h-10 pl-9 text-sm"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg">
                Search
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-fg-muted">
              <span>Try</span>
              {SUGGESTED_SEARCHES.map((term) => (
                <Link key={term} to={`/explore?search=${encodeURIComponent(term)}`} className="link">
                  {term}
                </Link>
              ))}
            </div>

            {stats && (
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                {[
                  ['Prompts', stats.totalPrompts],
                  ['Models', stats.totalModels],
                  ['Creators', stats.totalCreators],
                  ['Stars given', stats.totalStars],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col-reverse">
                    <dt className="text-[13px] text-fg-muted">{label}</dt>
                    <dd className="text-2xl font-semibold tabular-nums">{formatCount(Number(value))}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <aside className="box overflow-hidden">
            <div className="box-header">
              <span className="flex items-center gap-2 font-medium">
                <Star className="w-4 h-4 text-fg-muted" />
                Most starred
              </span>
              <Link to="/explore?sort=stars" className="text-xs link">
                View all
              </Link>
            </div>
            <ol>
              {topStarred.length === 0
                ? Array.from({ length: 5 }, (_, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3 border-t border-line-muted first:border-t-0">
                      <div className="skeleton w-10 h-10 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-4/5" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </li>
                  ))
                : topStarred.map((p, i) => (
                    <li key={p.id} className="border-t border-line-muted first:border-t-0">
                      <Link to={`/prompts/${p.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-subtle transition-colors">
                        <span className="w-3 text-xs text-fg-subtle tabular-nums">{i + 1}</span>
                        <Thumbnail prompt={p} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium truncate">{p.title}</div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-fg-muted">
                            <ModelBadge model={p.model} />
                            <span className="flex items-center gap-1 shrink-0">
                              <Star className="w-3 h-3" />
                              {formatCount(p.starsCount)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
            </ol>
          </aside>
        </div>
      </section>

      {/* Feed */}
      <section className="page py-10 grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-8 lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-8">
            <div>
              <h2 className="px-2 mb-2 text-xs font-semibold text-fg-muted">Categories</h2>
              <nav className="space-y-0.5">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    aria-current={selectedCategory === cat.slug ? 'true' : undefined}
                    className="nav-item"
                  >
                    {cat.badgeColor ? (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.badgeColor }} />
                    ) : (
                      <span className="w-2 h-2 rounded-full shrink-0 border border-fg-subtle" />
                    )}
                    <span className="truncate">{cat.name}</span>
                    {cat.promptsCount !== undefined && (
                      <span className="ml-auto text-xs text-fg-subtle tabular-nums">{cat.promptsCount}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {models.length > 0 && (
              <div>
                <h2 className="px-2 mb-2 text-xs font-semibold text-fg-muted">AI models</h2>
                <nav className="space-y-0.5">
                  {models.map((m) => (
                    <Link key={m.id} to={`/models/${m.slug}`} className="nav-item">
                      {m.badgeColor ? (
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.badgeColor }} />
                      ) : (
                        <span className="w-2 h-2 rounded-full shrink-0 border border-fg-subtle" />
                      )}
                      <span className="truncate">{m.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">{activeCategory ? activeCategory.name : 'All prompts'}</h2>
            <div className="segmented" role="group" aria-label="Sort prompts">
              {SORTS.map((s) => (
                <button key={s.key} onClick={() => setActiveSort(s.key)} aria-pressed={activeSort === s.key}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4 flex gap-2 overflow-x-auto pb-1">
            {categoryOptions.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`btn btn-sm shrink-0 ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-default'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, n) => (
                <CardSkeleton key={n} />
              ))}
            </div>
          ) : prompts.length > 0 ? (
            <Masonry
              items={prompts}
              getKey={(p) => p.id}
              getHeight={cardHeight}
              minColumnWidth={260}
              minColumns={1}
              maxColumns={4}
              renderItem={(prompt) => <PromptCard prompt={prompt} onOpenVariables={setSelectedPromptForVars} />}
            />
          ) : (
            <EmptyState title="No prompts in this category yet">
              Be the first to publish one.
            </EmptyState>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              to={selectedCategory === 'all' ? '/explore' : `/explore?category=${selectedCategory}`}
              className="btn btn-default"
            >
              Browse all prompts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <VariableReplacerModal
        prompt={selectedPromptForVars}
        isOpen={!!selectedPromptForVars}
        onClose={() => setSelectedPromptForVars(null)}
      />
    </div>
  );
};
