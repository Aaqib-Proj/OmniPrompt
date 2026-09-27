import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, SearchX } from 'lucide-react';
import { Model } from '../types';
import { api } from '../services/api';
import { EmptyState, PageHeader, ProviderMark } from '../components/common/ui';

// Substring match against the model's modality string (e.g. "Multimodal / Code").
const MODALITIES = [
  { value: 'all', label: 'All modalities' },
  { value: 'Image', label: 'Image' },
  { value: 'Video', label: 'Video' },
  { value: 'Audio', label: 'Audio' },
  { value: 'Code', label: 'Code & UI' },
  { value: 'Text', label: 'Text & reasoning' },
  { value: 'Multimodal', label: 'Multimodal' },
];

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedModality, setSelectedModality] = useState('all');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModels()
      .then((data) => setModels(data.models))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const providers = Array.from(new Set(models.map((m) => m.provider))).sort();
  const needle = filter.trim().toLowerCase();

  const filteredModels = models.filter((m) => {
    if (selectedProvider !== 'all' && m.provider !== selectedProvider) return false;
    if (selectedModality !== 'all' && !m.modality.includes(selectedModality)) return false;
    if (needle && !`${m.name} ${m.provider}`.toLowerCase().includes(needle)) return false;
    return true;
  });

  const resetFilters = () => {
    setSelectedProvider('all');
    setSelectedModality('all');
    setFilter('');
  };

  return (
    <div className="page py-8">
      <PageHeader title="Models" description="Every model with prompts on OmniPrompt. Open one to see the prompts written for it." />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-10 mt-6">
        <aside className="hidden lg:block space-y-8">
          <div>
            <h2 className="px-2 mb-2 text-xs font-semibold text-fg-muted">Modality</h2>
            <nav className="space-y-0.5">
              {MODALITIES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedModality(m.value)}
                  aria-current={selectedModality === m.value ? 'true' : undefined}
                  className="nav-item"
                >
                  {m.label}
                </button>
              ))}
            </nav>
          </div>
          <div>
            <h2 className="px-2 mb-2 text-xs font-semibold text-fg-muted">Provider</h2>
            <nav className="space-y-0.5">
              <button onClick={() => setSelectedProvider('all')} aria-current={selectedProvider === 'all' ? 'true' : undefined} className="nav-item">
                All providers
              </button>
              {providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProvider(p)}
                  aria-current={selectedProvider === p ? 'true' : undefined}
                  className="nav-item"
                >
                  <span className="truncate">{p}</span>
                  <span className="ml-auto text-xs text-fg-subtle tabular-nums">
                    {models.filter((m) => m.provider === p).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none" />
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name or provider"
                aria-label="Filter models"
                className="input pl-9"
              />
            </div>
            <div className="flex gap-2 lg:hidden">
              <select value={selectedModality} onChange={(e) => setSelectedModality(e.target.value)} className="input w-auto" aria-label="Modality">
                {MODALITIES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="input w-auto" aria-label="Provider">
                <option value="all">All providers</option>
                {providers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-4 text-[13px] text-fg-muted">
            <strong className="font-semibold text-fg tabular-nums">{loading ? '–' : filteredModels.length}</strong>{' '}
            {filteredModels.length === 1 ? 'model' : 'models'}
          </p>

          <div className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 6 }, (_, n) => (
                  <div key={n} className="box p-4 flex gap-3.5">
                    <div className="skeleton w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-1/2" />
                      <div className="skeleton h-3 w-1/3" />
                      <div className="skeleton h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredModels.map((model) => (
                  <Link
                    key={model.id}
                    to={`/models/${model.slug}`}
                    className="group box p-4 flex gap-3.5 transition-colors hover:border-fg-subtle/60"
                  >
                    <ProviderMark model={model} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-semibold truncate group-hover:text-link">{model.name}</h3>
                      <p className="text-xs text-fg-muted mt-0.5 truncate">
                        {model.provider} · {model.modality}
                        {model.contextWindow && model.contextWindow !== 'N/A' && ` · ${model.contextWindow} context`}
                      </p>
                      <p className="text-[13px] text-fg-muted mt-2 leading-relaxed line-clamp-2">{model.description}</p>
                      <p className="flex items-center gap-1 mt-3 text-xs text-fg-muted">
                        <FileText className="w-3.5 h-3.5" />
                        {model.promptsCount ?? 0} {model.promptsCount === 1 ? 'prompt' : 'prompts'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No models match"
                action={
                  <button onClick={resetFilters} className="btn btn-default">
                    Reset filters
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
