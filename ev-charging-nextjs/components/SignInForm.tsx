'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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

  // Square segmented control — active segment is a Mint wash, never a fill.
  const segment = (value: 'DRIVER' | 'OPERATOR') =>
    `rounded-md px-4 py-2 text-[14px] font-medium transition-colors ${
      mode === value ? 'bg-mint-green/6 text-mint-green' : 'text-muted-gray hover:text-ink-black'
    }`;

  return (
    <div className="grid w-full max-w-[1200px] gap-16 lg:grid-cols-2 lg:items-center">
      {/* ── Left: Welcome copy ── */}
      <div className="flex flex-col gap-5">
        <span className="gp-eyebrow">
          <span className="gp-eyebrow-dot" />
          Secure sign-in
        </span>
        <h1 className="text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
          Welcome back to GridPulse.
        </h1>
        <p className="max-w-xl text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
          Book charging slots as a driver or step into the control room as an operator. Sessions are
          role-protected and encrypted end to end.
        </p>
        <ul className="mt-2 flex flex-col gap-3">
          {[
            'NextAuth credentials with role gating',
            'Serializable booking guarantees',
            'SSO-ready architecture for future enterprise plans',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-[16px] tracking-[-0.16px] text-true-black">
              <span className="gp-eyebrow-dot" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right: Sign-in card ── */}
      <div className="gp-panel p-8">
        <h2 className="text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">Sign in</h2>
        <p className="mt-1 text-[14px] text-muted-gray">Use your GridPulse credentials.</p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-md border border-mist-gray p-1">
          <button type="button" onClick={() => switchMode('DRIVER')} className={segment('DRIVER')}>
            Driver
          </button>
          <button type="button" onClick={() => switchMode('OPERATOR')} className={segment('OPERATOR')}>
            Operator
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="gp-label">Email address</span>
            <input
              type="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="gp-input"
            />
          </label>

          <div className="flex items-center justify-between text-[14px]">
            <label className="flex cursor-pointer items-center gap-2 text-true-black">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-[2px] border-cloud-gray accent-mint-green"
              />
              Remember me
            </label>
            <span className="cursor-pointer text-mint-green hover:underline">Forgot password?</span>
          </div>

          {error && <div className="gp-notice gp-notice-error">{error}</div>}

          <button type="submit" disabled={loading} className="gp-btn-primary w-full">
            {loading ? 'Signing in…' : `Continue as ${mode === 'DRIVER' ? 'driver' : 'operator'}`}
            {!loading && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-muted-gray">
          No account?{' '}
          <Link href="/sign-up" className="gp-link">
            Request access
          </Link>
        </p>

        {(demoOperatorEmail || demoDriverEmail) && (
          <div className="gp-notice mt-6">
            <div className="gp-eyebrow mb-2">Demo credentials</div>
            {demoOperatorEmail && demoOperatorPassword && (
              <div>
                <span className="font-medium">Operator:</span> {demoOperatorEmail} / {demoOperatorPassword}
              </div>
            )}
            {demoDriverEmail && demoDriverPassword && (
              <div className={demoOperatorEmail ? 'mt-1' : ''}>
                <span className="font-medium">Driver:</span> {demoDriverEmail} / {demoDriverPassword}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
