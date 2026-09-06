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
      <div className="gp-notice gp-notice-error flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} /> Failed to load slots for this station. Try again shortly.
      </div>
    );
  }

  if (!slots) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="gp-skeleton h-5 w-32 animate-pulse" />
          <div className="gp-skeleton h-4 w-24 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="gp-skeleton h-20 animate-pulse" />)}
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
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
            Pick a slot · Today
          </h3>
          <div className="flex items-center gap-4 text-[13px] text-muted-gray">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> 30-min buckets
            </span>
            {lastUpdated && (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} /> Updated{' '}
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cloud-gray p-8 text-center text-[14px] text-muted-gray">
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
                  className={`rounded-md border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-green ${
                    isDisabled
                      ? 'cursor-not-allowed border-mist-gray bg-mist-gray text-muted-gray'
                      : isSelected
                        ? 'cursor-pointer border-mint-green bg-mint-green/6'
                        : 'cursor-pointer border-cloud-gray bg-paper-white hover:bg-mist-gray'
                  }`}
                >
                  <div
                    className={`text-[16px] font-medium tracking-[-0.16px] ${
                      isDisabled ? 'text-muted-gray' : isSelected ? 'text-mint-green' : 'text-ink-black'
                    }`}
                  >
                    {timeString}
                  </div>
                  <div className="mt-1 flex flex-col gap-0.5 text-[13px]">
                    {isExpired ? (
                      <span className="text-muted-gray">Expired</span>
                    ) : isFull ? (
                      <span className="text-signal-red">Full</span>
                    ) : (
                      <span className="text-muted-gray">{loadPct}% booked</span>
                    )}
                    <span className={isDisabled ? 'text-muted-gray' : 'text-true-black'}>
                      {slotTotal !== null ? formatCurrency(slotTotal) : 'Pricing unavailable'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="gp-card p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className="gp-eyebrow">Booking summary</h3>
            <span className="gp-tag">Live capacity checked</span>
          </div>

          <div className="mb-6">
            <div className="text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
              {stationName}
            </div>
            <div className="mt-1 text-[14px] text-muted-gray">
              Transparent pricing and instant confirmation.
            </div>
          </div>

          <dl className="flex flex-col gap-3 text-[14px]">
            {[
              ['Station', stationName],
              [
                'Slot',
                selectedSlot
                  ? `${new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} · 30 min`
                  : '—',
              ],
              ['Est. rate', selectedSlot && rate ? `${formatCurrency(rate)}/kWh` : '—'],
              ['Est. energy', `${estEnergy} kWh`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-mist-gray pb-3">
                <dt className="text-muted-gray">{label}</dt>
                <dd className="font-medium text-ink-black">{value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 pt-1">
              <dt className="text-muted-gray">Estimated total</dt>
              <dd className="text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">
                {selectedSlot ? formatCurrency(totalPrice) : formatCurrency(0)}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[13px] text-muted-gray">
            This is an estimate. The server recalculates the final price at booking time.
          </p>

          <div className="mt-6">
            <label htmlFor="requested-kw" className="gp-label">
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
            className="gp-btn-primary mt-6 w-full"
          >
            {isBooking ? 'Confirming…' : 'Confirm booking'}
          </button>

          <p className="mt-4 text-center text-[13px] text-muted-gray">
            Capacity is checked at booking time. Slots that would overload the grid are hidden.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {bookingError && (
            <div className="gp-notice gp-notice-error flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} /> {bookingError}
            </div>
          )}

          {confirmedBooking && (
            <div className="gp-card p-6">
              <div className="flex items-center gap-2 text-mint-green">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-[14px] font-medium">Booking confirmed</span>
              </div>
              <dl className="mt-4 flex flex-col gap-2 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-gray">Booking ID</dt>
                  <dd className="truncate font-mono text-[13px] text-ink-black">{confirmedBooking.id}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-gray">Slot</dt>
                  <dd className="text-ink-black">
                    {new Date(confirmedBooking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-gray">Requested load</dt>
                  <dd className="text-ink-black">{confirmedBooking.requestedKw} kW</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-gray">Final price</dt>
                  <dd className="font-medium text-ink-black">{formatCurrency(confirmedBooking.priceCharged)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-gray">Status</dt>
                  <dd className="text-ink-black">{confirmedBooking.status}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="gp-feature-card">
            <span className="gp-eyebrow">Driver promise</span>
            <div className="mt-2 text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
              No ghost availability
            </div>
            <p className="mt-2 text-[16px] leading-[1.5] tracking-[-0.16px] text-true-black">
              Availability, forecast load, and booking confirmation stay aligned with the actual grid-safe
              capacity model.
            </p>
          </div>

          <p className="text-[14px] text-muted-gray">
            Operator? <a href="/operator" className="gp-link">Open the control room →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
