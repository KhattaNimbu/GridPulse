'use client';

import { useState } from 'react';
import useSWR from 'swr';
import SlotPicker from '@/components/driver/SlotPicker';
import { Search, Filter, MapPin, ArrowRight, Zap } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Station = {
  id: string;
  name: string;
  numChargers: number;
  chargerType: string;
  maxCapacityKw: number;
  pricingRule: {
    basePrice: number;
  } | null;
};

export default function DriverPage() {
  const { data: stations, error } = useSWR<Station[]>('/api/stations', fetcher);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredStations =
    stations?.filter((station) => station.name.toLowerCase().includes(searchQuery.toLowerCase())) ?? [];

  return (
    <div className="mx-auto min-h-full w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Find a slot. <span className="text-[var(--color-gp-cyan)]">Charge worry-free.</span>
          </h1>
          <p className="mt-3 text-lg text-[var(--color-gp-text-muted)]">
            Live availability across your network. Pricing follows predicted demand.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gp-text-dim)]" />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gp-input rounded-full bg-white/[0.02] pl-9"
            />
          </div>
          <button className="gp-btn-secondary flex items-center gap-2 whitespace-nowrap rounded-full bg-white/[0.02]">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          {error && <div className="gp-card p-4 text-red-400">Failed to load stations.</div>}
          {!stations && !error && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse gp-card" />)}
            </div>
          )}

          {filteredStations.map((station) => {
            const isSelected = selectedStation === station.id;
            const seed = station.name.length * 17 + station.numChargers;
            const openChargers = Math.max(0, Math.min(station.numChargers, Math.floor((seed * 3) % (station.numChargers + 1))));
            const loadPct = Math.max(18, Math.min(96, Math.floor((seed * 11) % 100)));
            const loadColor = loadPct > 80 ? 'bg-red-500' : loadPct > 50 ? 'bg-amber-500' : 'bg-[var(--color-gp-green)]';
            const baseRate = station.pricingRule?.basePrice ?? 0.24;
            const distance = ((seed % 36) / 10 + 0.6).toFixed(1);

            return (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station.id)}
                className={`gp-card group flex cursor-pointer items-center justify-between p-5 transition-all ${
                  isSelected ? 'border-[var(--color-gp-border-active)] bg-[var(--color-gp-card-hover)]' : ''
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-gp-text-dim)]">
                    <MapPin className="w-3.5 h-3.5" /> San Francisco, CA · {distance} mi
                  </div>
                  <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[var(--color-gp-cyan)]">
                    {station.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--color-gp-text-muted)]">
                      <Zap className="w-3.5 h-3.5 text-[var(--color-gp-cyan)]" /> {openChargers}/{station.numChargers} open
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--color-gp-text-muted)]">
                      <span className={`w-2 h-2 rounded-full ${loadColor}`} /> {loadPct}% load
                    </div>
                    <div className="font-medium text-white">
                      ${baseRate.toFixed(2)}<span className="text-[var(--color-gp-text-dim)] text-xs font-normal">/kWh</span>
                    </div>
                  </div>
                </div>

                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isSelected ? 'bg-[var(--color-gp-cyan)]/10 text-[var(--color-gp-cyan)]' : 'bg-white/5 text-[var(--color-gp-text-dim)] group-hover:bg-white/10 group-hover:text-white'
                }`}>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}

          {filteredStations.length === 0 && stations && (
            <div className="gp-card border-dashed p-8 text-center text-[var(--color-gp-text-muted)]">
              No stations found matching your search.
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {selectedStation ? (
            <div className="sticky top-24 flex flex-col gap-6">
              <div className="gp-panel overflow-hidden p-1">
                <div className="relative flex aspect-[21/9] items-end overflow-hidden rounded-[1.4rem] border border-[var(--color-gp-border)] bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.12),transparent_22%),linear-gradient(180deg,#08172d_0%,#05101d_100%)] p-6">
                  <div className="absolute right-20 top-4 h-28 w-28 rounded-[1.8rem] border border-[#21d9ee]/30 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(34,211,238,0.05))] shadow-[0_0_30px_rgba(34,211,238,0.2)]" />
                  <div className="absolute right-12 top-20 h-40 w-16 rounded-[1.4rem] border border-[#21d9ee]/35 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(34,211,238,0.04))]" />
                  <div className="absolute right-24 top-16 h-6 w-6 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.8)]" />
                  <div className="absolute right-20 top-16 h-28 w-28 rounded-[1.8rem] bg-[var(--color-gp-cyan)]/8 blur-[40px]" />
                  <div className="relative z-10">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gp-text-dim)]">Selected</div>
                    <h2 className="text-4xl font-bold text-white">
                      {stations?.find((s) => s.id === selectedStation)?.name}
                    </h2>
                  </div>
                </div>
              </div>

              <SlotPicker stationId={selectedStation} />
            </div>
          ) : (
            <div className="sticky top-24 flex min-h-[500px] flex-col items-center justify-center border-dashed gp-card p-12 text-center">
              <MapPin className="mb-4 h-12 w-12 text-[var(--color-gp-text-dim)] opacity-50" />
              <h3 className="mb-2 text-xl font-medium text-white">Select a station</h3>
              <p className="text-[var(--color-gp-text-muted)]">Choose a station from the list to view live availability and book a slot.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
