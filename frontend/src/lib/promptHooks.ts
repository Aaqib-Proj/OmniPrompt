import { useEffect, useState } from 'react';
import { Prompt } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { openAuthModal } from './events';

// Star ("Save") state for a prompt. Resyncs when the parent passes an updated prompt.
export const useStar = (prompt: Prompt, onChange?: (id: string, starred: boolean) => void) => {
  const { user } = useAuthStore();
  const [starred, setStarred] = useState(!!prompt.isStarred);
  const [count, setCount] = useState(prompt.starsCount || 0);

  useEffect(() => {
    setStarred(!!prompt.isStarred);
    setCount(prompt.starsCount || 0);
  }, [prompt.id, prompt.isStarred, prompt.starsCount]);

  const toggle = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleStar(prompt.id);
      setStarred(res.starred);
      setCount((n) => (res.starred ? n + 1 : Math.max(0, n - 1)));
      onChange?.(prompt.id, res.starred);
    } catch (err) {
      console.error(err);
    }
  };

  return { starred, count, toggle };
};

export const useClipboard = (resetMs = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
      return true;
    } catch {
      return false;
    }
  };

  return { copied, copy };
};
