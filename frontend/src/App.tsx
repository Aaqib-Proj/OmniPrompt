import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CommandMenu } from './components/common/CommandMenu';
import { AuthModal } from './components/common/AuthModal';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PromptDetailPage } from './pages/PromptDetailPage';
import { CreatePromptPage } from './pages/CreatePromptPage';
import { ModelsPage } from './pages/ModelsPage';
import { ModelDetailPage } from './pages/ModelDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { PacksPage } from './pages/PacksPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { StudioPage } from './pages/StudioPage';
import { useAuthStore } from './stores/authStore';
import { AuthMode } from './lib/events';
import { initGlobalClickSound } from './lib/sound';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NotFoundPage: React.FC = () => (
  <div className="page py-24 text-center">
    <p className="font-mono text-sm text-fg-subtle">404</p>
    <h1 className="text-2xl font-semibold mt-2">This page doesn’t exist</h1>
    <p className="text-fg-muted mt-2">The link may be broken, or the page may have been moved.</p>
    <Link to="/" className="btn btn-default mt-6">Go home</Link>
  </div>
);

export const App: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    const cleanupSound = initGlobalClickSound();

    const handleOpenSearch = () => setIsSearchOpen(true);
    const handleOpenAuth = (e: Event) => setAuthMode((e as CustomEvent<AuthMode>).detail || 'login');
    document.addEventListener('open-command-menu', handleOpenSearch);
    document.addEventListener('open-auth-modal', handleOpenAuth);
    return () => {
      cleanupSound();
      document.removeEventListener('open-command-menu', handleOpenSearch);
      document.removeEventListener('open-auth-modal', handleOpenAuth);
    };
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAuth={(mode) => setAuthMode(mode)}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/prompts/:idOrSlug" element={<PromptDetailPage />} />
            <Route path="/create" element={<CreatePromptPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/models/:slug" element={<ModelDetailPage />} />
            <Route path="/users/:username" element={<ProfilePage />} />
            <Route path="/packs" element={<PacksPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/api-keys" element={<ApiDocsPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/generate" element={<StudioPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />

        <CommandMenu
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <AuthModal
          isOpen={authMode !== null}
          initialMode={authMode ?? 'login'}
          onClose={() => setAuthMode(null)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
