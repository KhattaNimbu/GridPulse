'use client';

import { useState } from 'react';
import { useSlots } from '@/hooks/useSlots';

export default function SlotPicker({ stationId }: { stationId: string }) {
  const { slots, error, mutate } = useSlots(stationId);

  const [requestedKw, setRequestedKw] = useState(50);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  if (error) return <div className="text-red-500">Failed to load slots</div>;
  if (!slots) return <div>Loading availability...</div>;

  const handleBook = async (slotStart: string, slotEnd: string) => {
    setBookingError('');
    setBookingSuccess('');
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId,
          slotStart,
          slotEnd,
          requestedKw,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book');
      }

      setBookingSuccess('Booking confirmed!');
      mutate(); // Optimistically refresh slots
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book');
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Requested Load (kW)</label>
        <input 
          type="number" 
          value={requestedKw} 
          onChange={(e) => setRequestedKw(Number(e.target.value))}
          min="1"
          className="border p-2 rounded"
        />
      </div>

      {bookingError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{bookingError}</div>}
      {bookingSuccess && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{bookingSuccess}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const availableKw = slot.capacityKw - slot.bookedKw;
          const isFull = availableKw < requestedKw;
          
          return (
            <div 
              key={slot.id} 
              className={`p-3 border rounded text-sm ${isFull ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-white hover:border-blue-500 cursor-pointer'}`}
              onClick={() => !isFull && handleBook(slot.startTime, slot.endTime)}
            >
              <div className="font-bold">
                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-gray-600 mt-1">
                Avail: {availableKw}kW
              </div>
              <div className="mt-1 text-gray-600">
                Price: {slot.price !== null ? `${slot.price.toFixed(2)} / kWh` : '...'}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Forecast load: {slot.predictedKw !== null ? `${slot.predictedKw.toFixed(1)}kW` : 'Pending'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
