import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Folder, Cpu, CornerDownLeft } from 'lucide-react';
import { Prompt, Model, Category } from '../../types';
import { api } from '../../services/api';
import { ModelBadge } from './ui';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Item {
  id: string;
  section: string;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  icon: React.ElementType;
  path: string;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else document.dispatchEvent(new CustomEvent('open-command-menu'));
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 20);
    if (models.length === 0) api.getModels().then((d) => setModels(d.models)).catch(() => {});
    if (categories.length === 0) api.getCategories().then((d) => setCategories(d.categories)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
    if (!query.trim()) {
      setPrompts([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      api.getPrompts({ search: query.trim(), limit: 6 })
        .then((d) => setPrompts(d.prompts))
        .catch(() => setPrompts([]))
        .finally(() => setSearching(false));
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  const trimmed = query.trim();
  const items: Item[] = trimmed
    ? [
        ...prompts.map((p) => ({
          id: p.id,
          section: 'Prompts',
          title: p.title,
          subtitle: `${p.author.username} · ${p.category.name}`,
          meta: <ModelBadge model={p.model} className="text-xs text-fg-muted max-w-[10rem]" />,
          icon: FileText,
          path: `/prompts/${p.slug}`,
        })),
        {
          id: 'search-all',
          section: 'Search',
          title: `Search all prompts for “${trimmed}”`,
          icon: Search,
          path: `/explore?search=${encodeURIComponent(trimmed)}`,
        },
      ]
    : [
        ...categories.map((c) => ({
          id: c.id,
          section: 'Categories',
          title: c.name,
          meta: <span className="text-xs text-fg-subtle tabular-nums">{c.promptsCount ?? 0}</span>,
          icon: Folder,
          path: `/explore?category=${c.slug}`,
        })),
        ...models.slice(0, 6).map((m) => ({
          id: m.id,
          section: 'Models',
          title: m.name,
          subtitle: `${m.provider} · ${m.modality}`,
          icon: Cpu,
          path: `/models/${m.slug}`,
        })),
      ];

  useEffect(() => {
    document.getElementById(`cmd-item-${selectedIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const select = (item: Item | undefined) => {
    if (!item) return;
    navigate(item.path);
    onClose();
  };

  const handleInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(items[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search" className="relative w-full max-w-xl box shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-12 border-b border-line">
          <Search className="w-4 h-4 text-fg-subtle shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKey}
            placeholder="Search prompts, or jump to a category or model"
            className="flex-1 min-w-0 bg-transparent text-[14px] placeholder:text-fg-subtle focus:outline-none"
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-1.5">
          {items.map((item, index) => {
            const Icon = item.icon;
            const showSection = index === 0 || items[index - 1].section !== item.section;
            const active = index === selectedIndex;
            return (
              <React.Fragment key={`${item.section}-${item.id}`}>
                {showSection && (
                  <div className="px-4 pt-2.5 pb-1 text-xs font-medium text-fg-muted">{item.section}</div>
                )}
                <button
                  id={`cmd-item-${index}`}
                  onClick={() => select(item)}
                  onMouseMove={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left ${active ? 'bg-subtle' : ''}`}
                >
                  <Icon className="w-4 h-4 text-fg-subtle shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] truncate">{item.title}</span>
                    {item.subtitle && <span className="block text-xs text-fg-muted truncate">{item.subtitle}</span>}
                  </span>
                  {item.meta}
                  {active && <CornerDownLeft className="w-3.5 h-3.5 text-fg-subtle shrink-0" />}
                </button>
              </React.Fragment>
            );
          })}

          {trimmed && !searching && prompts.length === 0 && (
            <p className="px-4 pt-1 pb-3 text-[13px] text-fg-muted">No prompt titles match “{trimmed}”.</p>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 h-9 border-t border-line-muted bg-subtle text-[11px] text-fg-muted">
          <span className="flex items-center gap-1">
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="kbd">↵</kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  );
};
