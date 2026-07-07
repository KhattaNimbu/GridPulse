import prisma from '../lib/prisma';

const BASE_URL = process.env.CONCURRENCY_BASE_URL ?? 'http://localhost:3000';
const REQUESTS = 10;
const REQUESTED_KW = 50;
const STATION_NAME = 'Concurrency Test Station';

type BookingResponse = {
  id: string;
  requestedKw: number;
};

async function ensureStation() {
  let station = await prisma.station.findFirst({
    where: { name: STATION_NAME },
  });

  if (!station) {
    station = await prisma.station.create({
      data: {
        name: STATION_NAME,
        latitude: 12.9716,
        longitude: 77.5946,
        maxCapacityKw: 100,
        numChargers: 2,
        chargerType: 'DC Fast',
        operatorId: 'concurrency-test-operator',
      },
    });
  }

  const now = new Date();
  now.setSeconds(0, 0);
  const minute = now.getMinutes();
  const roundedMinute = minute < 30 ? 30 : 60;
  now.setMinutes(roundedMinute, 0, 0);
  const slotStart = new Date(now);
  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + 30);

  let slot = await prisma.slot.findFirst({
    where: {
      stationId: station.id,
      startTime: slotStart,
      endTime: slotEnd,
    },
  });

  if (!slot) {
    slot = await prisma.slot.create({
      data: {
        stationId: station.id,
        startTime: slotStart,
        endTime: slotEnd,
        capacityKw: 100,
        bookedKw: 0,
      },
    });
  }

  await prisma.booking.deleteMany({
    where: {
      stationId: station.id,
      slotStart,
      slotEnd,
    },
  });

  await prisma.slot.update({
    where: { id: slot.id },
    data: { bookedKw: 0 },
  });

  return { stationId: station.id, slotId: slot.id, slotStart, slotEnd };
}

async function run() {
  const { stationId, slotId, slotStart, slotEnd } = await ensureStation();

  console.log(`Testing ${REQUESTS} concurrent booking requests against ${BASE_URL}`);
  console.log(`Station: ${stationId}`);
  console.log(`Slot: ${slotStart.toISOString()} -> ${slotEnd.toISOString()}`);

  const responses = await Promise.all(
    Array.from({ length: REQUESTS }, (_, index) =>
      fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId,
          userId: `concurrency-driver-${index + 1}`,
          slotStart: slotStart.toISOString(),
          slotEnd: slotEnd.toISOString(),
          requestedKw: REQUESTED_KW,
        }),
      }).then(async (response) => {
        const payload = await response.json().catch(() => null);
        return {
          ok: response.ok,
          status: response.status,
          payload,
        };
      })
    )
  );

  const successes = responses.filter((result) => result.ok);
  const failures = responses.filter((result) => !result.ok);

  const finalSlot = await prisma.slot.findUnique({
    where: { id: slotId },
  });

  const finalBookings = await prisma.booking.findMany({
    where: {
      stationId,
      slotStart,
      slotEnd,
      status: 'CONFIRMED',
    },
  });

  console.table(
    responses.map((result, index) => ({
      request: index + 1,
      status: result.status,
      outcome: result.ok ? 'success' : 'failure',
      message: result.ok
        ? `booking ${(result.payload as BookingResponse)?.id ?? ''}`
        : result.payload?.error ?? 'unknown error',
    }))
  );

  if (successes.length !== 2) {
    throw new Error(`Expected 2 successful bookings, received ${successes.length}`);
  }

  if (failures.length !== 8) {
    throw new Error(`Expected 8 failed bookings, received ${failures.length}`);
  }

  if (!finalSlot) {
    throw new Error('Final slot not found');
  }

  if (finalSlot.bookedKw !== 100) {
    throw new Error(`Expected final bookedKw to be 100, received ${finalSlot.bookedKw}`);
  }

  if (finalBookings.length !== 2) {
    throw new Error(`Expected 2 confirmed bookings in the database, received ${finalBookings.length}`);
  }

  console.log('Concurrency test passed.');
  console.log(`Final bookedKw: ${finalSlot.bookedKw}`);
}

run()
  .catch((error) => {
    console.error('Concurrency test failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
