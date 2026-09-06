'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { PlusCircle } from 'lucide-react';
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
      <p className="text-[13px] text-muted-gray">{label}</p>
      {value === null ? (
        <p className="mt-1 text-[20px] font-medium tracking-[-0.2px] text-muted-gray">No data</p>
      ) : (
        <p className="mt-1 text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
          {value}
          {unit && <span className="ml-1 text-[20px] font-normal tracking-[-0.2px] text-muted-gray">{unit}</span>}
        </p>
      )}
      {hint && <p className="mt-2 text-[13px] text-muted-gray">{hint}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="gp-card p-6">
      <div className="gp-skeleton h-3 w-20 animate-pulse" />
      <div className="gp-skeleton mt-3 h-9 w-24 animate-pulse" />
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
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="flex flex-col gap-4">
        <span className="gp-eyebrow">
          <span className="gp-eyebrow-dot" />
          Operator control room
        </span>
        <h1 className="max-w-3xl text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
          Your stations, observed live.
        </h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
          <span>Polling every 5s</span>
          <span aria-hidden="true">·</span>
          <span>{isLoading ? 'Loading stations…' : `${stations?.length ?? 0} stations`}</span>
          {loadCurveError && (
            <span className="gp-tag border-signal-red/25 text-signal-red">Live dashboard unavailable</span>
          )}
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="lg:sticky lg:top-24">
          <StationForm onSuccess={() => mutate()} />
        </div>

        <div className="flex flex-col gap-10 lg:col-span-2">
          <div className="flex flex-col gap-4">
            {loadCurveError && (
              <div className="gp-notice gp-notice-error">
                Failed to load the live dashboard for the selected station. Polling will retry automatically.
              </div>
            )}
            {loadCurve && <GridStressAlert data={loadCurve} />}
            {loadCurve ? (
              <LoadCurveChart data={loadCurve} />
            ) : activeStationId && !loadCurveError ? (
              <div className="gp-card p-6">
                <div className="gp-skeleton h-64 w-full animate-pulse" />
                <p className="mt-4 text-center text-[14px] text-muted-gray">Loading live load curve…</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-cloud-gray p-12 text-center text-[14px] text-muted-gray">
                Select or create a station to start watching live load.
              </div>
            )}
          </div>

          <div>
            <h2 className="text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">
              Your stations
            </h2>

            {error && (
              <div className="gp-notice gp-notice-error mt-4">
                {error instanceof Error ? error.message : 'Failed to load stations.'}
              </div>
            )}

            {isLoading && (
              <div className="mt-4 flex flex-col gap-4">
                <div className="gp-skeleton h-32 animate-pulse" />
                <div className="gp-skeleton h-32 animate-pulse" />
              </div>
            )}

            <div className="mt-4 grid gap-6">
              {stations?.map((station) => (
                <div
                  key={station.id}
                  className={`gp-card p-6 ${activeStationId === station.id ? 'gp-card-active' : ''}`}
                >
                  <div className="flex flex-col items-start justify-between gap-4 border-b border-mist-gray pb-5 md:flex-row md:items-center">
                    <div>
                      <h3 className="flex items-center gap-2.5 text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
                        {station.name}
                        {activeStationId === station.id && <span className="gp-eyebrow-dot" aria-label="Watching live" />}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-muted-gray">
                        <p>Capacity: <span className="font-medium text-ink-black">{station.maxCapacityKw} kW</span></p>
                        <p>Chargers: <span className="font-medium text-ink-black">{station.numChargers} ({station.chargerType})</span></p>
                        <p>
                          Base price:{' '}
                          <span className="font-medium text-ink-black">
                            {station.pricingRule ? `${formatCurrency(station.pricingRule.basePrice)}/kWh` : 'Not set'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStationId(station.id)}
                      aria-pressed={activeStationId === station.id}
                      className="gp-btn-secondary whitespace-nowrap"
                    >
                      Watch live
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
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-cloud-gray p-12 text-center">
                  <PlusCircle className="h-8 w-8 text-muted-gray" strokeWidth={1.5} />
                  <p className="max-w-sm text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
                    You don&apos;t have any stations yet. Create one on the left to start tracking live load.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
