import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, AlertCircle, FolderOpen, Upload, Loader2, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { Category, Model } from '../types';
import { useAuthStore } from '../stores/authStore';
import { openAuthModal } from '../lib/events';
import { extractVariables } from '../lib/format';
import { resolveMediaUrl } from '../lib/media';
import { Avatar } from '../components/common/Avatar';

type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'APP_PREVIEW';

const Section: React.FC<{ title: string; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  description,
  action,
  children,
}) => (
  <section className="py-8 first:pt-0">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {description && <p className="text-[13px] text-fg-muted mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

const RemoveButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button type="button" onClick={onClick} className="btn btn-ghost btn-icon shrink-0 hover:text-danger" aria-label={label} title={label}>
    <X className="w-4 h-4" />
  </button>
);

export const CreatePromptPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullPrompt, setFullPrompt] = useState('');
  const [descriptionMd, setDescriptionMd] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [modelId, setModelId] = useState('');
  const [license, setLicense] = useState('MIT-Prompt');
  const [mediaUrls, setMediaUrls] = useState<{ type: MediaType; url: string; caption?: string }[]>([
    { type: 'IMAGE', url: '', caption: '' },
  ]);
  const [parameters, setParameters] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [tagsInput, setTagsInput] = useState('');
  const [sandboxCode, setSandboxCode] = useState('');
  const [showAdditional, setShowAdditional] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const singleRowFileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeRowIndexForUpload, setActiveRowIndexForUpload] = useState<number | null>(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = (location.state as any) || {};

  // Auto-populate when arriving from Higgsfield Studio
  useEffect(() => {
    if (stateData.fromStudio) {
      if (stateData.title) setTitle(stateData.title);
      if (stateData.shortDescription) setShortDescription(stateData.shortDescription);
      if (stateData.fullPrompt) setFullPrompt(stateData.fullPrompt);
      if (stateData.descriptionMd) setDescriptionMd(stateData.descriptionMd);
      if (stateData.mediaUrl) {
        setMediaUrls([{
          type: stateData.mediaType || 'IMAGE',
          url: stateData.mediaUrl,
          caption: stateData.shortDescription || 'Generated with Higgsfield AI Studio',
        }]);
      }
    }
  }, [location.state]);

  const handleFilesSelected = async (files: FileList | null, targetIndex?: number) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const fileArray = Array.from(files);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        let detectedType: MediaType = 'IMAGE';
        if (file.type.startsWith('video/')) detectedType = 'VIDEO';
        else if (file.type.startsWith('audio/')) detectedType = 'AUDIO';

        const result = await api.uploadFile(file);

        if (targetIndex !== undefined && i === 0) {
          updateMedia(targetIndex, {
            type: detectedType,
            url: result.url,
            caption: mediaUrls[targetIndex]?.caption || '',
          });
        } else {
          setMediaUrls((prev) => {
            if (prev.length === 1 && !prev[0].url) {
              return [{ type: detectedType, url: result.url, caption: '' }];
            }
            return [...prev, { type: detectedType, url: result.url, caption: '' }];
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload local file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (singleRowFileInputRef.current) singleRowFileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    Promise.all([api.getCategories(), api.getModels()])
      .then(([catData, modelData]) => {
        setCategories(catData.categories);
        setModels(modelData.models);

        // If from studio, match category and model
        if (stateData.fromStudio) {
          if (stateData.mediaType === 'VIDEO') {
            const vidCat = catData.categories.find(c => c.slug === 'videos');
            if (vidCat) setCategoryId(vidCat.id);
          } else {
            const imgCat = catData.categories.find(c => c.slug === 'images');
            if (imgCat) setCategoryId(imgCat.id);
          }
          if (stateData.modelSlug) {
            const matchedModel = modelData.models.find(m =>
              m.slug.toLowerCase().includes(stateData.modelSlug.toLowerCase()) ||
              stateData.modelSlug.toLowerCase().includes(m.slug.toLowerCase())
            );
            if (matchedModel) setModelId(matchedModel.id);
            else if (modelData.models[0]) setModelId(modelData.models[0].id);
          }
        } else {
          if (catData.categories[0]) setCategoryId(catData.categories[0].id);
          if (modelData.models[0]) setModelId(modelData.models[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const variables = extractVariables(fullPrompt);

  const updateMedia = (index: number, patch: Partial<(typeof mediaUrls)[number]>) =>
    setMediaUrls((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const updateParam = (index: number, patch: Partial<(typeof parameters)[number]>) =>
    setParameters((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const paramRecord: Record<string, string> = {};
      parameters.forEach((p) => {
        if (p.key.trim()) paramRecord[p.key.trim()] = p.value.trim();
      });

      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const res = await api.createPrompt({
        title,
        shortDescription,
        fullPrompt,
        descriptionMd: descriptionMd || `### Overview\n${shortDescription}`,
        categoryId,
        modelId,
        license,
        parameters: paramRecord,
        tags,
        mediaUrls: mediaUrls.filter((m) => m.url.trim()),
        sandboxCode: sandboxCode.trim() || undefined,
      });

      navigate(`/prompts/${res.prompt.slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to publish prompt');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page py-8">
      <div className="max-w-3xl mx-auto">
        <div className="pb-6 border-b border-line-muted">
          <h1 className="text-2xl font-semibold tracking-tight">Publish a prompt</h1>
          <p className="text-fg-muted mt-1">
            Share a prompt together with the outputs it produced, so others can reproduce it and build on it.
          </p>
        </div>

        {!user && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg border border-attention/40 bg-attention/5 text-[13px]">
            <span>You need to be signed in to publish.</span>
            <button type="button" onClick={() => openAuthModal('login')} className="btn btn-sm btn-default">
              Sign in
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-lg border border-danger/30 bg-danger/10 text-[13px] text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 divide-y divide-line-muted">
          <Section title="Basics">
            <div className="flex items-end gap-2">
              <div className="shrink-0">
                <span className="label">Owner</span>
                <div className="inline-flex items-center gap-2 h-8 px-2.5 rounded-md border border-line bg-subtle text-[13px]">
                  <Avatar src={user?.avatarUrl} name={user?.username || '?'} size={18} />
                  {user?.username ?? 'you'}
                </div>
              </div>
              <span className="pb-1 text-lg text-fg-subtle">/</span>
              <div className="flex-1 min-w-0">
                <label htmlFor="title" className="label">
                  Title <span className="text-danger">*</span>
                </label>
                <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
              </div>
            </div>

            <div>
              <label htmlFor="summary" className="label">
                Summary <span className="text-danger">*</span>
              </label>
              <input
                id="summary"
                type="text"
                required
                maxLength={200}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="input"
              />
              <p className="hint">One sentence shown on cards and in search results.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="label">Category</label>
                <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="model" className="label">Model</label>
                <select id="model" value={modelId} onChange={(e) => setModelId(e.target.value)} className="input">
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="license" className="label">License</label>
                <select id="license" value={license} onChange={(e) => setLicense(e.target.value)} className="input">
                  <option value="MIT-Prompt">MIT-Prompt</option>
                  <option value="CC0">CC0 1.0</option>
                  <option value="CC-BY-4.0">CC BY 4.0</option>
                </select>
              </div>
            </div>
          </Section>

          <Section
            title="Prompt"
            description={
              <>
                Wrap placeholders in curly braces, like <code className="font-mono text-xs px-1 py-0.5 rounded bg-line-muted">{'{subject}'}</code>. Readers
                fill them in before copying.
              </>
            }
          >
            <div>
              <textarea
                required
                rows={8}
                value={fullPrompt}
                onChange={(e) => setFullPrompt(e.target.value)}
                aria-label="Prompt text"
                className="input font-mono text-[13px] leading-6 resize-y"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-fg-muted">
                {variables.length > 0 ? (
                  <>
                    <span>Variables:</span>
                    {variables.map((v) => (
                      <span key={v} className="var-token font-mono">
                        {`{${v}}`}
                      </span>
                    ))}
                  </>
                ) : (
                  <span>No variables detected.</span>
                )}
                <span className="ml-auto tabular-nums">{fullPrompt.length} characters</span>
              </div>
            </div>
          </Section>

          <Section
            title="Outputs"
            description="Add files from local folders (images, video, audio) or paste external URLs."
            action={
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />
                <input
                  ref={singleRowFileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => {
                    if (activeRowIndexForUpload !== null) {
                      handleFilesSelected(e.target.files, activeRowIndexForUpload);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-sm btn-primary flex items-center gap-1.5 shadow-sm"
                  title="Choose files from local folder"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5" />
                  )}
                  <span>Add from Local Folder</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaUrls([...mediaUrls, { type: 'IMAGE', url: '', caption: '' }])}
                  className="btn btn-sm btn-default flex items-center gap-1.5"
                  title="Add empty URL row"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>
            }
          >
            {mediaUrls.length > 0 ? (
              <div className="space-y-2.5">
                {mediaUrls.map((m, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-subtle/30 p-2 sm:p-0 rounded-lg border sm:border-0 border-line">
                    <select
                      value={m.type}
                      onChange={(e) => updateMedia(index, { type: e.target.value as MediaType })}
                      aria-label="Output type"
                      className="input sm:w-28 shrink-0"
                    >
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                      <option value="AUDIO">Audio</option>
                    </select>

                    <div className="relative flex-1 flex items-center">
                      {m.url && m.type === 'IMAGE' && (
                        <div className="absolute left-1.5 z-10 w-7 h-7 rounded overflow-hidden border border-line bg-canvas shrink-0">
                          <img
                            src={resolveMediaUrl(m.url)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="https:// or uploaded file"
                        value={m.url}
                        onChange={(e) => updateMedia(index, { url: e.target.value })}
                        aria-label="Output URL"
                        className={`input w-full ${m.url && m.type === 'IMAGE' ? 'pl-10' : ''} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRowIndexForUpload(index);
                          singleRowFileInputRef.current?.click();
                        }}
                        className="absolute right-2 text-fg-subtle hover:text-fg transition-colors p-1"
                        title="Upload file from local folder into this row"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Caption (optional)"
                        value={m.caption || ''}
                        onChange={(e) => updateMedia(index, { caption: e.target.value })}
                        aria-label="Caption"
                        className="input sm:w-44"
                      />
                      <RemoveButton onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))} label="Remove output" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-line hover:border-accent/50 rounded-lg p-6 text-center cursor-pointer transition-colors bg-subtle/30 hover:bg-subtle/70 group"
              >
                <FolderOpen className="w-8 h-8 text-fg-subtle group-hover:text-accent mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-fg">Click to choose files from local folder</p>
                <p className="text-xs text-fg-muted mt-1">Supports Images (PNG, JPG, WebP), Videos (MP4, WebM), and Audio (MP3, WAV)</p>
              </div>
            )}
          </Section>

          {/* Everything below is optional — collapsed by default to keep the form light. */}
          <section className="py-8">
            <button
              type="button"
              onClick={() => setShowAdditional((v) => !v)}
              aria-expanded={showAdditional}
              className="w-full flex items-center justify-between gap-4 text-left"
            >
              <span>
                <span className="block text-[15px] font-semibold">Additional details</span>
                <span className="block text-[13px] text-fg-muted mt-0.5">
                  Parameters, tags, README and a live preview. All optional.
                </span>
              </span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-fg-muted transition-transform ${showAdditional ? 'rotate-180' : ''}`}
              />
            </button>

            {showAdditional && (
              <div className="mt-2 divide-y divide-line-muted">
                <Section
                  title="Parameters"
                  description="Settings you used to get your outputs, e.g. aspect_ratio, seed or temperature."
                  action={
                    <button type="button" onClick={() => setParameters([...parameters, { key: '', value: '' }])} className="btn btn-sm btn-default">
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  }
                >
                  {parameters.length > 0 ? (
                    <div className="space-y-2">
                      {parameters.map((p, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="aspect_ratio"
                            value={p.key}
                            onChange={(e) => updateParam(index, { key: e.target.value })}
                            aria-label="Parameter name"
                            className="input font-mono"
                          />
                          <input
                            type="text"
                            placeholder="16:9"
                            value={p.value}
                            onChange={(e) => updateParam(index, { value: e.target.value })}
                            aria-label="Parameter value"
                            className="input font-mono"
                          />
                          <RemoveButton onClick={() => setParameters(parameters.filter((_, i) => i !== index))} label="Remove parameter" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-fg-muted">No parameters.</p>
                  )}
                </Section>

                <Section title="Details">
                  <div>
                    <label htmlFor="tags" className="label">Tags</label>
                    <input
                      id="tags"
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="portrait, film, 35mm"
                      className="input"
                    />
                    <p className="hint">Separate tags with commas.</p>
                  </div>
                  <div>
                    <label htmlFor="readme" className="label">README</label>
                    <textarea
                      id="readme"
                      rows={6}
                      value={descriptionMd}
                      onChange={(e) => setDescriptionMd(e.target.value)}
                      placeholder={'### Tips\n- What settings matter most\n- Which models it works best on'}
                      className="input font-mono text-[13px] resize-y"
                    />
                    <p className="hint">Markdown is supported. Leave empty to use the summary.</p>
                  </div>
                </Section>

                <section className="py-8">
                  <details className="group">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                      <span>
                        <span className="block text-[15px] font-semibold">Live preview</span>
                        <span className="block text-[13px] text-fg-muted mt-0.5">
                          For UI and app prompts, paste the generated HTML so readers can try it.
                        </span>
                      </span>
                      <span className="btn btn-sm btn-default">
                        <span className="group-open:hidden">Add</span>
                        <span className="hidden group-open:inline">Hide</span>
                      </span>
                    </summary>
                    <textarea
                      rows={8}
                      value={sandboxCode}
                      onChange={(e) => setSandboxCode(e.target.value)}
                      placeholder="<!doctype html>…"
                      aria-label="Live preview HTML"
                      className="input mt-4 font-mono text-[12.5px] resize-y"
                    />
                  </details>
                </section>
              </div>
            )}
          </section>

          <div className="pt-6 flex items-center justify-end gap-2">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-default">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Publishing…' : 'Publish prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
