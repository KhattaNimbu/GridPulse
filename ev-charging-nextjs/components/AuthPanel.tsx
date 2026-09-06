'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function AuthPanel() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-[14px] text-muted-gray">Checking session…</div>;
  }

  if (!session?.user) {
    return (
      <Link href="/sign-in" className="gp-btn-secondary">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-[14px] font-medium text-ink-black">{session.user.name}</div>
        <div className="text-[13px] uppercase tracking-[0.65px] text-mint-green">{session.user.role}</div>
      </div>
      <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="gp-btn-secondary">
        Sign out
      </button>
    </div>
  );
}
