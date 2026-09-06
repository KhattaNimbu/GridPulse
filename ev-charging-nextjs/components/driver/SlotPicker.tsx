'use client';

import { useState } from 'react';
import { useSlots } from '@/hooks/useSlots';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import useSWR from 'swr';
import { formatCurrency } from '@/lib/currency';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type StationSummary = {
  id: string;
  name: string;
};

type ConfirmedBooking = {
  id: string;
  stationId: string;
  slotStart: string;
  slotEnd: string;
  requestedKw: number;
  priceCharged: number;
  status: string;
};

export default function SlotPicker({ stationId }: { stationId: string }) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { slots, error, mutate } = useSlots(stationId, () => setLastUpdated(new Date()));
  const { data: stations } = useSWR<StationSummary[]>('/api/stations', fetcher);
  const stationName = stations?.find((s) => s.id === stationId)?.name || 'Station';

  const [requestedKw, setRequestedKw] = useState(48);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  if (error) {
    return (
      <div className="gp-card flex items-center gap-2 p-4 text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" /> Failed to load slots for this station. Try again shortly.
      </div>
    );
  }

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

  // Use the last successful fetch time rather than a live clock read during
  // render, so the expiry check stays a pure function of component state.
  const now = lastUpdated?.getTime() ?? 0;
  const selectedSlot = selectedSlotIndex !== null ? slots[selectedSlotIndex] : null;
  const rate = selectedSlot?.price ?? 0;
  const estEnergy = requestedKw * 0.5;
  const totalPrice = rate * estEnergy;

  const handleBook = async () => {
    if (!selectedSlot) return;

    setBookingError('');
    setConfirmedBooking(null);
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
        // Capacity conflicts and expired slots mean the picker is showing
        // stale availability — refresh it so the driver sees current state.
        if (data.code === 'CAPACITY_EXCEEDED' || data.code === 'SLOT_EXPIRED' || data.code === 'BOOKING_CONFLICT') {
          mutate();
        }
        throw new Error(data.error || 'Failed to book slot');
      }

      setConfirmedBooking(data as ConfirmedBooking);
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-white">Pick a slot · Today</h3>
          <div className="flex items-center gap-3 text-sm text-[var(--color-gp-text-muted)]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 30-min buckets
            </span>
            {lastUpdated && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-gp-text-dim)]">
                <RefreshCw className="w-3.5 h-3.5" /> Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="gp-card border-dashed p-8 text-center text-sm text-[var(--color-gp-text-muted)]">
            No bookable slots are available for this station right now.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {slots.slice(0, 8).map((slot, index) => {
              const availableKw = slot.capacityKw - slot.bookedKw;
              const isExpired = new Date(slot.startTime).getTime() <= now;
              const isFull = availableKw < requestedKw;
              const isDisabled = isFull || isExpired;
              const loadPct = slot.capacityKw > 0 ? Math.round((slot.bookedKw / slot.capacityKw) * 100) : 0;
              const loadColor = loadPct > 80 ? 'bg-red-500' : loadPct > 50 ? 'bg-amber-500' : 'bg-[var(--color-gp-green)]';
              const loadTextColor = loadPct > 80 ? 'text-red-400' : loadPct > 50 ? 'text-amber-400' : 'text-[var(--color-gp-green)]';
              const isSelected = selectedSlotIndex === index;
              const timeString = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
              const slotRate = slot.price ?? null;
              const slotTotal = slotRate !== null ? slotRate * (requestedKw * 0.5) : null;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedSlotIndex(index)}
                  aria-pressed={isSelected}
                  aria-label={`${timeString} slot, ${isExpired ? 'expired' : isFull ? 'full' : `${loadPct}% booked`}${slotTotal !== null ? `, estimated ${formatCurrency(slotTotal)}` : ''}`}
                  className={`rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gp-cyan)] ${
                    isDisabled
                      ? 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50'
                      : isSelected
                        ? 'cursor-pointer border-[var(--color-gp-border-active)] bg-[var(--color-gp-card-hover)] shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                        : 'cursor-pointer border-[var(--color-gp-border)] bg-[var(--color-gp-card)] hover:border-white/20'
                  }`}
                >
                  <div className={`mb-1 text-lg font-bold ${isSelected ? 'text-white' : 'text-[var(--color-gp-text-muted)]'}`}>
                    {timeString}
                  </div>
                  <div className="flex flex-col gap-1 text-sm font-medium">
                    {isExpired ? (
                      <div className="text-[var(--color-gp-text-dim)]">Expired</div>
                    ) : isFull ? (
                      <div className="text-red-400">Full</div>
                    ) : (
                      <div className={`flex items-center gap-1.5 ${loadTextColor}`}>
                        <span className={`h-2 w-2 rounded-full ${loadColor}`} /> {loadPct}% booked
                      </div>
                    )}
                    <div className="text-[var(--color-gp-cyan)]">
                      {slotTotal !== null ? formatCurrency(slotTotal) : 'Pricing unavailable'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
              <span className="text-[var(--color-gp-text-dim)]">Est. rate</span>
              <span className="font-medium text-white">{selectedSlot && rate ? `${formatCurrency(rate)}/kWh` : '—'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-[var(--color-gp-text-dim)]">Est. energy</span>
              <span className="font-medium text-white">{estEnergy} kWh</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[var(--color-gp-text-dim)]">Estimated total</span>
              <span className="text-2xl font-bold text-[var(--color-gp-cyan)]">{selectedSlot ? formatCurrency(totalPrice) : formatCurrency(0)}</span>
            </div>
            <p className="text-xs text-[var(--color-gp-text-dim)]">
              This is an estimate. The server recalculates the final price at booking time.
            </p>
          </div>

          <div className="mt-8">
            <label htmlFor="requested-kw" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gp-text-dim)]">
              Requested load (kW)
            </label>
            <input
              id="requested-kw"
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
              <AlertCircle className="w-5 h-5 shrink-0" /> {bookingError}
            </div>
          )}

          {confirmedBooking && (
            <div className="gp-card border-[var(--color-gp-green)]/25 p-5">
              <div className="flex items-center gap-2 text-[var(--color-gp-green)]">
                <CheckCircle2 className="w-5 h-5" /> <span className="font-semibold">Booking confirmed</span>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-gp-text-dim)]">Booking ID</dt>
                  <dd className="truncate font-mono text-xs text-white">{confirmedBooking.id}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-gp-text-dim)]">Slot</dt>
                  <dd className="text-white">
                    {new Date(confirmedBooking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-gp-text-dim)]">Requested load</dt>
                  <dd className="text-white">{confirmedBooking.requestedKw} kW</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-gp-text-dim)]">Final price</dt>
                  <dd className="font-semibold text-[var(--color-gp-green)]">{formatCurrency(confirmedBooking.priceCharged)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-gp-text-dim)]">Status</dt>
                  <dd className="text-white">{confirmedBooking.status}</dd>
                </div>
              </dl>
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
