import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2, Copy, Check, RotateCw } from 'lucide-react';

interface LiveAppSandboxProps {
  code: string;
  title: string;
}

export const LiveAppSandbox: React.FC<LiveAppSandboxProps> = ({ code, title }) => {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the code view is still selectable.
    }
  };

  return (
    <>
      {isFullscreen && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsFullscreen(false)} />}
      <div className={`box overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[560px]'}`}>
        <div className="box-header py-2">
          <div className="segmented" role="group" aria-label="Sandbox view">
            <button onClick={() => setView('preview')} aria-pressed={view === 'preview'}>
              Preview
            </button>
            <button onClick={() => setView('code')} aria-pressed={view === 'code'}>
              Code
            </button>
          </div>
          <span className="hidden sm:block flex-1 min-w-0 truncate text-center text-xs text-fg-muted">{title}</span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setIframeKey((k) => k + 1)} className="btn btn-sm btn-ghost btn-icon w-7" title="Reload preview" aria-label="Reload preview">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleCopy} className="btn btn-sm btn-ghost btn-icon w-7" title="Copy code" aria-label="Copy code">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn btn-sm btn-ghost btn-icon w-7"
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="relative flex-1 min-h-0 bg-white">
          {view === 'preview' ? (
            // No allow-same-origin: user-published HTML must not reach this app's storage or cookies.
            <iframe
              key={iframeKey}
              srcDoc={code}
              title={title}
              sandbox="allow-scripts allow-forms allow-modals"
              className="w-full h-full border-0"
            />
          ) : (
            <pre className="absolute inset-0 p-4 overflow-auto bg-inset font-mono text-[12.5px] leading-relaxed text-fg whitespace-pre-wrap break-words">
              {code}
            </pre>
          )}
        </div>
      </div>
    </>
  );
};
