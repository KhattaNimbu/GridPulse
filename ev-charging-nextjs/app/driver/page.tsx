'use client';

import { useState } from 'react';
import useSWR from 'swr';
import SlotPicker from '@/components/driver/SlotPicker';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Station = {
  id: string;
  name: string;
  numChargers: number;
  chargerType: string;
};

export default function DriverPage() {
  const { data: stations, error } = useSWR<Station[]>('/api/stations', fetcher);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">EV Driver Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Nearby Stations</h2>
            {error && <p className="text-red-500">Failed to load stations.</p>}
            {!stations && !error && <p>Loading...</p>}
            
            <div className="space-y-4">
              {stations?.map((station) => (
                <div 
                  key={station.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedStation === station.id ? 'border-blue-500 bg-blue-50' : 'bg-white hover:border-gray-400'}`}
                  onClick={() => setSelectedStation(station.id)}
                >
                  <h3 className="font-bold text-lg">{station.name}</h3>
                  <p className="text-sm text-gray-600">{station.numChargers} Chargers ({station.chargerType})</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            {selectedStation ? (
              <div className="bg-white p-6 border rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-2">Book a Charging Slot</h2>
                <p className="text-gray-600 mb-6">Select an available time slot below.</p>
                <SlotPicker stationId={selectedStation} />
              </div>
            ) : (
              <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500 border border-dashed border-gray-300">
                Select a station from the list to view availability and book a slot.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
