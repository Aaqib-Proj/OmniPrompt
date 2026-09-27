import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowLeft, FileText } from 'lucide-react';
import { Model, Prompt } from '../types';
import { api } from '../services/api';
import { PromptCard, cardHeight } from '../components/prompt/PromptCard';
import { Masonry } from '../components/common/Masonry';
import { VariableReplacerModal } from '../components/prompt/VariableReplacerModal';
import { CardSkeleton, EmptyState, ProviderMark } from '../components/common/ui';

export const ModelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [model, setModel] = useState<(Model & { prompts: Prompt[] }) | null>(null);
  const [selectedPromptForVars, setSelectedPromptForVars] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getModel(slug)
      .then((data) => setModel(data.model))
      .catch(() => setModel(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="page py-8">
        <div className="skeleton h-4 w-20" />
        <div className="flex items-center gap-4 mt-6">
          <div className="skeleton w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-6 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-12">
          {Array.from({ length: 3 }, (_, n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="page py-24 text-center">
        <h1 className="text-2xl font-semibold">Model not found</h1>
        <Link to="/models" className="btn btn-default mt-6">
          All models
        </Link>
      </div>
    );
  }

  const promptCount = model.prompts?.length || 0;

  return (
    <>
      <div className="border-b border-line">
        <div className="page py-6">
          <Link to="/models" className="inline-flex items-center gap-1 text-[13px] text-fg-muted hover:text-link">
            <ArrowLeft className="w-3.5 h-3.5" />
            Models
          </Link>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <ProviderMark model={model} size={48} />
              <div className="min-w-0">
                <p className="text-[13px] text-fg-muted">{model.provider}</p>
                <h1 className="text-2xl font-semibold tracking-tight">{model.name}</h1>
              </div>
            </div>
            {model.officialUrl && (
              <a href={model.officialUrl} target="_blank" rel="noreferrer" className="btn btn-default">
                Official site
                <ExternalLink className="w-3.5 h-3.5 text-fg-muted" />
              </a>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill">{model.modality}</span>
            {model.contextWindow && model.contextWindow !== 'N/A' && <span className="pill">{model.contextWindow} context</span>}
            <span className="pill">
              {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-fg-muted leading-relaxed">{model.description}</p>
        </div>
      </div>

      <div className="page py-8">
        <h2 className="text-lg font-semibold mb-4">Prompts for {model.name}</h2>
        {promptCount > 0 ? (
          <Masonry
            items={model.prompts}
            getKey={(p) => p.id}
            getHeight={cardHeight}
            minColumnWidth={260}
            minColumns={1}
            maxColumns={4}
            renderItem={(prompt) => <PromptCard prompt={prompt} onOpenVariables={setSelectedPromptForVars} />}
          />
        ) : (
          <EmptyState icon={FileText} title={`No prompts for ${model.name} yet`}>
            Publish one and it will be listed here.
          </EmptyState>
        )}
      </div>

      <VariableReplacerModal
        prompt={selectedPromptForVars}
        isOpen={!!selectedPromptForVars}
        onClose={() => setSelectedPromptForVars(null)}
      />
    </>
  );
};
