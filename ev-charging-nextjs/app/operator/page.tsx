'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { PlusCircle, RadioTower, Zap } from 'lucide-react';
import GridStressAlert from '@/components/operator/GridStressAlert';
import LoadCurveChart from '@/components/operator/LoadCurveChart';
import PricingRuleForm from '@/components/operator/PricingRuleForm';
import StationForm from '@/components/operator/StationForm';
import { useLoadCurve } from '@/hooks/useLoadCurve';
import { formatCurrency } from '@/lib/currency';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Failed to load stations');
  }
  return response.json();
};

type Station = {
  id: string;
  name: string;
  maxCapacityKw: number;
  numChargers: number;
  chargerType: string;
  latitude: number;
  longitude: number;
  pricingRule: {
    basePrice: number;
    demandMultiplier: number;
  } | null;
};

function Kpi({ label, value, unit, hint }: { label: string; value: string | null; unit?: string; hint?: string }) {
  return (
    <div className="gp-card p-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
      {value === null ? (
        <p className="mt-2 text-lg font-medium text-slate-500">No data</p>
      ) : (
        <p className="mt-2 text-3xl font-bold text-slate-100">
          {value} {unit && <span className="text-lg font-normal text-slate-500">{unit}</span>}
        </p>
      )}
      {hint && <p className="mt-2 text-sm text-[var(--color-gp-text-muted)]">{hint}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="gp-card p-6">
      <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
      <div className="mt-3 h-8 w-24 animate-pulse rounded bg-white/5" />
    </div>
  );
}

export default function OperatorPage() {
  const { data: stations, error, mutate, isLoading } = useSWR<Station[]>('/api/stations', fetcher);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const activeStationId = selectedStationId ?? stations?.[0]?.id ?? null;
  const { data: loadCurve, error: loadCurveError, isLoading: loadCurveLoading } = useLoadCurve(activeStationId);

  const utilization =
    loadCurve && loadCurve.station.maxCapacityKw > 0
      ? ((loadCurve.peakBookedKw / loadCurve.station.maxCapacityKw) * 100).toFixed(1)
      : null;
  const headroom = loadCurve ? Math.max(0, loadCurve.station.maxCapacityKw - loadCurve.peakBookedKw).toFixed(1) : null;
  const lastUpdatedLabel = loadCurve
    ? new Date(loadCurve.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-gp-bg)] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="gp-badge rounded-full px-4 py-2 text-[0.82rem] text-[var(--color-gp-text-muted)]">
              <Zap className="h-3.5 w-3.5 text-[var(--color-gp-cyan)]" /> Operator control room
            </div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-100">
              Your stations, <span className="gp-gradient-text">observed live.</span>
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-lg text-[var(--color-gp-text-muted)]">
              <span className="flex items-center gap-1.5">
                <RadioTower className="h-4 w-4 text-[var(--color-gp-cyan)]" /> Polling every 5s
              </span>
              <span aria-hidden="true">·</span>
              <span>{isLoading ? 'Loading stations…' : `${stations?.length ?? 0} stations`}</span>
              {loadCurveError && (
                <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                  Live dashboard unavailable
                </span>
              )}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loadCurveLoading && activeStationId ? (
            <>
              <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
            </>
          ) : (
            <>
              <Kpi
                label="Peak booked load"
                value={loadCurve ? loadCurve.peakBookedKw.toFixed(1) : null}
                unit="kW"
                hint={lastUpdatedLabel ? `As of ${lastUpdatedLabel}` : undefined}
              />
              <Kpi
                label="Active sessions"
                value={loadCurve ? String(loadCurve.activeSessions) : null}
                hint="Bookings in progress right now"
              />
              <Kpi
                label="Utilization"
                value={utilization}
                unit="%"
                hint={utilization ? (Number(utilization) > 85 ? 'Approaching capacity' : 'Within safe range') : undefined}
              />
              <Kpi
                label="Capacity headroom"
                value={headroom}
                unit="kW"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="col-span-1">
            <StationForm onSuccess={() => mutate()} />
          </div>

          <div className="col-span-1 space-y-8 lg:col-span-2">
            <div className="space-y-4">
              {loadCurveError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  Failed to load the live dashboard for the selected station. Polling will retry automatically.
                </div>
              )}
              {loadCurve && <GridStressAlert data={loadCurve} />}
              {loadCurve ? (
                <LoadCurveChart data={loadCurve} />
              ) : activeStationId && !loadCurveError ? (
                <div className="gp-card p-6 py-12 text-center text-sm text-slate-400">
                  <div className="mx-auto h-40 w-full max-w-md animate-pulse rounded-lg bg-white/5" />
                  <p className="mt-4">Loading live load curve…</p>
                </div>
              ) : (
                <div className="gp-card p-6 py-12 text-center text-sm text-slate-400">
                  Select or create a station to start watching live load.
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-100">Your Stations</h2>
              {error && (
                <div className="gp-card mb-4 p-4 text-red-400">{error instanceof Error ? error.message : 'Failed to load stations.'}</div>
              )}
              {isLoading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-32 rounded-lg border border-white/10 bg-white/5"></div>
                  <div className="h-32 rounded-lg border border-white/10 bg-white/5"></div>
                </div>
              )}

              <div className="grid gap-6">
                {stations?.map((station) => (
                  <div
                    key={station.id}
                    className={`grid gap-4 gp-card p-6 transition-all ${
                      activeStationId === station.id ? 'gp-card-active' : ''
                    }`}
                  >
                    <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center">
                      <div>
                        <h3 className="flex items-center gap-3 text-xl font-bold text-slate-100">
                          {station.name}
                          {activeStationId === station.id && (
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
                            </span>
                          )}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                          <p>Capacity: <span className="font-medium text-slate-200">{station.maxCapacityKw} kW</span></p>
                          <p>Chargers: <span className="font-medium text-slate-200">{station.numChargers} ({station.chargerType})</span></p>
                          <p>
                            Base price:{' '}
                            <span className="font-medium text-slate-200">
                              {station.pricingRule ? `${formatCurrency(station.pricingRule.basePrice)}/kWh` : 'Not set'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStationId(station.id)}
                        aria-pressed={activeStationId === station.id}
                        className="gp-btn-secondary whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gp-cyan)]"
                      >
                        Watch Live
                      </button>
                    </div>

                    <PricingRuleForm
                      stationId={station.id}
                      initialRule={station.pricingRule}
                      onSuccess={() => mutate()}
                    />
                  </div>
                ))}

                {!isLoading && !error && stations?.length === 0 && (
                  <div className="gp-card flex flex-col items-center gap-3 p-10 text-center">
                    <PlusCircle className="h-8 w-8 text-[var(--color-gp-text-dim)]" />
                    <p className="text-slate-400">You don&apos;t have any stations yet. Create one on the left to start tracking live load.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
