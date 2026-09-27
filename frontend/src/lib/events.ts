// App-level UI events, so deeply nested components can open global overlays
// without prop drilling. App.tsx listens for these.
export type AuthMode = 'login' | 'register';

export const openAuthModal = (mode: AuthMode = 'login') =>
  document.dispatchEvent(new CustomEvent<AuthMode>('open-auth-modal', { detail: mode }));

export const openCommandMenu = () =>
  document.dispatchEvent(new CustomEvent('open-command-menu'));
