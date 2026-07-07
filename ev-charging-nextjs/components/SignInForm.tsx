'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEMO_EMAIL ?? 'operator@example.com');
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? 'operator123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use a seeded operator or driver account to access the demo.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </label>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <div><span className="font-medium text-slate-800">Operator:</span> {process.env.NEXT_PUBLIC_DEMO_OPERATOR_EMAIL ?? 'operator@example.com'} / {process.env.NEXT_PUBLIC_DEMO_OPERATOR_PASSWORD ?? 'operator123'}</div>
        <div><span className="font-medium text-slate-800">Driver:</span> {process.env.NEXT_PUBLIC_DEMO_DRIVER_EMAIL ?? 'driver@example.com'} / {process.env.NEXT_PUBLIC_DEMO_DRIVER_PASSWORD ?? 'driver123'}</div>
      </div>
    </div>
  );
}
