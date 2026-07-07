import { Suspense } from 'react';
import SignInForm from '@/components/SignInForm';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Suspense fallback={<div className="text-sm text-slate-600">Loading sign-in...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
