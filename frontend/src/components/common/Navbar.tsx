import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, Plus, Moon, Sun, Menu, X, User as UserIcon, KeyRound, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../lib/theme';
import { useDismiss } from '../../lib/hooks';
import { AuthMode } from '../../lib/events';
import { Logo } from './Logo';
import { Avatar } from './Avatar';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAuth: (mode: AuthMode) => void;
}

const NAV_LINKS = [
  { label: 'Explore', path: '/explore' },
  { label: 'Studio', path: '/studio', isSpecial: true },
  { label: 'Models', path: '/models' },
  { label: 'Packs', path: '/packs' },
  { label: 'Challenges', path: '/challenges' },
];

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const menuItem = 'flex w-full items-center gap-2.5 px-3 h-8 text-[13px] text-fg hover:bg-subtle transition-colors';

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenAuth }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<'user' | 'mobile' | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpenMenu(null), []);
  useDismiss(userMenuRef, closeMenu, openMenu === 'user');

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-canvas border-b border-line">
      <div className="page h-14 flex items-center gap-3">
        <button
          onClick={() => setOpenMenu(openMenu === 'mobile' ? null : 'mobile')}
          className="btn btn-ghost btn-icon -ml-2 lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={openMenu === 'mobile'}
        >
          {openMenu === 'mobile' ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <Link to="/" aria-label="OmniPrompt home" className="shrink-0 rounded-md">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 ml-3">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                link.isSpecial
                  ? `inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[13px] font-semibold transition-all ${
                      isActive
                        ? 'bg-accent/15 text-accent-emphasis border border-accent/30 shadow-sm'
                        : 'text-fg-muted hover:text-fg hover:bg-subtle'
                    }`
                  : `inline-flex items-center h-8 px-2.5 rounded-md text-[13px] font-medium transition-colors ${
                      isActive ? 'bg-subtle text-fg' : 'text-fg-muted hover:text-fg'
                    }`
              }
            >
              {link.isSpecial && <Sparkles className="w-3.5 h-3.5 text-attention" />}
              {link.label}
              {link.isSpecial && (
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-attention/15 text-attention ml-0.5 leading-none font-bold uppercase tracking-wider">
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 w-60 lg:w-72 h-8 px-2.5 rounded-md border border-line bg-subtle text-[13px] text-fg-subtle hover:border-fg-subtle/50 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search prompts…</span>
          <kbd className="kbd">{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>

        <button onClick={onOpenSearch} className="btn btn-ghost btn-icon md:hidden" aria-label="Search">
          <Search className="w-4 h-4" />
        </button>


        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {user ? (
          <>
            <Link to="/create" className="btn btn-default hidden sm:inline-flex">
              <Plus className="w-4 h-4" />
              New prompt
            </Link>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
                className="flex items-center gap-1 h-8 pl-0.5 pr-1 rounded-full hover:bg-subtle transition-colors"
                aria-label="Account menu"
                aria-expanded={openMenu === 'user'}
              >
                <Avatar src={user.avatarUrl} name={user.username} size={26} />
                <ChevronDown className="w-3.5 h-3.5 text-fg-muted" />
              </button>

              {openMenu === 'user' && (
                <div className="absolute right-0 mt-2 w-56 box shadow-lg py-1.5 z-50">
                  <div className="px-3 pt-1 pb-2.5 mb-1 border-b border-line-muted">
                    <div className="text-[13px] font-semibold truncate">{user.name || user.username}</div>
                    <div className="text-xs text-fg-muted truncate">@{user.username}</div>
                  </div>
                  <Link to={`/users/${user.username}`} className={menuItem}>
                    <UserIcon className="w-4 h-4 text-fg-muted" />
                    Your profile
                  </Link>
                  <Link to="/create" className={menuItem}>
                    <Plus className="w-4 h-4 text-fg-muted" />
                    New prompt
                  </Link>
                  <Link to="/api-keys" className={menuItem}>
                    <KeyRound className="w-4 h-4 text-fg-muted" />
                    API keys
                  </Link>
                  <div className="my-1 border-t border-line-muted" />
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className={menuItem}
                  >
                    <LogOut className="w-4 h-4 text-fg-muted" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => onOpenAuth('login')} className="btn btn-ghost">
              Sign in
            </button>
            <button onClick={() => onOpenAuth('register')} className="btn btn-primary hidden sm:inline-flex">
              Sign up
            </button>
          </>
        )}
      </div>

      {openMenu === 'mobile' && (
        <nav className="lg:hidden border-t border-line bg-canvas">
          <div className="page py-2 flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className="nav-item h-10 flex items-center justify-between"
                aria-current={location.pathname === link.path ? 'true' : undefined}
              >
                <span className="flex items-center gap-2">
                  {link.isSpecial && <Sparkles className="w-4 h-4 text-attention" />}
                  {link.label}
                </span>
                {link.isSpecial && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-attention/15 text-attention font-bold uppercase">
                    AI Studio
                  </span>
                )}
              </NavLink>
            ))}
            {user && (
              <Link to="/create" className="nav-item h-10">
                New prompt
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
