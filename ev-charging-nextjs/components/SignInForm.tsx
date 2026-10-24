'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function getSafeCallbackUrl(callbackUrl: string | null, fallbackUrl: string) {
  if (!callbackUrl?.startsWith('/') || callbackUrl.startsWith('//')) {
    return fallbackUrl;
  }

  const requestedUrl = new URL(callbackUrl, window.location.origin);
  if (requestedUrl.origin !== window.location.origin) {
    return fallbackUrl;
  }

  return `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`;
}

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const oauthError = searchParams.get('error');

  const [mode, setMode] = useState<'DRIVER' | 'OPERATOR'>('DRIVER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(
    oauthError === 'OAuthSignin'
      ? 'Could not connect to OAuth provider. Check client credentials.'
      : oauthError === 'OAuthCallback'
      ? 'Error occurred during social sign-in. Please try again.'
      : oauthError === 'OAuthAccountNotLinked'
      ? 'An account already exists with this email address.'
      : oauthError
      ? 'Authentication failed. Please try again.'
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  async function handleOAuthSignIn(provider: 'google' | 'github') {
    setError('');
    setOauthLoading(provider);
    try {
      const fallbackUrl = mode === 'OPERATOR' ? '/operator' : '/driver';
      const destination = getSafeCallbackUrl(callbackUrl, fallbackUrl);
      await signIn(provider, { callbackUrl: destination });
    } catch {
      setError(`Failed to sign in with ${provider === 'google' ? 'Google' : 'GitHub'}.`);
      setOauthLoading(null);
    }
  }

  function switchMode(nextMode: 'DRIVER' | 'OPERATOR') {
    setMode(nextMode);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: getSafeCallbackUrl(callbackUrl, '/driver'),
      });

      if (!result || result.error) {
        setError('Invalid email or password');
        return;
      }

      const session = await getSession();
      if (!session?.user) {
        setError('Signed in, but we could not load your account. Please try again.');
        return;
      }

      const dashboardPath = session.user.role === 'OPERATOR' ? '/operator' : '/driver';
      const requestedUrl = new URL(getSafeCallbackUrl(callbackUrl, dashboardPath), window.location.origin);
      const canResumeRequestedUrl =
        requestedUrl.pathname === dashboardPath ||
        requestedUrl.pathname.startsWith(`${dashboardPath}/`);
      const destination = canResumeRequestedUrl
        ? `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
        : dashboardPath;

      router.replace(destination);
      router.refresh();
    } catch {
      setError('Something went wrong while signing in. Please try again.');
    } finally {
      setLoading(false);
    }
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

        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-mist-gray" />
          <span className="absolute bg-paper-white px-3 text-[13px] text-muted-gray">
            or continue with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
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
            onClick={() => handleOAuthSignIn('github')}
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
          No account?{' '}
          <Link href="/sign-up" className="gp-link">
            Request access
          </Link>
        </p>

      </div>
    </div>
  );
}
