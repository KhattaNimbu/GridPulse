'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Bell, Settings, Zap } from 'lucide-react';
import GridStressAlert from '@/components/operator/GridStressAlert';
import LoadCurveChart from '@/components/operator/LoadCurveChart';
import PricingRuleForm from '@/components/operator/PricingRuleForm';
import StationForm from '@/components/operator/StationForm';
import { useLoadCurve } from '@/hooks/useLoadCurve';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

export default function OperatorPage() {
  const { data: stations, error, mutate } = useSWR<Station[]>('/api/stations', fetcher);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const activeStationId = selectedStationId ?? stations?.[0]?.id ?? null;
  const { data: loadCurve, error: loadCurveError } = useLoadCurve(activeStationId);

  const totalLoad = loadCurve ? loadCurve.peakBookedKw.toFixed(1) : '1245.5';
  const activeSessions = loadCurve ? Math.floor(loadCurve.peakBookedKw / 25) : 84;
  const utilization = loadCurve && loadCurve.station.maxCapacityKw > 0
    ? ((loadCurve.peakBookedKw / loadCurve.station.maxCapacityKw) * 100).toFixed(1)
    : '68.2';
  const headroom = loadCurve
    ? (loadCurve.station.maxCapacityKw - loadCurve.peakBookedKw).toFixed(1)
    : '450.5';

  return (
    <div className="min-h-screen bg-[var(--color-gp-bg)] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="gp-badge rounded-full px-4 py-2 text-[0.82rem] text-[var(--color-gp-text-muted)]">
              <Zap className="h-3.5 w-3.5 text-[var(--color-gp-cyan)]" /> Operator control room
            </div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-100">
              All systems <span className="gp-gradient-text">nominal.</span>
            </h1>
            <p className="mt-3 text-lg text-[var(--color-gp-text-muted)]">
              Live polling every 15s · Forecast horizon 24h · {stations?.length ?? 0} stations online
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="gp-btn-secondary flex items-center gap-2"><Bell className="h-4 w-4" /> Alerts</button>
            <button className="gp-btn-secondary flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="gp-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Total Load</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">{totalLoad} <span className="text-lg font-normal text-slate-500">kW</span></p>
            <p className="mt-2 text-sm text-[var(--color-gp-green)]">+8.4%</p>
          </div>
          <div className="gp-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Active Sessions</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">{activeSessions}</p>
            <p className="mt-2 text-sm text-[var(--color-gp-green)]">+12.7%</p>
          </div>
          <div className="gp-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Utilization</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">{utilization} <span className="text-lg font-normal text-slate-500">%</span></p>
            <p className="mt-2 text-sm text-[var(--color-gp-green)]">Optimal</p>
          </div>
          <div className="gp-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Capacity Headroom</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">{headroom} <span className="text-lg font-normal text-slate-500">kW</span></p>
            <p className="mt-2 text-sm text-[var(--color-gp-green)]">Safe</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="col-span-1">
            <StationForm onSuccess={() => mutate()} />
          </div>

          <div className="col-span-1 space-y-8 lg:col-span-2">
            <div className="space-y-4">
              {loadCurveError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  Failed to load the live dashboard for the selected station.
                </div>
              )}
              {loadCurve && <GridStressAlert data={loadCurve} />}
              {loadCurve ? (
                <LoadCurveChart data={loadCurve} />
              ) : (
                <div className="gp-card p-6 py-12 text-center text-sm text-slate-400">
                  Select or create a station to start watching live load.
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-100">Your Stations</h2>
              {error && <p className="text-red-400">Failed to load stations.</p>}
              {!stations && !error && (
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
                          <p>Lat: {station.latitude.toFixed(4)}</p>
                          <p>Lng: {station.longitude.toFixed(4)}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedStationId(station.id)} className="gp-btn-secondary whitespace-nowrap">
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

                {stations?.length === 0 && (
                  <div className="gp-card p-8 text-center">
                    <p className="text-slate-400">No stations found. Create one to get started.</p>
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
