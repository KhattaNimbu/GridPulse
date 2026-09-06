'use client';

import useSWR from 'swr';
import { CalendarClock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Failed to load bookings');
  }
  return response.json();
};

type Booking = {
  id: string;
  stationId: string;
  station: { name: string };
  slotStart: string;
  slotEnd: string;
  requestedKw: number;
  priceCharged: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
};

// Tags stay square (4px) and monochrome; only the live/complete states earn
// the Mint Green accent, and only cancellations reach for the signal red.
const statusStyles: Record<Booking['status'], string> = {
  CONFIRMED: 'border-mint-green/30 text-mint-green',
  COMPLETED: 'border-mist-gray text-muted-gray',
  CANCELLED: 'border-signal-red/25 text-signal-red',
};

export default function BookingHistory() {
  const { data: bookings, error } = useSWR<Booking[]>('/api/bookings', fetcher, { refreshInterval: 15000 });

  if (error) {
    return (
      <div className="gp-notice gp-notice-error flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        {error instanceof Error ? error.message : 'Failed to load bookings'}
      </div>
    );
  }

  if (!bookings) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="gp-skeleton h-20 animate-pulse" />)}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-cloud-gray p-12 text-center">
        <CalendarClock className="h-8 w-8 text-muted-gray" strokeWidth={1.5} />
        <p className="text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
          You haven&apos;t booked a slot yet. Select a station to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="gp-card flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[16px] font-medium tracking-[-0.16px] text-ink-black">
                {booking.station.name}
              </h4>
              <span className={`gp-tag ${statusStyles[booking.status]}`}>{booking.status}</span>
            </div>
            <p className="mt-1 text-[14px] text-muted-gray">
              {new Date(booking.slotStart).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} ·{' '}
              {booking.requestedKw} kW
            </p>
          </div>
          <div className="sm:text-right">
            <div className="text-[20px] font-semibold tracking-[-0.2px] text-ink-black">
              {formatCurrency(booking.priceCharged)}
            </div>
            <div className="font-mono text-[13px] text-muted-gray">{booking.id}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
