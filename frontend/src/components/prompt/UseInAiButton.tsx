import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Check, ExternalLink, Copy } from 'lucide-react';
import { Prompt } from '../../types';
import { api } from '../../services/api';
import { resolvePromptAiTargets, executeAiLaunch, AiTarget } from '../../lib/aiTargets';

interface UseInAiButtonProps {
  prompt: Prompt;
  promptText?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const UseInAiButton: React.FC<UseInAiButtonProps> = ({
  prompt,
  promptText,
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastCopiedTargetId, setLastCopiedTargetId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const textToUse = promptText ?? prompt.fullPrompt;
  const { targets, isAll } = resolvePromptAiTargets(prompt);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Clear toast after 4s
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
      setLastCopiedTargetId(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleLaunch = async (target: AiTarget) => {
    setLastCopiedTargetId(target.id);
    setIsOpen(false);

    // Track copy in analytics
    if (prompt.id) {
      api.recordCopy(prompt.id).catch(() => {});
    }

    await executeAiLaunch(target, textToUse, (msg) => {
      setToastMessage(msg);
    });
  };

  const btnSizeClass = size === 'sm' ? 'btn-sm text-xs py-1 px-2.5' : 'h-9 px-3.5 text-sm';
  const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  // Toast Notification element
  const toastElement = toastMessage && (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-canvas-overlay border border-line-muted shadow-2xl text-fg text-sm animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md"
    >
      <div className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5" />
      </div>
      <p className="font-medium text-[13px]">{toastMessage}</p>
    </div>
  );

  // RULE:
  // If isAll or targets.length > 3 -> Dropdown
  // Else if targets.length === 1 -> 1 button
  // Else if targets.length === 2 -> 2 buttons
  // Else if targets.length === 3 -> 3 buttons
  const showDropdown = isAll || targets.length > 3;

  if (showDropdown) {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`btn btn-default ${btnSizeClass} flex items-center gap-1.5 font-medium transition-all hover:border-line-emphasis`}
          title="Run this prompt directly with AI models"
          aria-expanded={isOpen}
        >
          <Sparkles className={`${iconSizeClass} text-attention`} />
          <span>Use with AI</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-72 rounded-lg border border-line-muted bg-canvas-overlay p-1.5 shadow-xl z-50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase border-b border-line-muted/60 mb-1 flex items-center justify-between">
              <span>Choose AI Platform</span>
              <span className="text-[10px] lowercase font-normal text-fg-muted">1-click open</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-0.5">
              {targets.map((target) => {
                const Icon = target.icon;
                const wasCopied = lastCopiedTargetId === target.id;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => handleLaunch(target)}
                    className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-md text-left text-sm hover:bg-canvas-subtle transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${target.badgeColor}1a`,
                          color: target.badgeColor,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-fg text-[13px] truncate group-hover:text-link">
                          {target.name}
                        </div>
                        <div className="text-[11px] text-fg-muted truncate">{target.hint}</div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {target.isPrefill ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-success/15 text-success">
                          Prefill
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-canvas-subtle text-fg-subtle border border-line-muted">
                          Copy & Paste
                        </span>
                      )}
                      {wasCopied ? (
                        <Check className="w-3.5 h-3.5 text-success ml-1" />
                      ) : (
                        <ExternalLink className="w-3 h-3 text-fg-subtle opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {toastElement}
      </div>
    );
  }

  // 1, 2, or 3 distinct buttons
  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {targets.map((target) => {
        const Icon = target.icon;
        const wasCopied = lastCopiedTargetId === target.id;
        return (
          <button
            key={target.id}
            type="button"
            onClick={() => handleLaunch(target)}
            className={`btn btn-default ${btnSizeClass} flex items-center gap-2 transition-all hover:border-line-emphasis group`}
            title={target.isPrefill ? `${target.name} (Directly prefilled)` : `${target.name} (Auto-copies & launches)`}
          >
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={{ color: target.badgeColor }}
            >
              <Icon className={iconSizeClass} />
            </span>
            <span className="font-medium">
              Use in {target.shortName}
            </span>
            {wasCopied ? (
              <Check className="w-3.5 h-3.5 text-success ml-0.5" />
            ) : (
              <ExternalLink className="w-3 h-3 text-fg-subtle opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
            )}
          </button>
        );
      })}

      {toastElement}
    </div>
  );
};
