import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="gp-card max-w-lg p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
          <ShieldAlert className="h-7 w-7 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Operator access required</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-gp-text-muted)]">
          This area is restricted to operator accounts. If you have an operator account, sign in
          with those credentials. Otherwise, head back to the driver dashboard to book a slot.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/sign-in" className="gp-btn-primary">
            Sign in as operator
          </Link>
          <Link href="/driver" className="gp-btn-secondary">
            Go to driver dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
