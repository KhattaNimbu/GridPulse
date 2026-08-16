'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Zap, Mail, Lock } from 'lucide-react';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const demoDriverEmail = process.env.NEXT_PUBLIC_DEMO_DRIVER_EMAIL?.trim();
  const demoDriverPassword = process.env.NEXT_PUBLIC_DEMO_DRIVER_PASSWORD?.trim();
  const demoOperatorEmail = process.env.NEXT_PUBLIC_DEMO_OPERATOR_EMAIL?.trim();
  const demoOperatorPassword = process.env.NEXT_PUBLIC_DEMO_OPERATOR_PASSWORD?.trim();

  const [mode, setMode] = useState<'DRIVER' | 'OPERATOR'>('DRIVER');
  const [email, setEmail] = useState(demoDriverEmail ?? '');
  const [password, setPassword] = useState(demoDriverPassword ?? '');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: 'DRIVER' | 'OPERATOR') {
    setMode(nextMode);
    if (nextMode === 'DRIVER') {
      setEmail(demoDriverEmail ?? '');
      setPassword(demoDriverPassword ?? '');
      return;
    }
    setEmail(demoOperatorEmail ?? '');
    setPassword(demoOperatorPassword ?? '');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError('Invalid email or password');
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <div className="grid w-full max-w-6xl mx-auto gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
      {/* ── Left: Welcome copy ── */}
      <div className="space-y-8">
        <div className="gp-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] text-[var(--color-gp-text-muted)]">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-gp-cyan)]" /> Secure sign-in
        </div>
        <div className="space-y-5">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Welcome back to <span className="gp-gradient-text">GridPulse.</span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[var(--color-gp-text-muted)]">
            Book charging slots as a driver or step into the control room as an operator. Sessions are role-protected and encrypted end to end.
          </p>
        </div>
        <ul className="space-y-3 text-[var(--color-gp-text-muted)]">
          {[
            'NextAuth credentials with role gating',
            'Serializable booking guarantees',
            'SSO-ready architecture for future enterprise plans',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[var(--color-gp-cyan)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right: Sign-in card ── */}
      <div className="gp-panel rounded-[2rem] p-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(4,16,29,0.9)] p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gp-cyan)] to-[var(--color-gp-green)]">
              <Zap className="h-4 w-4 fill-[var(--color-gp-bg)] text-[var(--color-gp-bg)]" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">Sign in</div>
              <div className="text-sm text-[var(--color-gp-text-muted)]">Use your GridPulse credentials</div>
            </div>
          </div>

          {/* Role switcher */}
          <div className="mb-6 grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => switchMode('DRIVER')}
              className={`rounded-full px-4 py-3 text-sm font-medium transition-colors ${mode === 'DRIVER' ? 'bg-gradient-to-r from-[var(--color-gp-cyan)] to-[var(--color-gp-green)] text-[var(--color-gp-bg)]' : 'text-[var(--color-gp-text-muted)]'}`}
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => switchMode('OPERATOR')}
              className={`rounded-full px-4 py-3 text-sm font-medium transition-colors ${mode === 'OPERATOR' ? 'bg-gradient-to-r from-[var(--color-gp-cyan)] to-[var(--color-gp-green)] text-[var(--color-gp-bg)]' : 'text-[var(--color-gp-text-muted)]'}`}
            >
              Operator
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-2 block font-medium uppercase tracking-[0.18em] text-[var(--color-gp-text-dim)]">Email</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-gp-text-dim)]" />
                <input
                  type="email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="gp-input pl-11"
                />
              </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--color-gp-text-muted)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[var(--color-gp-cyan)]"
                />
                Remember me
              </label>
              <span className="cursor-pointer text-[var(--color-gp-cyan)] transition-colors hover:text-white">
                Forgot password?
              </span>
            </div>

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
              {loading ? 'Signing in...' : `Continue as ${mode === 'DRIVER' ? 'driver' : 'operator'}`}
              {!loading && <span>→</span>}
            </button>
          </form>

          {/* Social sign-in (visual only) */}
          <div className="mt-6 text-center text-sm text-[var(--color-gp-text-dim)]">or continue with</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
            >
              Google
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
            >
              Microsoft
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--color-gp-text-muted)]">
            No account?{' '}
            <Link href="/sign-up" className="font-medium text-[var(--color-gp-cyan)] transition-colors hover:text-white">
              Request access
            </Link>
          </p>

          {(demoOperatorEmail || demoDriverEmail) && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-[var(--color-gp-text-muted)]">
              {demoOperatorEmail && demoOperatorPassword && (
                <div><span className="font-medium text-white">Operator:</span> {demoOperatorEmail} / {demoOperatorPassword}</div>
              )}
              {demoDriverEmail && demoDriverPassword && (
                <div className={demoOperatorEmail ? 'mt-1' : ''}><span className="font-medium text-white">Driver:</span> {demoDriverEmail} / {demoDriverPassword}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
