import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkCapacityAndBook, BookingError } from '@/lib/capacity';
import { fetchStationForecast } from '@/lib/forecastClient';
import { auditLog, errorAlert } from '@/lib/logger';

const bookingSchema = z.object({
  stationId: z.string(),
  slotStart: z.string().transform((str) => new Date(str)),
  slotEnd: z.string().transform((str) => new Date(str)),
  requestedKw: z.number().positive(),
});

async function resolvePredictedLoadRatioByTime(stationId: string) {
  try {
    const [station, forecast] = await Promise.all([
      prisma.station.findUnique({ where: { id: stationId }, select: { maxCapacityKw: true } }),
      fetchStationForecast(stationId),
    ]);

    if (!station || station.maxCapacityKw <= 0) {
      return new Map<string, number>();
    }

    return new Map(
      forecast.forecasts.map((point) => [
        new Date(point.time).toISOString(),
        point.predictedKw / station.maxCapacityKw,
      ])
    );
  } catch {
    // Forecasting service unavailable — the booking still proceeds and
    // falls back to the slot's real observed occupancy for pricing.
    return new Map<string, number>();
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const data = bookingSchema.parse(body);

    if (Number.isNaN(data.slotStart.getTime()) || Number.isNaN(data.slotEnd.getTime()) || data.slotEnd <= data.slotStart) {
      return NextResponse.json(
        { error: 'Invalid slot time range', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const predictedLoadRatioByTime = await resolvePredictedLoadRatioByTime(data.stationId);

    const booking = await checkCapacityAndBook(
      data.stationId,
      session.user.id,
      data.slotStart,
      data.slotEnd,
      data.requestedKw,
      predictedLoadRatioByTime
    );
    await auditLog('booking_created', { userId: session.user.id, stationId: data.stationId, bookingId: booking.id })
    return NextResponse.json(booking, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues, code: 'VALIDATION_ERROR' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error('Booking failed:', error);
    await errorAlert('booking_failed', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to book slot', code: 'BOOKING_FAILED' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const session = await requireSession();
    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { station: true },
      orderBy: { slotStart: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
