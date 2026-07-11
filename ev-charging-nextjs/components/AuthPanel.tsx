'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function AuthPanel() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-sm text-[var(--color-gp-text-dim)]">Checking session...</div>;
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-full border border-[var(--color-gp-border)] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/5"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right text-sm">
        <div className="font-medium text-white">{session.user.name}</div>
        <div className="text-[var(--color-gp-cyan)] text-xs font-medium uppercase tracking-wider">{session.user.role}</div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="rounded-full border border-[var(--color-gp-border)] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/5"
      >
        Sign Out
      </button>
    </div>
  );
}
