'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import SlotPicker from '@/components/driver/SlotPicker';
import BookingHistory from '@/components/driver/BookingHistory';
import { Search, MapPin, ArrowRight, Zap, AlertCircle, RefreshCw } from 'lucide-react';
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
  numChargers: number;
  chargerType: string;
  maxCapacityKw: number;
  pricingRule: {
    basePrice: number;
  } | null;
};

type SortKey = 'name' | 'capacity' | 'price';

export default function DriverPage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { data: stations, error, isLoading } = useSWR<Station[]>('/api/stations', fetcher, {
    refreshInterval: 15000,
    onSuccess: () => setLastUpdated(new Date()),
  });
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chargerTypeFilter, setChargerTypeFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [activeTab, setActiveTab] = useState<'browse' | 'history'>('browse');

  const chargerTypes = useMemo(
    () => Array.from(new Set(stations?.map((s) => s.chargerType) ?? [])),
    [stations]
  );

  const visibleStations = useMemo(() => {
    const filtered = (stations ?? []).filter((station) => {
      const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = chargerTypeFilter === 'ALL' || station.chargerType === chargerTypeFilter;
      return matchesSearch && matchesType;
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === 'capacity') return b.maxCapacityKw - a.maxCapacityKw;
      if (sortKey === 'price') return (a.pricingRule?.basePrice ?? Infinity) - (b.pricingRule?.basePrice ?? Infinity);
      return a.name.localeCompare(b.name);
    });
  }, [stations, searchQuery, chargerTypeFilter, sortKey]);

  return (
    <div className="mx-auto min-h-full w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Find a slot. <span className="text-[var(--color-gp-cyan)]">Charge worry-free.</span>
          </h1>
          <p className="mt-3 text-lg text-[var(--color-gp-text-muted)]">
            Station availability and pricing are pulled live from the network.
          </p>
        </div>
      </div>

      <div className="mb-8 flex gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'browse' ? 'border-b-2 border-[var(--color-gp-cyan)] text-white' : 'text-[var(--color-gp-text-muted)] hover:text-white'}`}
        >
          Browse stations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'border-b-2 border-[var(--color-gp-cyan)] text-white' : 'text-[var(--color-gp-text-muted)] hover:text-white'}`}
        >
          My bookings
        </button>
      </div>

      {activeTab === 'history' ? (
        <BookingHistory />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gp-text-dim)]" />
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search stations by name"
                  className="gp-input rounded-full bg-white/[0.02] pl-9"
                />
              </div>
              <select
                value={chargerTypeFilter}
                onChange={(e) => setChargerTypeFilter(e.target.value)}
                aria-label="Filter by charger type"
                className="gp-select w-full sm:w-40"
              >
                <option value="ALL">All chargers</option>
                {chargerTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                aria-label="Sort stations"
                className="gp-select w-full sm:w-40"
              >
                <option value="name">Sort: Name</option>
                <option value="capacity">Sort: Capacity</option>
                <option value="price">Sort: Price</option>
              </select>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-gp-text-dim)]">
                <RefreshCw className="w-3 h-3" /> Station list updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}

            {error && (
              <div className="gp-card flex items-center gap-2 p-4 text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error instanceof Error ? error.message : 'Failed to load stations.'}
              </div>
            )}
            {isLoading && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse gp-card" />)}
              </div>
            )}

            {visibleStations.map((station) => {
              const isSelected = selectedStation === station.id;
              const baseRate = station.pricingRule?.basePrice;

              return (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => setSelectedStation(station.id)}
                  aria-pressed={isSelected}
                  className={`gp-card group flex w-full cursor-pointer items-center justify-between p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gp-cyan)] ${
                    isSelected ? 'border-[var(--color-gp-border-active)] bg-[var(--color-gp-card-hover)]' : ''
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[var(--color-gp-cyan)]">
                      {station.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center gap-1.5 text-[var(--color-gp-text-muted)]">
                        <Zap className="w-3.5 h-3.5 text-[var(--color-gp-cyan)]" /> {station.numChargers} × {station.chargerType}
                      </div>
                      <div className="text-[var(--color-gp-text-muted)]">
                        {station.maxCapacityKw} kW capacity
                      </div>
                      <div className="font-medium text-white">
                        {baseRate != null ? `${formatCurrency(baseRate)}` : 'Pricing unavailable'}
                        <span className="text-[var(--color-gp-text-dim)] text-xs font-normal"> base/kWh</span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isSelected ? 'bg-[var(--color-gp-cyan)]/10 text-[var(--color-gp-cyan)]' : 'bg-white/5 text-[var(--color-gp-text-dim)] group-hover:bg-white/10 group-hover:text-white'
                  }`}>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              );
            })}

            {!isLoading && !error && visibleStations.length === 0 && stations && stations.length > 0 && (
              <div className="gp-card border-dashed p-8 text-center text-[var(--color-gp-text-muted)]">
                No stations found matching your search.
              </div>
            )}

            {!isLoading && !error && stations && stations.length === 0 && (
              <div className="gp-card border-dashed p-8 text-center text-[var(--color-gp-text-muted)]">
                No stations are available on the network yet.
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

                <SlotPicker key={selectedStation} stationId={selectedStation} />
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
      )}
    </div>
  );
}
