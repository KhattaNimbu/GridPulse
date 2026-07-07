'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function AuthPanel() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-sm text-slate-500">Checking session...</div>;
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-500"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-sm text-slate-600">
        <div className="font-medium text-slate-900">{session.user.name}</div>
        <div>{session.user.role}</div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-500"
      >
        Sign Out
      </button>
    </div>
  );
}
