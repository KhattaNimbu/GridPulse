import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { fetchStationForecast } from '@/lib/forecastClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId');

  if (!stationId) {
    return NextResponse.json({ error: 'Missing stationId parameter' }, { status: 400 });
  }

  try {
    await requireRole('OPERATOR');
    const forecast = await fetchStationForecast(stationId);
    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Failed to fetch forecast:', error);
    return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 502 });
  }
}

