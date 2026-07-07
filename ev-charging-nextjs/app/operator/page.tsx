'use client';

import { useState } from 'react';
import useSWR from 'swr';
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Operator Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <StationForm onSuccess={() => mutate()} />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6 grid gap-4">
              {loadCurveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Failed to load the live dashboard for the selected station.
                </div>
              )}
              {loadCurve && <GridStressAlert data={loadCurve} />}
              {loadCurve ? (
                <LoadCurveChart data={loadCurve} />
              ) : (
                <div className="rounded-lg border bg-white p-6 text-sm text-gray-500 shadow-sm">
                  Select or create a station to start watching live load.
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold mb-4 text-gray-900">Your Stations</h2>
            {error && <p className="text-red-500">Failed to load stations.</p>}
            {!stations && !error && <p>Loading...</p>}
            
            <div className="grid gap-4">
              {stations?.map((station) => (
                <div
                  key={station.id}
                  className={`grid gap-4 rounded-lg border bg-white p-4 shadow-sm transition-colors ${
                    activeStationId === station.id ? 'border-blue-400 ring-2 ring-blue-100' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-lg text-blue-600">{station.name}</h3>
                      <button
                        type="button"
                        onClick={() => setSelectedStationId(station.id)}
                        className="rounded border px-3 py-1 text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600"
                      >
                        Watch Live
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mt-2 grid grid-cols-2 gap-2">
                      <p>Capacity: <span className="font-medium text-gray-900">{station.maxCapacityKw} kW</span></p>
                      <p>Chargers: <span className="font-medium text-gray-900">{station.numChargers} ({station.chargerType})</span></p>
                      <p>Lat: {station.latitude.toFixed(4)}</p>
                      <p>Lng: {station.longitude.toFixed(4)}</p>
                    </div>
                  </div>

                  <PricingRuleForm
                    stationId={station.id}
                    stationName={station.name}
                    initialRule={station.pricingRule}
                    onSuccess={() => mutate()}
                  />
                </div>
              ))}
              
              {stations?.length === 0 && (
                <p className="text-gray-500 italic">No stations found. Create one to get started.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
