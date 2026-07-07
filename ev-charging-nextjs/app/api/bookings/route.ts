import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkCapacityAndBook } from '@/lib/capacity';
import { auditLog, errorAlert } from '@/lib/logger';

const bookingSchema = z.object({
  stationId: z.string(),
  slotStart: z.string().transform((str) => new Date(str)),
  slotEnd: z.string().transform((str) => new Date(str)),
  requestedKw: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const data = bookingSchema.parse(body);

    const booking = await checkCapacityAndBook(
      data.stationId,
      session.user.id,
      data.slotStart,
      data.slotEnd,
      data.requestedKw
    );
    await auditLog('booking_created', { userId: session.user.id, stationId: data.stationId, bookingId: booking.id })
    return NextResponse.json(booking, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Booking failed:', error);
    await errorAlert('booking_failed', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to book slot' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
