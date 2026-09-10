import React, { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { relayApi } from '../services/api';
import { AuthUser } from '../types';

interface AuthPageProps {
  mode: 'login' | 'register';
  onAuthenticated: (user: AuthUser) => void;
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onAuthenticated, onNavigate }) => {
  const isLogin = mode === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const user = isLogin
        ? await relayApi.login(email, password)
        : await relayApi.register(email, password, confirmPassword);
      onAuthenticated(user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'RELAY could not complete authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-primary">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <span className="text-2xl font-bold tracking-tight">RELAY</span>
          </div>
          <p className="text-sm text-secondary">Autonomous life administration, under your control.</p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <LockKeyhole className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Private operations console</span>
            </div>
            <h1 className="text-2xl font-extrabold text-on-surface">{isLogin ? 'Sign in to RELAY' : 'Create your account'}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-on-surface">Email</span>
              <input value={email} onChange={event => setEmail(event.target.value)} type="text" autoComplete="email" required className="w-full px-3 py-2.5 rounded-xl border border-surface-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:border-primary" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-on-surface">Password</span>
              <input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required className="w-full px-3 py-2.5 rounded-xl border border-surface-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:border-primary" />
            </label>
            {!isLogin && (
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-on-surface">Confirm password</span>
                <input value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" required className="w-full px-3 py-2.5 rounded-xl border border-surface-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:border-primary" />
              </label>
            )}

            {error && <div className="rounded-xl border border-error/30 bg-error-container/40 px-3 py-2.5 text-xs text-on-error-container">{error}</div>}

            <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary-container disabled:opacity-60 disabled:cursor-wait">
              <span>{isSubmitting ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-secondary">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => onNavigate(isLogin ? '/register' : '/login')} className="font-bold text-primary hover:underline">
            {isLogin ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  );
};