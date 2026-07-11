'use client';

import { useState } from 'react';
import { useSlots } from '@/hooks/useSlots';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type StationSummary = {
  id: string;
  name: string;
};

export default function SlotPicker({ stationId }: { stationId: string }) {
  const { slots, error, mutate } = useSlots(stationId);
  const { data: stations } = useSWR<StationSummary[]>('/api/stations', fetcher);
  const stationName = stations?.find((s) => s.id === stationId)?.name || 'Station';

  const [requestedKw, setRequestedKw] = useState(48);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  if (error) return <div className="p-4 text-red-400">Failed to load slots</div>;
  if (!slots) {
    return (
      <div className="mt-6 flex flex-col gap-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="h-20 animate-pulse gp-card" />)}
        </div>
      </div>
    );
  }

  const selectedSlot = selectedSlotIndex !== null ? slots[selectedSlotIndex] : null;
  const rate = selectedSlot?.price ?? 0;
  const estEnergy = requestedKw * 0.5;
  const totalPrice = rate * estEnergy;

  const handleBook = async () => {
    if (!selectedSlot) return;

    setBookingError('');
    setBookingSuccess('');
    setIsBooking(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId,
          slotStart: selectedSlot.startTime,
          slotEnd: selectedSlot.endTime,
          requestedKw,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book');
      }

      setBookingSuccess('Booking confirmed!');
      setSelectedSlotIndex(null);
      mutate();
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Pick a slot · Today</h3>
          <div className="flex items-center gap-1.5 text-sm text-[var(--color-gp-text-muted)]">
            <Clock className="w-4 h-4" /> 30-min buckets
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {slots.slice(0, 8).map((slot, index) => {
            const availableKw = slot.capacityKw - slot.bookedKw;
            const isFull = availableKw < requestedKw;
            const loadPct = Math.round((slot.bookedKw / slot.capacityKw) * 100);
            const loadColor = loadPct > 80 ? 'bg-red-500' : loadPct > 50 ? 'bg-amber-500' : 'bg-[var(--color-gp-green)]';
            const loadTextColor = loadPct > 80 ? 'text-red-400' : loadPct > 50 ? 'text-amber-400' : 'text-[var(--color-gp-green)]';
            const isSelected = selectedSlotIndex === index;
            const timeString = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const slotRate = slot.price ?? 0;
            const slotTotal = slotRate * (requestedKw * 0.5);

            return (
              <div
                key={slot.id}
                onClick={() => !isFull && setSelectedSlotIndex(index)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isFull
                    ? 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50'
                    : isSelected
                      ? 'border-[var(--color-gp-border-active)] bg-[var(--color-gp-card-hover)] shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'border-[var(--color-gp-border)] bg-[var(--color-gp-card)] hover:border-white/20'
                }`}
              >
                <div className={`mb-1 text-lg font-bold ${isSelected ? 'text-white' : 'text-[var(--color-gp-text-muted)]'}`}>
                  {timeString}
                </div>
                <div className="flex flex-col gap-1 text-sm font-medium">
                  <div className={`flex items-center gap-1.5 ${loadTextColor}`}>
                    <span className={`h-2 w-2 rounded-full ${loadColor}`} /> {loadPct}%
                  </div>
                  <div className="text-[var(--color-gp-cyan)]">${slotTotal.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="gp-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-gp-text-dim)]">Booking Summary</h3>
            <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--color-gp-text-muted)]">
              Live capacity checked
            </div>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gp-cyan)]/10">
              <CheckCircle2 className="h-6 w-6 text-[var(--color-gp-cyan)]" />
            </div>
            <div>
              <div className="text-xl font-semibold text-white">{stationName}</div>
              <div className="text-sm text-[var(--color-gp-text-muted)]">Transparent pricing and instant confirmation</div>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-[var(--color-gp-text-dim)]">Station</span>
              <span className="font-medium text-white">{stationName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-[var(--color-gp-text-dim)]">Slot</span>
              <span className="font-medium text-white">
                {selectedSlot ? `${new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} · 30 min` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-[var(--color-gp-text-dim)]">Rate</span>
              <span className="font-medium text-white">{selectedSlot ? `$${rate.toFixed(2)}/kWh` : '—'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-[var(--color-gp-text-dim)]">Est. energy</span>
              <span className="font-medium text-white">{estEnergy} kWh</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[var(--color-gp-text-dim)]">Total</span>
              <span className="text-2xl font-bold text-[var(--color-gp-cyan)]">${selectedSlot ? totalPrice.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gp-text-dim)]">
              Requested load
            </label>
            <input
              type="number"
              value={requestedKw}
              onChange={(event) => setRequestedKw(Number(event.target.value))}
              min="1"
              className="gp-input"
            />
          </div>

          <button
            onClick={handleBook}
            disabled={!selectedSlot || isBooking}
            className="gp-btn-primary mt-8 flex w-full items-center justify-center gap-2 py-3 text-base"
          >
            <CheckCircle2 className="w-5 h-5" />
            {isBooking ? 'Confirming...' : 'Confirm booking'}
          </button>

          <p className="mx-auto mt-6 max-w-sm text-center text-xs leading-relaxed text-[var(--color-gp-text-dim)]">
            Capacity is checked at booking time. Slots that would overload the grid are hidden.
          </p>
        </div>

        <div className="space-y-4">
          {bookingError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              <AlertCircle className="w-5 h-5" /> {bookingError}
            </div>
          )}

          {bookingSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-gp-green)]/20 bg-[var(--color-gp-green)]/10 p-3 text-[var(--color-gp-green)]">
              <CheckCircle2 className="w-5 h-5" /> {bookingSuccess}
            </div>
          )}

          <div className="gp-card p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gp-text-dim)]">Driver promise</div>
            <div className="mt-3 text-xl font-semibold text-white">No ghost availability</div>
            <p className="mt-2 text-sm leading-7 text-[var(--color-gp-text-muted)]">
              Availability, forecast load, and booking confirmation stay aligned with the actual grid-safe capacity model.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className="text-sm text-[var(--color-gp-text-dim)]">Operator? <a href="/operator" className="text-[var(--color-gp-cyan)] hover:underline">Open control room →</a></span>
      </div>
    </div>
  );
}
