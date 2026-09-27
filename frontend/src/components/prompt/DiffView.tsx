import React from 'react';
import { diffWords } from '../../lib/diff';

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

export const DiffView: React.FC<{ before: string; after: string }> = ({ before, after }) => {
  const parts = diffWords(before, after);
  const added = parts.filter((p) => p.type === 'add').reduce((n, p) => n + countWords(p.text), 0);
  const removed = parts.filter((p) => p.type === 'del').reduce((n, p) => n + countWords(p.text), 0);

  return (
    <div className="rounded-md border border-line-muted overflow-hidden">
      <div className="flex items-center gap-3 px-3 h-8 bg-subtle border-b border-line-muted text-xs text-fg-muted">
        <span className="text-success font-medium tabular-nums">+{added}</span>
        <span className="text-danger font-medium tabular-nums">−{removed}</span>
        <span>words changed</span>
      </div>
      <div className="p-3 bg-inset font-mono text-[12.5px] leading-6 whitespace-pre-wrap break-words">
        {parts.map((part, i) =>
          part.type === 'same' ? (
            <span key={i}>{part.text}</span>
          ) : part.type === 'add' ? (
            <ins key={i} className="no-underline rounded-sm bg-success/15 text-success">
              {part.text}
            </ins>
          ) : (
            <del key={i} className="rounded-sm bg-danger/15 text-danger decoration-danger/60">
              {part.text}
            </del>
          )
        )}
      </div>
    </div>
  );
};
