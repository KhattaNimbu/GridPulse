import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, requireSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateInitialSlots } from '@/lib/slots';
import { auditLog, errorAlert } from '@/lib/logger';

const stationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  maxCapacityKw: z.number().positive(),
  numChargers: z.number().int().positive(),
  chargerType: z.string().min(1, 'Charger type is required'),
});

export async function GET() {
  try {
    const session = await requireSession();
    // Operators only ever manage their own stations. Drivers browse the
    // full network to find a place to charge.
    const stations = await prisma.station.findMany({
      where: session.user.role === 'OPERATOR' ? { operatorId: session.user.id } : undefined,
      include: {
        pricingRule: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(stations);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch stations:', error);
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole('OPERATOR');
    const body = await request.json();
    const data = stationSchema.parse(body);

    const station = await prisma.station.create({
      data: {
        ...data,
        operatorId: session.user.id,
      },
    });

    // Generate slots for the new station asynchronously
    // In v1, we generate slots for the next 7 days upon creation
    generateInitialSlots(station.id, station.maxCapacityKw).catch(console.error);
    await auditLog('station_created', { operatorId: session.user.id, stationId: station.id })

    return NextResponse.json(station, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Failed to create station:', error);
    await errorAlert('station_create_failed', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'Failed to create station' }, { status: 500 });
  }
}
