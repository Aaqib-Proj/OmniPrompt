import { RefObject, useEffect } from 'react';

// Calls onDismiss when the user clicks outside `ref` or presses Escape.
export const useDismiss = (ref: RefObject<HTMLElement>, onDismiss: () => void, active = true) => {
  useEffect(() => {
    if (!active) return;

    const handlePointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onDismiss, active]);
};
