import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, SearchX, LayoutDashboard, LayoutGrid } from 'lucide-react';
import { Prompt, Category, Model } from '../types';
import { api } from '../services/api';
import { PromptCard, cardHeight } from '../components/prompt/PromptCard';
import { PinTile, pinHeight } from '../components/prompt/PinTile';
import { PinCloseup } from '../components/prompt/PinCloseup';
import { VariableReplacerModal } from '../components/prompt/VariableReplacerModal';
import { Masonry } from '../components/common/Masonry';
import { CardSkeleton, EmptyState } from '../components/common/ui';

const PAGE_SIZE = 30;
const SKELETON_TILES = [2 / 3, 1, 3 / 4, 4 / 5, 4 / 3, 2 / 3, 3 / 4, 1, 4 / 5, 2 / 3, 3 / 4, 4 / 3].map((ratio, i) => ({
  id: String(i),
  ratio,
}));

const FilterChip: React.FC<{ label: React.ReactNode; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-full border border-line bg-subtle text-xs text-fg">
    {label}
    <button onClick={onRemove} aria-label="Remove filter" className="rounded-full p-0.5 text-fg-muted hover:bg-line-muted hover:text-fg">
      <X className="w-3 h-3" />
    </button>
  </span>
);

const categoryChip = (active: boolean) =>
  `inline-flex items-center h-9 px-4 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
    active ? 'bg-fg text-canvas' : 'bg-subtle text-fg hover:bg-line-muted'
  }`;

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedPromptForVars, setSelectedPromptForVars] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const currentCategory = searchParams.get('category') || 'all';
  const currentModel = searchParams.get('model') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'trending';
  const currentTag = searchParams.get('tag') || '';
  const view = searchParams.get('view') === 'grid' ? 'grid' : 'gallery';
  const pinSlug = searchParams.get('pin');

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getModels()])
      .then(([catData, modelData]) => {
        setCategories(catData.categories);
        setModels(modelData.models);
      })
      .catch(console.error);
  }, []);

  const buildQuery = (pageNumber: number) => ({
    category: currentCategory === 'all' ? undefined : currentCategory,
    model: currentModel === 'all' ? undefined : currentModel,
    search: currentSearch || undefined,
    tag: currentTag || undefined,
    sort: currentSort,
    limit: PAGE_SIZE,
    page: pageNumber,
  });

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    api.getPrompts(buildQuery(1))
      .then((data) => {
        if (id !== requestId.current) return;
        setPrompts(data.prompts);
        setPage(1);
        setTotal(data.pagination?.total ?? data.prompts.length);
        setTotalPages(data.pagination?.totalPages ?? 1);
      })
      .catch(console.error)
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory, currentModel, currentSearch, currentSort, currentTag]);

  const loadMore = () => {
    if (loading || loadingMoreRef.current || page >= totalPages) return;
    const id = requestId.current;
    const next = page + 1;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    api.getPrompts(buildQuery(next))
      .then((data) => {
        if (id !== requestId.current) return;
        setPrompts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...data.prompts.filter((p) => !seen.has(p.id))];
        });
        setPage(next);
      })
      .catch(console.error)
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  };

  // Infinite scroll: load the next page when the sentinel is within ~800px of the viewport.
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMoreRef.current(), {
      rootMargin: '800px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The observer only fires on changes, so re-check after each page lands.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!loading && el && el.getBoundingClientRect().top < window.innerHeight + 800) loadMoreRef.current();
  }, [page, loading]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    next.delete('pin');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    const next = new URLSearchParams();
    if (currentSort !== 'trending') next.set('sort', currentSort);
    if (view === 'grid') next.set('view', 'grid');
    setSearchParams(next);
  };

  // The closeup lives in the URL (?pin=slug) so it can be shared and the back button closes it.
  const openPin = useCallback(
    (prompt: Prompt) => {
      const next = new URLSearchParams(searchParams);
      next.set('pin', prompt.slug);
      setSearchParams(next, { state: { fromGallery: true } });
    },
    [searchParams, setSearchParams]
  );

  const closePin = useCallback(() => {
    if ((location.state as { fromGallery?: boolean } | null)?.fromGallery) {
      navigate(-1);
    } else {
      const next = new URLSearchParams(searchParams);
      next.delete('pin');
      setSearchParams(next, { replace: true });
    }
  }, [location.state, navigate, searchParams, setSearchParams]);

  const handleStarChange = useCallback((id: string, starred: boolean, exactCount?: number) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isStarred: starred,
              starsCount: typeof exactCount === 'number' ? exactCount : Math.max(0, (p.starsCount || 0) + (starred ? 1 : -1)),
            }
          : p
      )
    );
  }, []);

  const modelName = models.find((m) => m.slug === currentModel)?.name;
  const hasActiveFilters = currentCategory !== 'all' || currentModel !== 'all' || !!currentSearch || !!currentTag;

  return (
    <>
      <div className="page pt-6 pb-10">
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search images, videos and prompts"
            aria-label="Search prompts"
            className="w-full h-12 pl-11 pr-4 rounded-full border border-transparent bg-subtle text-[14px] placeholder:text-fg-subtle transition-shadow focus:outline-none focus:bg-canvas focus:border-link focus:ring-[3px] focus:ring-link/20"
          />
        </form>

        <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto sm:flex-wrap sm:justify-center pb-1">
          <button onClick={() => updateParam('category', 'all')} className={categoryChip(currentCategory === 'all')}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => updateParam('category', c.slug)} className={categoryChip(currentCategory === c.slug)}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[13px] text-fg-muted">
            <strong className="font-semibold text-fg tabular-nums">{loading ? '–' : total}</strong> {total === 1 ? 'prompt' : 'prompts'}
          </span>
          {currentSearch && <FilterChip label={<>“{currentSearch}”</>} onRemove={() => updateParam('search', '')} />}
          {modelName && <FilterChip label={modelName} onRemove={() => updateParam('model', '')} />}
          {currentTag && <FilterChip label={<>#{currentTag}</>} onRemove={() => updateParam('tag', '')} />}
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-xs link ml-1">
              Clear all
            </button>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              value={currentModel}
              onChange={(e) => updateParam('model', e.target.value)}
              className="input w-auto max-w-[12rem]"
              aria-label="Model"
            >
              <option value="all">All models</option>
              {models.map((m) => (
                <option key={m.id} value={m.slug}>{m.name}</option>
              ))}
            </select>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value === 'trending' ? '' : e.target.value)}
              className="input w-auto"
              aria-label="Sort"
            >
              <option value="trending">Trending</option>
              <option value="stars">Most saved</option>
              <option value="copies">Most copied</option>
              <option value="newest">Newest</option>
            </select>
            <div className="segmented" role="group" aria-label="Layout">
              <button onClick={() => updateParam('view', '')} aria-pressed={view === 'gallery'} aria-label="Gallery view" title="Gallery">
                <LayoutDashboard className="w-4 h-4" />
              </button>
              <button onClick={() => updateParam('view', 'grid')} aria-pressed={view === 'grid'} aria-label="Card view" title="Cards">
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            view === 'gallery' ? (
              <Masonry
                items={SKELETON_TILES}
                getKey={(t) => t.id}
                getHeight={(t) => 1 / t.ratio + 0.3}
                renderItem={(t) => (
                  <div>
                    <div className="skeleton rounded-2xl" style={{ aspectRatio: String(t.ratio) }} />
                    <div className="skeleton h-3 w-4/5 mt-3" />
                    <div className="skeleton h-3 w-1/2 mt-2" />
                  </div>
                )}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, n) => (
                  <CardSkeleton key={n} />
                ))}
              </div>
            )
          ) : prompts.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No prompts match these filters"
              action={
                hasActiveFilters && (
                  <button onClick={clearAllFilters} className="btn btn-default">
                    Clear filters
                  </button>
                )
              }
            >
              Try a broader search, or remove a filter.
            </EmptyState>
          ) : view === 'gallery' ? (
            <Masonry
              items={prompts}
              getKey={(p) => p.id}
              getHeight={pinHeight}
              renderItem={(p) => (
                <PinTile prompt={p} onOpen={openPin} onUse={setSelectedPromptForVars} onStarChange={handleStarChange} />
              )}
            />
          ) : (
            <Masonry
              items={prompts}
              getKey={(p) => p.id}
              getHeight={cardHeight}
              minColumnWidth={260}
              minColumns={1}
              renderItem={(prompt) => (
                <PromptCard prompt={prompt} onOpenVariables={setSelectedPromptForVars} onStarToggle={handleStarChange} />
              )}
            />
          )}

          <div ref={sentinelRef} className="h-px" />
          {loadingMore && <p className="py-8 text-center text-[13px] text-fg-muted">Loading more…</p>}
          {!loading && prompts.length > 0 && page >= totalPages && (
            <p className="pt-12 text-center text-xs text-fg-subtle">You’ve reached the end.</p>
          )}
        </div>
      </div>

      {pinSlug && (
        <PinCloseup
          slug={pinSlug}
          onClose={closePin}
          onOpenPin={openPin}
          onUse={setSelectedPromptForVars}
          onStarChange={handleStarChange}
        />
      )}

      <VariableReplacerModal
        prompt={selectedPromptForVars}
        isOpen={!!selectedPromptForVars}
        onClose={() => setSelectedPromptForVars(null)}
      />
    </>
  );
};
