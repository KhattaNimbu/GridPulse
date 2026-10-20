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

            <button type="submit" disabled={loading} className="gp-btn-primary w-full">
              {loading ? 'Creating account…' : 'Create driver account'}
              {!loading && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </form>

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
