import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Instagram } from 'lucide-react';
import { LogoMark } from './Logo';

const LINKS = [
  { label: 'Explore', path: '/explore' },
  { label: 'Models', path: '/models' },
  { label: 'Packs', path: '/packs' },
  { label: 'Challenges', path: '/challenges' },
  { label: 'API', path: '/api-keys' },
];

// lucide still ships the old bird; this is the current X glyph.
const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.9 2H22l-7.2 8.3L23.3 22h-6.6l-5.2-6.8L5.6 22H2.4l7.7-8.8L1 2h6.8l4.7 6.2L18.9 2Zm-1.1 18h1.8L7.3 3.8H5.4L17.8 20Z" />
  </svg>
);

const SOCIALS = [
  { label: 'Email OmniPrompt', href: 'mailto:omniprompt.business@gmail.com', Icon: Mail },
  { label: 'OmniPrompt on X', href: 'https://x.com/useomniprompt', Icon: XIcon },
  { label: 'OmniPrompt on Instagram', href: 'https://www.instagram.com/useomniprompt', Icon: Instagram },
];

export const Footer: React.FC = () => (
  <footer className="mt-20 border-t border-line">
    <div className="page py-8 flex flex-col md:flex-row md:items-center justify-between gap-5 text-[13px] text-fg-muted">
      <div className="flex items-center gap-3">
        <LogoMark className="w-5 h-5" />
        <span>© {new Date().getFullYear()} OmniPrompt</span>
        <span className="text-fg-subtle">·</span>
        <span>Open source, MIT licensed</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <Link key={link.path} to={link.path} className="hover:text-link transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <span className="hidden md:inline text-fg-subtle">·</span>

        <div className="flex items-center gap-1">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-subtle hover:text-fg"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
