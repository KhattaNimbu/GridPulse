'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Zap } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => pathname === path;
  const userRole = session?.user?.role;

  // Determine which dashboard link to show based on role
  // If not signed in, show both. If signed in, only show the user's role dashboard.
  const showDriverLink = !userRole || userRole === 'DRIVER';
  const showOperatorLink = !userRole || userRole === 'OPERATOR';

  // CTA target based on role
  const launchTarget = userRole === 'OPERATOR' ? '/operator' : '/driver';

  // Active nav reads as switched on via Mint Green; inactive stays true black.
  const navLink = (path: string) =>
    `text-[14px] font-medium transition-colors ${
      isActive(path) ? 'text-mint-green' : 'text-true-black hover:text-mint-green'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-paper-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-mint-green">
            <Zap className="h-4 w-4 fill-paper-white text-paper-white" />
          </span>
          <span className="text-[20px] font-semibold tracking-[-0.2px] text-ink-black">
            GridPulse
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/" className={navLink('/')}>
            Home
          </Link>

          {showDriverLink && (
            <Link href="/driver" className={navLink('/driver')}>
              Driver
            </Link>
          )}

          {showOperatorLink && (
            <Link href="/operator" className={navLink('/operator')}>
              Operator
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <span className="text-[14px] text-muted-gray">…</span>
          ) : session?.user ? (
            <>
              <span className="hidden items-center gap-2 sm:flex">
                <span className="text-[14px] text-true-black">{session.user.name}</span>
                <span className="gp-tag text-mint-green">{session.user.role}</span>
              </span>
              <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="gp-btn-ghost">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/sign-in" className="gp-btn-ghost">
              Sign in
            </Link>
          )}

          <Link href={launchTarget} className="gp-btn-primary hidden text-[14px] sm:inline-flex">
            Launch app
          </Link>
        </div>
      </div>
    </header>
  );
}
