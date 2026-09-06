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

const statusStyles: Record<Booking['status'], string> = {
  CONFIRMED: 'text-[var(--color-gp-cyan)] border-[var(--color-gp-cyan)]/25 bg-[var(--color-gp-cyan)]/10',
  COMPLETED: 'text-[var(--color-gp-green)] border-[var(--color-gp-green)]/25 bg-[var(--color-gp-green)]/10',
  CANCELLED: 'text-red-400 border-red-500/25 bg-red-500/10',
};

export default function BookingHistory() {
  const { data: bookings, error } = useSWR<Booking[]>('/api/bookings', fetcher, { refreshInterval: 15000 });

  if (error) {
    return (
      <div className="gp-card flex items-center gap-2 p-4 text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" /> {error instanceof Error ? error.message : 'Failed to load bookings'}
      </div>
    );
  }

  if (!bookings) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse gp-card" />)}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="gp-card flex flex-col items-center gap-3 border-dashed p-10 text-center">
        <CalendarClock className="h-8 w-8 text-[var(--color-gp-text-dim)]" />
        <p className="text-[var(--color-gp-text-muted)]">You haven&apos;t booked a slot yet. Select a station to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => (
        <div key={booking.id} className="gp-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{booking.station.name}</h4>
              <span className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider ${statusStyles[booking.status]}`}>
                {booking.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-gp-text-muted)]">
              {new Date(booking.slotStart).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} · {booking.requestedKw} kW
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{formatCurrency(booking.priceCharged)}</div>
            <div className="font-mono text-xs text-[var(--color-gp-text-dim)]">{booking.id}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
