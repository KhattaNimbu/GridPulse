import { Suspense } from 'react';
import SignInForm from '@/components/SignInForm';

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16 relative">
      {/* Background ambient effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[var(--color-gp-cyan)]/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[var(--color-gp-green)]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full">
        <Suspense fallback={<div className="text-sm text-[var(--color-gp-text-muted)]">Loading sign-in...</div>}>
          <SignInForm />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-gp-border)] py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-[var(--color-gp-text-dim)]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gp-cyan)] to-[var(--color-gp-green)]">
              <svg className="h-3 w-3 fill-[var(--color-gp-bg)] text-[var(--color-gp-bg)]" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
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
