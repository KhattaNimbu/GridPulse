import Link from "next/link";
import AuthPanel from "@/components/AuthPanel";

export default function Home() {
  return (
    <div className="flex flex-1 bg-slate-950 text-white">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">EV Load Management</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Predict charging demand, protect grid capacity, and shape behavior with pricing.
            </h1>
          </div>
          <AuthPanel />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-semibold text-white">Driver Experience</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Drivers can browse nearby stations, see forecast-informed pricing, and book
              grid-safe slots with concurrency-protected capacity checks.
            </p>
            <Link
              href="/driver"
              className="mt-6 inline-flex rounded-lg bg-cyan-400 px-4 py-3 font-medium text-slate-950 hover:bg-cyan-300"
            >
              Open Driver Dashboard
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-semibold text-white">Operator Experience</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Operators manage stations, tune dynamic pricing, and watch the live load curve with
              polling-based grid stress alerts.
            </p>
            <Link
              href="/operator"
              className="mt-6 inline-flex rounded-lg border border-white/20 px-4 py-3 font-medium text-white hover:border-cyan-300 hover:text-cyan-200"
            >
              Open Operator Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-cyan-300">Forecasting</div>
            <p className="mt-2 text-sm text-slate-300">
              Prophet-based demand forecasts generate 30-minute predictions for the next 24 hours.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-cyan-300">Capacity Safety</div>
            <p className="mt-2 text-sm text-slate-300">
              Serializable booking transactions prevent the station from being overbooked under concurrency.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-cyan-300">Dynamic Pricing</div>
            <p className="mt-2 text-sm text-slate-300">
              Forecast load ratio drives explainable price changes instead of opaque surge heuristics.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
