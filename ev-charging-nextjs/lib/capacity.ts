import { Prisma } from '@prisma/client';
import prisma from './prisma';

const MAX_SERIALIZATION_RETRIES = 3;

export type CapacitySlot = {
  startTime: Date;
  bookedKw: number;
  capacityKw: number;
};

export function assertCapacityAvailable(
  slots: CapacitySlot[],
  stationMaxCapacityKw: number,
  requestedKw: number
) {
  for (const slot of slots) {
    const slotCapacity = Math.min(slot.capacityKw, stationMaxCapacityKw);
    if (slot.bookedKw + requestedKw > slotCapacity) {
      throw new Error(
        `Capacity exceeded for slot starting at ${slot.startTime.toISOString()}. ` +
          `Available: ${slotCapacity - slot.bookedKw}kW, Requested: ${requestedKw}kW`
      );
    }
  }
}

export async function checkCapacityAndBook(
  stationId: string,
  userId: string,
  slotStart: Date,
  slotEnd: Date,
  requestedKw: number
) {
  for (let attempt = 1; attempt <= MAX_SERIALIZATION_RETRIES; attempt += 1) {
    try {
      // Lock overlapping slot rows inside a serializable transaction so
      // simultaneous requests cannot both pass the capacity check.
      return await prisma.$transaction(async (tx) => {
        const station = await tx.station.findUnique({
          where: { id: stationId },
        });

        if (!station) {
          throw new Error('Station not found');
        }

        const overlappingSlots = await tx.slot.findMany({
          where: {
            stationId,
            startTime: { lt: slotEnd },
            endTime: { gt: slotStart },
          },
          orderBy: { startTime: 'asc' },
        });

        if (overlappingSlots.length === 0) {
          throw new Error('No valid slots found for the requested time period');
        }

        await tx.$queryRaw`
          SELECT id
          FROM "Slot"
          WHERE "stationId" = ${stationId}
            AND "startTime" < ${slotEnd}
            AND "endTime" > ${slotStart}
          ORDER BY "startTime" ASC
          FOR UPDATE
        `;

        const lockedSlots = await tx.slot.findMany({
          where: {
            id: {
              in: overlappingSlots.map((slot) => slot.id),
            },
          },
          orderBy: { startTime: 'asc' },
        });

        assertCapacityAvailable(lockedSlots, station.maxCapacityKw, requestedKw);

        await Promise.all(
          lockedSlots.map((slot) =>
            tx.slot.update({
              where: { id: slot.id },
              data: { bookedKw: { increment: requestedKw } },
            })
          )
        );

        return tx.booking.create({
          data: {
            userId,
            stationId,
            slotStart,
            slotEnd,
            requestedKw,
            priceCharged: 0,
            status: 'CONFIRMED',
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034' &&
        attempt < MAX_SERIALIZATION_RETRIES
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error('Booking failed after retrying transaction conflicts');
}
