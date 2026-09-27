import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, FileText } from 'lucide-react';
import { PromptPack } from '../types';
import { api } from '../services/api';
import { formatCount } from '../lib/format';
import { EmptyState, ModelBadge, PageHeader } from '../components/common/ui';

const PREVIEW_COUNT = 4;

export const PacksPage: React.FC = () => {
  const [packs, setPacks] = useState<PromptPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPacks()
      .then((data) => setPacks(data.packs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page py-8">
      <PageHeader
        title="Prompt packs"
        description="Curated bundles of prompts. Download a pack as JSON and load it into your own tools or agents."
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="box p-5 space-y-3">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-5 w-2/3" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-24 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : packs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packs.map((pack) => {
              const items = pack.items || [];
              const count = pack.items?.length ?? pack._count?.items ?? 0;
              return (
                <article key={pack.id} className="box flex flex-col">
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                      <Package className="w-4 h-4" />
                      <span>{pack.category}</span>
                      {pack.isFeatured && <span className="pill">Featured</span>}
                    </div>
                    <h2 className="mt-2 text-base font-semibold">{pack.title}</h2>
                    <p className="mt-1.5 text-[13px] text-fg-muted leading-relaxed">{pack.description}</p>

                    {items.length > 0 && (
                      <ul className="mt-4 rounded-md border border-line-muted divide-y divide-line-muted">
                        {items.slice(0, PREVIEW_COUNT).map(({ prompt }) => (
                          <li key={prompt.id}>
                            <Link to={`/prompts/${prompt.slug}`} className="flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-subtle transition-colors">
                              <FileText className="w-3.5 h-3.5 text-fg-subtle shrink-0" />
                              <span className="truncate">{prompt.title}</span>
                              {prompt.model && <ModelBadge model={prompt.model} className="ml-auto shrink-0 max-w-[40%] text-xs text-fg-muted" />}
                            </Link>
                          </li>
                        ))}
                        {items.length > PREVIEW_COUNT && (
                          <li className="px-3 py-2 text-xs text-fg-muted">and {items.length - PREVIEW_COUNT} more</li>
                        )}
                      </ul>
                    )}
                  </div>

                  <footer className="flex items-center justify-between gap-3 px-5 py-3 border-t border-line-muted bg-subtle rounded-b-lg text-xs text-fg-muted">
                    <span>
                      {count} {count === 1 ? 'prompt' : 'prompts'} · {formatCount(pack.downloadsCount || 0)} downloads
                    </span>
                    <a href={`${import.meta.env.VITE_API_URL || ''}/api/v1/packs/${pack.id}/export`} download className="btn btn-sm btn-default">
                      <Download className="w-3.5 h-3.5" />
                      Download JSON
                    </a>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Package} title="No packs yet" />
        )}
      </div>
    </div>
  );
};
