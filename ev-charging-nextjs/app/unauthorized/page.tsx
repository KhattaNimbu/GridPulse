import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[1200px] items-center justify-center px-6 py-16">
      <div className="gp-panel max-w-lg p-8 text-center">
        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-mist-gray">
          <ShieldAlert className="h-5 w-5 text-signal-amber" strokeWidth={1.5} />
        </div>
        <h1 className="text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">
          Operator access required
        </h1>
        <p className="mt-3 text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
          This area is restricted to operator accounts. If you have an operator account, sign in with those
          credentials. Otherwise, head back to the driver dashboard to book a slot.
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
