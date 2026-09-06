import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { buildLoadCurveResponse } from '@/lib/loadCurve';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId');

  if (!stationId) {
    return NextResponse.json({ error: 'Missing stationId parameter' }, { status: 400 });
  }

  try {
    const session = await requireRole('OPERATOR');
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: { operatorId: true },
    });
    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }
    if (station.operatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await buildLoadCurveResponse(prisma, stationId, new Date());
    if (!response) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }
    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Failed to load curve:', error);
    return NextResponse.json({ error: 'Failed to load curve' }, { status: 500 });
  }
}
