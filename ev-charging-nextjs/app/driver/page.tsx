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

  const tabClass = (tab: 'browse' | 'history') =>
    `-mb-px border-b-2 px-1 pb-3 text-[14px] font-medium transition-colors ${
      activeTab === tab
        ? 'border-ink-black text-ink-black'
        : 'border-transparent text-muted-gray hover:text-ink-black'
    }`;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="flex flex-col gap-4">
        <span className="gp-eyebrow">
          <span className="gp-eyebrow-dot" />
          Driver
        </span>
        <h1 className="max-w-3xl text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
          Find a slot. Charge worry-free.
        </h1>
        <p className="max-w-2xl text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
          Station availability and pricing are pulled live from the network.
        </p>
      </header>

      <div className="mt-10 flex gap-6 border-b border-mist-gray">
        <button type="button" onClick={() => setActiveTab('browse')} className={tabClass('browse')}>
          Browse stations
        </button>
        <button type="button" onClick={() => setActiveTab('history')} className={tabClass('history')}>
          My bookings
        </button>
      </div>

      <div className="mt-10">
        {activeTab === 'history' ? (
          <BookingHistory />
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-gray"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    placeholder="Search stations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search stations by name"
                    className="gp-input pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={chargerTypeFilter}
                    onChange={(e) => setChargerTypeFilter(e.target.value)}
                    aria-label="Filter by charger type"
                    className="gp-select"
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
                    className="gp-select"
                  >
                    <option value="name">Sort: Name</option>
                    <option value="capacity">Sort: Capacity</option>
                    <option value="price">Sort: Price</option>
                  </select>
                </div>
              </div>

              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-[13px] text-muted-gray">
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} /> Station list updated{' '}
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}

              {error && (
                <div className="gp-notice gp-notice-error flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  {error instanceof Error ? error.message : 'Failed to load stations.'}
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((i) => <div key={i} className="gp-skeleton h-28 animate-pulse" />)}
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
                    className={`gp-card gp-card-interactive group flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-green ${
                      isSelected ? 'gp-card-active' : ''
                    }`}
                  >
                    <span className="flex flex-col gap-2">
                      <span className="text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
                        {station.name}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-muted-gray">
                        <span className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-mint-green" strokeWidth={1.5} />
                          {station.numChargers} × {station.chargerType}
                        </span>
                        <span>{station.maxCapacityKw} kW capacity</span>
                        <span className="text-true-black">
                          <span className="font-medium">
                            {baseRate != null ? formatCurrency(baseRate) : 'Pricing unavailable'}
                          </span>
                          {baseRate != null && <span className="text-muted-gray"> base/kWh</span>}
                        </span>
                      </span>
                    </span>

                    <ArrowRight
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isSelected ? 'text-mint-green' : 'text-muted-gray group-hover:text-ink-black'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}

              {!isLoading && !error && visibleStations.length === 0 && stations && stations.length > 0 && (
                <div className="rounded-2xl border border-dashed border-cloud-gray p-8 text-center text-[14px] text-muted-gray">
                  No stations found matching your search.
                </div>
              )}

              {!isLoading && !error && stations && stations.length === 0 && (
                <div className="rounded-2xl border border-dashed border-cloud-gray p-8 text-center text-[14px] text-muted-gray">
                  No stations are available on the network yet.
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              {selectedStation ? (
                <div className="sticky top-24 flex flex-col gap-6">
                  <div className="gp-panel px-6 py-5">
                    <div className="gp-eyebrow">Selected station</div>
                    <h2 className="mt-1 text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">
                      {stations?.find((s) => s.id === selectedStation)?.name}
                    </h2>
                  </div>

                  <SlotPicker key={selectedStation} stationId={selectedStation} />
                </div>
              ) : (
                <div className="sticky top-24 flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-cloud-gray p-12 text-center">
                  <MapPin className="mb-4 h-8 w-8 text-muted-gray" strokeWidth={1.5} />
                  <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
                    Select a station
                  </h3>
                  <p className="mt-2 max-w-sm text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
                    Choose a station from the list to view live availability and book a slot.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
