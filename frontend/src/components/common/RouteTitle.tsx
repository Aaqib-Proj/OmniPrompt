import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BRAND = 'OmniPrompt';
const DEFAULT_TITLE = `${BRAND} · Open prompts for every model`;

const TITLES: Record<string, string> = {
  '/': DEFAULT_TITLE,
  '/explore': `Explore · ${BRAND}`,
  '/models': `Models · ${BRAND}`,
  '/packs': `Packs · ${BRAND}`,
  '/challenges': `Challenges · ${BRAND}`,
  '/api-keys': `Developer API · ${BRAND}`,
  '/create': `Publish a prompt · ${BRAND}`,
};

// Routes that name themselves once their data loads (a prompt title, a username).
const SELF_TITLING = /^\/(prompts|users|models)\/.+/;

/**
 * Gives every page an honest tab title, so bookmarks and a crowded tab bar still
 * say what they are instead of all reading the same thing.
 */
export const RouteTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (SELF_TITLING.test(pathname)) return;
    document.title = TITLES[pathname] ?? DEFAULT_TITLE;
  }, [pathname]);

  return null;
};
