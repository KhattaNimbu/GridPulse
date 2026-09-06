import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, requireSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { fetchStationForecast } from '@/lib/forecastClient';
import { computePrice } from '@/lib/pricing';
import { auditLog } from '@/lib/logger';

const pricingRuleSchema = z.object({
  stationId: z.string(),
  basePrice: z.number().nonnegative(),
  demandMultiplier: z.number().nonnegative(),
});

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
      include: { pricingRule: true },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    const rule = station.pricingRule ?? { basePrice: 12, demandMultiplier: 0.5 };
    const forecast = await fetchStationForecast(stationId);

    const prices = forecast.forecasts.map((point) => {
      const predictedLoadRatio =
        station.maxCapacityKw > 0 ? point.predictedKw / station.maxCapacityKw : 0;

      return {
        time: point.time,
        predictedKw: point.predictedKw,
        predictedSessions: point.predictedSessions,
        predictedLoadRatio: Number(predictedLoadRatio.toFixed(4)),
        price: computePrice({
          basePrice: rule.basePrice,
          demandMultiplier: rule.demandMultiplier,
          predictedLoadRatio,
        }),
        rule,
      };
    });

    return NextResponse.json({
      stationId,
      rule,
      prices,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to compute pricing:', error);
    return NextResponse.json({ error: 'Failed to compute pricing' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole('OPERATOR');
    const body = await request.json();
    const data = pricingRuleSchema.parse(body);

    const station = await prisma.station.findUnique({
      where: { id: data.stationId },
      select: { operatorId: true },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    if (station.operatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pricingRule = await prisma.pricingRule.upsert({
      where: { stationId: data.stationId },
      update: {
        basePrice: data.basePrice,
        demandMultiplier: data.demandMultiplier,
      },
      create: data,
    });

    await auditLog('pricing_rule_updated', { stationId: data.stationId, operatorId: session.user.id })

    return NextResponse.json(pricingRule);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('Failed to save pricing rule:', error);
    return NextResponse.json({ error: 'Failed to save pricing rule' }, { status: 500 });
  }
}
