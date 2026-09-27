import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  X,
  Plus,
  FolderOpen,
  Upload,
  Loader2,
  AlertCircle,
  FileText,
  Sliders,
  Image as ImageIcon,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Prompt, Category, Model } from '../../types';
import { api } from '../../services/api';
import { extractVariables } from '../../lib/format';
import { resolveMediaUrl } from '../../lib/media';
import { Modal } from '../common/Modal';

type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'APP_PREVIEW';

interface EditPromptModalProps {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPrompt?: Prompt) => void;
}

export const EditPromptModal: React.FC<EditPromptModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(prompt.title);
  const [shortDescription, setShortDescription] = useState(prompt.shortDescription);
  const [fullPrompt, setFullPrompt] = useState(prompt.fullPrompt);
  const [categoryId, setCategoryId] = useState(prompt.categoryId);
  const [modelId, setModelId] = useState(prompt.modelId);
  const [license, setLicense] = useState(prompt.license || 'MIT-Prompt');
  const [changelog, setChangelog] = useState('');
  const [tagsInput, setTagsInput] = useState(prompt.tags ? prompt.tags.join(', ') : '');

  // Media
  const [mediaUrls, setMediaUrls] = useState<{ type: MediaType; url: string; caption?: string }[]>([]);

  // Parameters
  const [parameters, setParameters] = useState<{ key: string; value: string }[]>([]);

  // Categories & Models
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const singleRowFileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeRowIndexForUpload, setActiveRowIndexForUpload] = useState<number | null>(null);

  // Initialize state on open
  useEffect(() => {
    if (!isOpen) return;

    setTitle(prompt.title);
    setShortDescription(prompt.shortDescription);
    setFullPrompt(prompt.fullPrompt);
    setCategoryId(prompt.categoryId);
    setModelId(prompt.modelId);
    setLicense(prompt.license || 'MIT-Prompt');
    setChangelog('');
    setTagsInput(prompt.tags ? prompt.tags.join(', ') : '');
    setError('');

    // Pre-fill media
    if (prompt.media && prompt.media.length > 0) {
      setMediaUrls(
        prompt.media.map((m) => ({
          type: (m.mediaType as MediaType) || 'IMAGE',
          url: m.url,
          caption: m.caption || '',
        }))
      );
    } else {
      setMediaUrls([{ type: 'IMAGE', url: '', caption: '' }]);
    }

    // Pre-fill parameters
    let paramsArr: { key: string; value: string }[] = [];
    try {
      const latestVer = prompt.versions?.[0];
      if (latestVer?.parametersJson) {
        const parsed = JSON.parse(latestVer.parametersJson);
        paramsArr = Object.entries(parsed).map(([key, val]) => ({
          key,
          value: String(val),
        }));
      }
    } catch {
      // Ignored
    }
    setParameters(paramsArr.length > 0 ? paramsArr : [{ key: '', value: '' }]);

    // Load categories & models if empty
    Promise.all([api.getCategories(), api.getModels()])
      .then(([catData, modelData]) => {
        setCategories(catData.categories);
        setModels(modelData.models);
      })
      .catch(console.error);
  }, [isOpen, prompt]);

  const updateMedia = (index: number, patch: Partial<(typeof mediaUrls)[number]>) => {
    setMediaUrls((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const updateParam = (index: number, patch: Partial<(typeof parameters)[number]>) => {
    setParameters((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const handleFilesSelected = async (files: FileList | null, targetIndex?: number) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError('');

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
            // Keep caption empty by default to prevent displaying uploaded filename
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const paramRecord: Record<string, string> = {};
      parameters.forEach((p) => {
        if (p.key.trim()) paramRecord[p.key.trim()] = p.value.trim();
      });

      const validMedia = mediaUrls
        .filter((m) => m.url.trim().length > 0)
        .map((m) => ({
          type: m.type,
          url: m.url.trim(),
          caption: m.caption?.trim() || undefined,
        }));

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api.updatePrompt(prompt.id, {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        fullPrompt: fullPrompt.trim(),
        categoryId,
        modelId,
        license,
        parameters: paramRecord,
        mediaUrls: validMedia,
        tags,
        changelog: changelog.trim() || undefined,
      });

      onSuccess(res.prompt);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const variables = extractVariables(fullPrompt);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Edit Prompt</span>
        </div>
      }
      description="Update your prompt details, output media, model configuration, and variables."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-default" disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="edit-prompt-form"
            disabled={isSubmitting || isUploading || !title.trim() || !fullPrompt.trim()}
            className="btn btn-primary flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Saving changes…' : 'Save changes'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-danger/30 bg-danger/10 text-[13px] text-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form id="edit-prompt-form" onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g. Highly Detailed Cinematic Studio Portrait"
            />
          </div>

          <div>
            <label htmlFor="edit-summary" className="label">
              Summary <span className="text-danger">*</span>
            </label>
            <input
              id="edit-summary"
              type="text"
              required
              maxLength={300}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="input"
              placeholder="One concise sentence explaining what this prompt accomplishes"
            />
            <p className="hint">Shown on explore cards and in search results.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="edit-category" className="label">
                Category
              </label>
              <select
                id="edit-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-model" className="label">
                Model
              </label>
              <select
                id="edit-model"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="input"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-license" className="label">
                License
              </label>
              <select
                id="edit-license"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="input"
              >
                <option value="MIT-Prompt">MIT-Prompt</option>
                <option value="CC0">CC0 1.0</option>
                <option value="CC-BY-4.0">CC BY 4.0</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prompt Body */}
        <div className="pt-4 border-t border-line space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="edit-prompt" className="label mb-0">
              Prompt Text <span className="text-danger">*</span>
            </label>
            <span className="text-xs text-fg-muted font-mono">{fullPrompt.length} chars</span>
          </div>
          <textarea
            id="edit-prompt"
            required
            rows={7}
            value={fullPrompt}
            onChange={(e) => setFullPrompt(e.target.value)}
            className="input font-mono text-[13px] leading-relaxed resize-y"
            placeholder="Type your prompt here... Use {variable} for dynamic placeholders."
          />
          {variables.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-fg-muted">
              <span>Variables detected:</span>
              {variables.map((v) => (
                <span key={v} className="var-token font-mono">
                  {`{${v}}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Output Media Section */}
        <div className="pt-4 border-t border-line space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-fg">Outputs (Images, Video, Audio)</h3>
              <p className="text-xs text-fg-muted">Upload local files or provide image URLs.</p>
            </div>
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
                className="btn btn-sm btn-primary flex items-center gap-1.5"
                title="Choose files from local device"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderOpen className="w-3.5 h-3.5" />}
                <span>Add from Local Folder</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaUrls([...mediaUrls, { type: 'IMAGE', url: '', caption: '' }])}
                className="btn btn-sm btn-default flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {mediaUrls.map((m, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 sm:items-center bg-subtle/40 p-2.5 rounded-lg border border-line"
              >
                <select
                  value={m.type}
                  onChange={(e) => updateMedia(index, { type: e.target.value as MediaType })}
                  className="input sm:w-28 shrink-0 text-xs"
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
                    className={`input text-xs w-full ${m.url && m.type === 'IMAGE' ? 'pl-10' : ''} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRowIndexForUpload(index);
                      singleRowFileInputRef.current?.click();
                    }}
                    className="absolute right-2 text-fg-subtle hover:text-fg transition-colors p-1"
                    title="Upload file into this row"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Optional description"
                    value={m.caption || ''}
                    onChange={(e) => updateMedia(index, { caption: e.target.value })}
                    className="input text-xs sm:w-44"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                    className="btn btn-ghost btn-icon shrink-0 hover:text-danger"
                    aria-label="Remove output"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parameters Section */}
        <div className="pt-4 border-t border-line space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-fg">Model Parameters</h3>
              <p className="text-xs text-fg-muted">Key-value settings like aspect_ratio, seed, temperature.</p>
            </div>
            <button
              type="button"
              onClick={() => setParameters([...parameters, { key: '', value: '' }])}
              className="btn btn-sm btn-default flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add parameter</span>
            </button>
          </div>

          <div className="space-y-2">
            {parameters.map((p, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Key (e.g. aspect_ratio)"
                  value={p.key}
                  onChange={(e) => updateParam(index, { key: e.target.value })}
                  className="input font-mono text-xs"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 16:9)"
                  value={p.value}
                  onChange={(e) => updateParam(index, { value: e.target.value })}
                  className="input font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setParameters(parameters.filter((_, i) => i !== index))}
                  className="btn btn-ghost btn-icon shrink-0 hover:text-danger"
                  aria-label="Remove parameter"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags & Changelog */}
        <div className="pt-4 border-t border-line space-y-3">
          <div>
            <label htmlFor="edit-tags" className="label">
              Tags
            </label>
            <input
              id="edit-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="input text-xs"
              placeholder="portrait, cinematic, lighting, photorealistic (comma separated)"
            />
          </div>

          <div>
            <label htmlFor="edit-changelog" className="label">
              Version Changelog Note (optional)
            </label>
            <input
              id="edit-changelog"
              type="text"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="input text-xs"
              placeholder="e.g. Resized output image and refined studio lighting details"
            />
            <p className="hint">This note will appear in the version history.</p>
          </div>
        </div>
      </form>
    </Modal>
  );
};
