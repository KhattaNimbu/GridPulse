'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ShieldCheck, Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';

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

      if (signInResult?.error) {
        // Account created but sign-in failed — redirect to sign-in
        router.push('/sign-in');
      } else {
        router.push(signInResult?.url ?? '/driver');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[var(--color-gp-cyan)]/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[var(--color-gp-green)]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        {/* ── Left: Welcome copy ── */}
        <div className="space-y-8">
          <div className="gp-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] text-[var(--color-gp-text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-gp-cyan)]" /> Create account
          </div>
          <div className="space-y-5">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Join the <span className="gp-gradient-text">GridPulse</span> network.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[var(--color-gp-text-muted)]">
              Create a driver account to browse stations and book charging slots. Operator accounts are provisioned separately and are not available through public sign-up.
            </p>
          </div>
          <ul className="space-y-3 text-[var(--color-gp-text-muted)]">
            {[
              'Instant access after registration',
              'Real-time station availability',
              'Capacity-protected booking from day one',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--color-gp-cyan)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: Sign-up card ── */}
        <div className="gp-panel rounded-[2rem] p-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(4,16,29,0.9)] p-6">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gp-cyan)] to-[var(--color-gp-green)]">
                <Zap className="h-4 w-4 fill-[var(--color-gp-bg)] text-[var(--color-gp-bg)]" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">Sign up</div>
                <div className="text-sm text-[var(--color-gp-text-muted)]">Create your GridPulse driver account</div>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-gp-text-muted)]">
              Looking for operator access? Operator accounts require admin provisioning and cannot be created here.
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm">
                <span className="mb-2 block font-medium uppercase tracking-[0.18em] text-[var(--color-gp-text-dim)]">Full name</span>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-gp-text-dim)]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="gp-input pl-11"
                  />
                </div>
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium uppercase tracking-[0.18em] text-[var(--color-gp-text-dim)]">Email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-gp-text-dim)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@grid.co"
                    className="gp-input pl-11"
                  />
                </div>
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium uppercase tracking-[0.18em] text-[var(--color-gp-text-dim)]">Password</span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-gp-text-dim)]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="gp-input pl-11"
                  />
                </div>
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium uppercase tracking-[0.18em] text-[var(--color-gp-text-dim)]">Confirm password</span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-gp-text-dim)]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="gp-input pl-11"
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="gp-btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-base"
              >
                {loading ? 'Creating account...' : 'Create driver account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-gp-text-muted)]">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-medium text-[var(--color-gp-cyan)] transition-colors hover:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-gp-border)] py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-[var(--color-gp-text-dim)]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gp-cyan)] to-[var(--color-gp-green)]">
              <Zap className="h-3 w-3 fill-[var(--color-gp-bg)] text-[var(--color-gp-bg)]" />
            </div>
            © {new Date().getFullYear()} GridPulse. All rights reserved.
          </div>
          <div className="hidden gap-6 text-sm text-[var(--color-gp-text-dim)] sm:flex">
            <span className="cursor-pointer transition-colors hover:text-white">Privacy</span>
            <span className="cursor-pointer text-[var(--color-gp-cyan)] transition-colors hover:text-white">Terms</span>
            <span className="cursor-pointer transition-colors hover:text-white">Security</span>
            <span className="cursor-pointer transition-colors hover:text-white">Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
