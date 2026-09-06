import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId');

  if (!stationId) {
    return NextResponse.json({ error: 'Missing stationId parameter' }, { status: 400 });
  }

  try {
    await requireSession();
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: { id: true },
    });
    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    const slots = await prisma.slot.findMany({
      where: {
        stationId,
        startTime: {
          gte: new Date(), // Only fetch future slots
        },
      },
      orderBy: { startTime: 'asc' },
      take: 48, // Limit to next 24 hours for the UI
    });
    return NextResponse.json(slots);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
