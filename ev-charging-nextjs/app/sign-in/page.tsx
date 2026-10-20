import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import SignInForm from '@/components/SignInForm';
import SiteFooter from '@/components/SiteFooter';

export default async function SignInPage() {
  const session = await getAuthSession();
  if (session?.user?.id) {
    redirect(session.user.role === 'OPERATOR' ? '/operator' : '/driver');
  }

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
