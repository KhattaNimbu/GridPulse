export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 p-6">
      <div className="max-w-lg rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-amber-900">Operator Access Required</h1>
        <p className="mt-3 text-sm text-amber-800">
          This area is restricted to operator accounts. Sign in with the seeded operator
          credentials to manage stations, pricing, and live load monitoring.
        </p>
      </div>
    </div>
  );
}
