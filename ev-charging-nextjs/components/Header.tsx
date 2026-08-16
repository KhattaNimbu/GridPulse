'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ArrowRight, Zap } from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-gp-border)] bg-[var(--color-gp-bg)]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gp-cyan)] via-[#2cf1dd] to-[var(--color-gp-green)] shadow-[0_0_24px_rgba(34,211,238,0.28)]">
            <Zap className="h-4 w-4 fill-[var(--color-gp-bg)] text-[var(--color-gp-bg)]" />
          </div>
          <span className="text-[1.75rem] font-bold tracking-tight text-white">
            Grid<span className="text-[#46f0d1]">Pulse</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-white ${isActive('/') ? 'text-white' : 'text-[var(--color-gp-text-muted)]'}`}
          >
            Home
          </Link>

          {showDriverLink && (
            <Link
              href="/driver"
              className={`text-sm font-medium transition-colors hover:text-white ${isActive('/driver') ? 'text-white' : 'text-[var(--color-gp-text-muted)]'}`}
            >
              Driver
            </Link>
          )}

          {showOperatorLink && (
            <Link
              href="/operator"
              className={`text-sm font-medium transition-colors hover:text-white ${isActive('/operator') ? 'text-white' : 'text-[var(--color-gp-text-muted)]'}`}
            >
              Operator
            </Link>
          )}

          {status === 'loading' ? (
            <div className="text-sm text-[var(--color-gp-text-muted)]">...</div>
          ) : session?.user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-gp-text-muted)]">{session.user.name}</span>
                <span className="rounded-full border border-[var(--color-gp-cyan)]/20 bg-[var(--color-gp-cyan)]/10 px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-wider text-[var(--color-gp-cyan)]">
                  {session.user.role}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-[var(--color-gp-text-muted)] transition-colors hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className={`text-sm font-medium transition-colors hover:text-white ${isActive('/sign-in') ? 'text-white' : 'text-[var(--color-gp-text-muted)]'}`}
            >
              Sign in
            </Link>
          )}
        </nav>

        <Link href={launchTarget} className="gp-btn-primary hidden items-center gap-2 px-6 py-3 sm:inline-flex">
          Launch app
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
