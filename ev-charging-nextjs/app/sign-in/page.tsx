import { Suspense } from 'react';
import SignInForm from '@/components/SignInForm';
import SiteFooter from '@/components/SiteFooter';

export default function SignInPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-20 px-6 py-16">
      <div className="flex flex-1 items-center justify-center">
        <Suspense fallback={<div className="text-[14px] text-muted-gray">Loading sign-in…</div>}>
          <SignInForm />
        </Suspense>
      </div>

      <SiteFooter />
    </div>
  );
}
