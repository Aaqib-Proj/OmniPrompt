import React, { useEffect, useState } from 'react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../stores/authStore';
import { AuthMode } from '../../lib/events';
import { Modal } from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}

// Accounts created by the backend seed script (see README).
const DEMO_ACCOUNTS = ['alexchen', 'sarah_connor', 'elena_v'];

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '31915075359-g89265jmeha5mqsjejkjij9plk797hrv.apps.googleusercontent.com';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', onClose }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleConfigTip, setShowGoogleConfigTip] = useState(false);

  const { login, register, loginWithGoogle } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setShowGoogleConfigTip(false);
    }
  }, [isOpen, initialMode]);

  const isLogin = mode === 'login';

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError('');
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setError('Google credential was not provided. Please try again.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Explicit Google Account Selection Popup: Opens Google's account chooser showing all user IDs
  const triggerGooglePopup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setIsSubmitting(true);
      try {
        await loginWithGoogle({ accessToken: tokenResponse.access_token });
        onClose();
      } catch (err: any) {
        setError(err.message || 'Google authentication failed.');
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: (err) => {
      console.error('Google popup error:', err);
      setError('Google sign-in popup was closed or failed.');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isLogin) await login(username, password);
      else await register(username, email, password, name);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoUsername: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      await login(demoUsername, 'promptit123');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={isLogin ? 'Sign in to OmniPrompt' : 'Create your account'}
      description={isLogin ? 'Welcome back.' : 'Publish prompts, star favorites and suggest edits.'}
    >
      {error && (
        <div className="mb-4 px-3 py-2 rounded-md border border-danger/30 bg-danger/10 text-[13px] text-danger">
          {error}
        </div>
      )}

      {/* Google Authentication */}
      <div className="mb-4 space-y-2.5">
        <div className="w-full space-y-2">
          {/* Primary Action: Direct Google Popup showing all Google accounts */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => triggerGooglePopup()}
            className="btn btn-default w-full h-10 flex items-center justify-center gap-2.5 font-medium text-[13px] border border-line hover:border-fg-subtle/50 transition-colors shadow-sm"
          >
            <GoogleIcon />
            <span>Continue with Google (Choose Account)</span>
          </button>

          {/* Official Google Button */}
          <div className="w-full flex justify-center [&>div]:!w-full [&>div>iframe]:!w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in was unsuccessful. Please try again.')}
              theme="outline"
              size="large"
              shape="rectangular"
              text={isLogin ? 'signin_with' : 'signup_with'}
              width="100%"
            />
          </div>
        </div>

        <div className="relative flex items-center justify-center pt-2">
          <div className="border-t border-line-muted w-full" />
          <span className="bg-canvas px-2 text-[11px] text-fg-subtle uppercase tracking-wider font-mono absolute">
            or continue with credentials
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {!isLogin && (
          <div>
            <label htmlFor="auth-name" className="label">Name</label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="input"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-username" className="label">{isLogin ? 'Username or email' : 'Username'}</label>
          <input
            id="auth-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            className="input"
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="auth-email" className="label">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="input"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-password" className="label">Password</label>
          <input
            id="auth-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            className="input"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full h-9">
          {isSubmitting ? (isLogin ? 'Signing in…' : 'Creating account…') : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-[13px] text-fg-muted">
        {isLogin ? (
          <>
            New to OmniPrompt?{' '}
            <button onClick={() => switchMode('register')} className="link">
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button onClick={() => switchMode('login')} className="link">
              Sign in
            </button>
          </>
        )}
      </p>

      {isLogin && (
        <div className="mt-4 pt-4 border-t border-line-muted">
          <p className="text-xs text-fg-muted mb-2">Or use a demo account from the seed data</p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemoLogin(account)}
                className="btn btn-sm btn-default font-mono"
              >
                {account}
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
