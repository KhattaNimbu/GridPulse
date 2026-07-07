type StationRecord = {
  id: string;
  name: string;
  maxCapacityKw: number;
};

type SlotRecord = {
  id: string;
  startTime: Date;
  endTime: Date;
  bookedKw: number;
  capacityKw: number;
};

type LoadCurveDb = {
  station: {
    findUnique(args: {
      where: { id: string };
      select: { id: true; name: true; maxCapacityKw: true };
    }): Promise<StationRecord | null>;
  };
  slot: {
    findMany(args: {
      where: {
        stationId: string;
        startTime: { gte: Date; lte: Date };
      };
      orderBy: { startTime: 'asc' };
      select: {
        id: true;
        startTime: true;
        endTime: true;
        bookedKw: true;
        capacityKw: true;
      };
    }): Promise<SlotRecord[]>;
  };
};

export function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export async function buildLoadCurveResponse(db: LoadCurveDb, stationId: string, now = new Date()) {
  const station = await db.station.findUnique({
    where: { id: stationId },
    select: {
      id: true,
      name: true,
      maxCapacityKw: true,
    },
  });

  if (!station) {
    return null;
  }

  const slots = await db.slot.findMany({
    where: {
      stationId,
      startTime: {
        gte: startOfDay(now),
        lte: endOfDay(now),
      },
    },
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      bookedKw: true,
      capacityKw: true,
    },
  });

  const peakBookedKw = slots.reduce((max, slot) => Math.max(max, slot.bookedKw), 0);

  return {
    station,
    updatedAt: now.toISOString(),
    peakBookedKw,
    points: slots.map((slot) => ({
      id: slot.id,
      time: slot.startTime.toISOString(),
      label: slot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bookedKw: slot.bookedKw,
      capacityKw: slot.capacityKw,
    })),
  };
}
