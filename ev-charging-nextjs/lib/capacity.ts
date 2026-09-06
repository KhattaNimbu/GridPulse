import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { computePrice } from './pricing';

const MAX_SERIALIZATION_RETRIES = 3;
const DEFAULT_PRICING_RULE = { basePrice: 12, demandMultiplier: 0.5 };

export class BookingError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'BookingError';
    this.code = code;
    this.status = status;
  }
}

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
      throw new BookingError(
        'CAPACITY_EXCEEDED',
        `Capacity exceeded for slot starting at ${slot.startTime.toISOString()}. ` +
          `Available: ${slotCapacity - slot.bookedKw}kW, Requested: ${requestedKw}kW`,
        409
      );
    }
  }
}

/**
 * predictedLoadRatioByTime is resolved once, outside the transaction, from
 * the forecasting service (or left empty if it is unavailable) so the DB
 * transaction never holds a lock open across an external HTTP call.
 */
export async function checkCapacityAndBook(
  stationId: string,
  userId: string,
  slotStart: Date,
  slotEnd: Date,
  requestedKw: number,
  predictedLoadRatioByTime: Map<string, number>
) {
  for (let attempt = 1; attempt <= MAX_SERIALIZATION_RETRIES; attempt += 1) {
    try {
      // Lock the target slot row inside a serializable transaction so
      // simultaneous requests cannot both pass the capacity check, and
      // revalidate every fact the client supplied against the database.
      return await prisma.$transaction(async (tx) => {
        const station = await tx.station.findUnique({
          where: { id: stationId },
        });

        if (!station) {
          throw new BookingError('STATION_NOT_FOUND', 'Station not found', 404);
        }

        const slot = await tx.slot.findFirst({
          where: { stationId, startTime: slotStart, endTime: slotEnd },
        });

        if (!slot) {
          throw new BookingError(
            'SLOT_NOT_FOUND',
            'The requested slot does not match any bookable window for this station',
            404
          );
        }

        if (slot.startTime.getTime() <= Date.now()) {
          throw new BookingError('SLOT_EXPIRED', 'This slot has already started or passed', 409);
        }

        if (requestedKw > station.maxCapacityKw) {
          throw new BookingError(
            'VALIDATION_ERROR',
            `Requested load of ${requestedKw}kW exceeds station capacity of ${station.maxCapacityKw}kW`,
            400
          );
        }

        await tx.$queryRaw`
          SELECT id FROM "Slot" WHERE id = ${slot.id} FOR UPDATE
        `;

        const lockedSlot = await tx.slot.findUnique({ where: { id: slot.id } });
        if (!lockedSlot) {
          throw new BookingError('SLOT_NOT_FOUND', 'The requested slot no longer exists', 404);
        }

        assertCapacityAvailable([lockedSlot], station.maxCapacityKw, requestedKw);

        const pricingRule = await tx.pricingRule.findUnique({ where: { stationId } });
        const rule = pricingRule ?? DEFAULT_PRICING_RULE;
        const slotCapacity = Math.min(lockedSlot.capacityKw, station.maxCapacityKw);

        // Prefer the forecasted demand ratio; fall back to the slot's actual
        // observed occupancy (still a real, server-known value) if the
        // forecasting service was unavailable when the caller resolved it.
        const predictedLoadRatio =
          predictedLoadRatioByTime.get(lockedSlot.startTime.toISOString()) ??
          (slotCapacity > 0 ? lockedSlot.bookedKw / slotCapacity : 0);

        const pricePerKwh = computePrice({
          basePrice: rule.basePrice,
          demandMultiplier: rule.demandMultiplier,
          predictedLoadRatio,
        });

        const slotDurationHours =
          (lockedSlot.endTime.getTime() - lockedSlot.startTime.getTime()) / (60 * 60 * 1000);
        const priceCharged = Number((pricePerKwh * requestedKw * slotDurationHours).toFixed(2));

        await tx.slot.update({
          where: { id: lockedSlot.id },
          data: { bookedKw: { increment: requestedKw } },
        });

        return tx.booking.create({
          data: {
            userId,
            stationId,
            slotStart,
            slotEnd,
            requestedKw,
            priceCharged,
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

  throw new BookingError(
    'BOOKING_CONFLICT',
    'Booking failed after retrying transaction conflicts',
    409
  );
}
