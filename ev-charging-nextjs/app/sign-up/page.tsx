'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  async function handleOAuthSignUp(provider: 'google' | 'github') {
    setError('');
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/driver' });
    } catch {
      setError(`Failed to sign up with ${provider === 'google' ? 'Google' : 'GitHub'}.`);
      setOauthLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/driver',
      });

      if (!signInResult || signInResult.error) {
        // Account created but sign-in failed — redirect to sign-in
        router.push('/sign-in');
      } else {
        router.replace('/driver');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-20 px-6 py-16">
      <div className="grid flex-1 gap-16 lg:grid-cols-2 lg:items-center">
        {/* ── Left: Welcome copy ── */}
        <div className="flex flex-col gap-5">
          <span className="gp-eyebrow">
            <span className="gp-eyebrow-dot" />
            Create account
          </span>
          <h1 className="text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
            Join the GridPulse network.
          </h1>
          <p className="max-w-xl text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
            Create a driver account to browse stations and book charging slots. Operator accounts are
            provisioned separately and are not available through public sign-up.
          </p>
          <ul className="mt-2 flex flex-col gap-3">
            {[
              'Instant access after registration',
              'Real-time station availability',
              'Capacity-protected booking from day one',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-[16px] tracking-[-0.16px] text-true-black">
                <span className="gp-eyebrow-dot" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: Sign-up card ── */}
        <div className="gp-panel p-8">
          <h2 className="text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">Sign up</h2>
          <p className="mt-1 text-[14px] text-muted-gray">Create your GridPulse driver account.</p>

          <div className="gp-notice mt-6">
            Looking for operator access? Operator accounts require admin provisioning and cannot be created here.
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="block">
              <span className="gp-label">Full name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="gp-input"
              />
            </label>

            <label className="block">
              <span className="gp-label">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@grid.co"
                className="gp-input"
              />
            </label>

            <label className="block">
              <span className="gp-label">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="gp-input"
              />
            </label>

            <label className="block">
              <span className="gp-label">Confirm password</span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="gp-input"
              />
            </label>

            {error && <div className="gp-notice gp-notice-error">{error}</div>}

            <button type="submit" disabled={loading || oauthLoading !== null} className="gp-btn-primary w-full">
              {loading ? 'Creating account…' : 'Create driver account'}
              {!loading && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-mist-gray" />
            <span className="absolute bg-paper-white px-3 text-[13px] text-muted-gray">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignUp('google')}
              disabled={loading || oauthLoading !== null}
              className="gp-btn-secondary w-full gap-2 text-[14px] font-medium"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {oauthLoading === 'google' ? 'Redirecting…' : 'Google'}
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignUp('github')}
              disabled={loading || oauthLoading !== null}
              className="gp-btn-secondary w-full gap-2 text-[14px] font-medium"
            >
              <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              {oauthLoading === 'github' ? 'Redirecting…' : 'GitHub'}
            </button>
          </div>

          <p className="mt-6 text-center text-[14px] text-muted-gray">
            Already have an account?{' '}
            <Link href="/sign-in" className="gp-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
