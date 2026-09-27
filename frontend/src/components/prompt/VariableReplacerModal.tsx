import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prompt } from '../../types';
import { api } from '../../services/api';
import { extractVariables } from '../../lib/format';
import { Modal } from '../common/Modal';
import { ModelBadge } from '../common/ui';
import { UseInAiButton } from './UseInAiButton';

interface VariableReplacerModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VariableReplacerModal: React.FC<VariableReplacerModalProps> = ({ prompt, isOpen, onClose }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prompt) {
      setValues(Object.fromEntries(extractVariables(prompt.fullPrompt).map((v) => [v, ''])));
      setCopied(false);
    }
  }, [prompt]);

  if (!prompt) return null;

  const keys = Object.keys(values);
  const filledCount = keys.filter((k) => values[k].trim()).length;

  const filledText = prompt.fullPrompt.replace(/\{([^}]+)\}/g, (match, key) => values[key]?.trim() || match);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(filledText);
      setCopied(true);
      api.recordCopy(prompt.id);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1200);
    } catch {
      // Clipboard access can be denied; the preview text remains selectable.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Fill in variables"
      description={prompt.title}
      footer={
        <>
          <span className="mr-auto flex items-center gap-2 text-xs text-fg-muted min-w-0">
            For <ModelBadge model={prompt.model} className="text-fg" />
          </span>
          <button onClick={onClose} className="btn btn-default">
            Cancel
          </button>
          <button onClick={handleCopy} className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
          <UseInAiButton prompt={prompt} promptText={filledText} size="md" />
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-fg-muted">
            <span>Variables</span>
            <span className="tabular-nums">
              {filledCount} of {keys.length} filled
            </span>
          </div>
          {keys.map((key, i) => (
            <div key={key}>
              <label htmlFor={`var-${key}`} className="label font-mono text-xs">
                {key}
              </label>
              <input
                id={`var-${key}`}
                type="text"
                value={values[key]}
                autoFocus={i === 0}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                className="input"
              />
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <div className="text-xs text-fg-muted mb-3">Preview</div>
          <div className="p-3 rounded-md border border-line-muted bg-inset font-mono text-[12.5px] leading-6 whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
            {prompt.fullPrompt.split(/(\{[^}]+\})/g).map((part, i) => {
              const match = part.match(/^\{([^}]+)\}$/);
              if (!match) return part;
              const value = values[match[1]]?.trim();
              return value ? (
                <mark key={i} className="rounded-[3px] px-0.5 bg-success/15 text-fg">
                  {value}
                </mark>
              ) : (
                <span key={i} className="var-token">
                  {part}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
