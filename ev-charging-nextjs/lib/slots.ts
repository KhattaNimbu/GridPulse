import prisma from './prisma'

export async function generateInitialSlots(stationId: string, maxCapacityKw: number) {
  const slotsToCreate = [];
  const now = new Date();
  
  // Start from the top of the next 30-minute window
  const startTime = new Date(now);
  const minutes = startTime.getMinutes();
  const remainder = minutes % 30;
  startTime.setMinutes(minutes + (30 - remainder));
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);

  // Generate 7 days of 30-minute slots
  // 7 days * 24 hours * 2 slots/hour = 336 slots
  const totalSlots = 7 * 24 * 2;

  let currentSlotStart = new Date(startTime);

  for (let i = 0; i < totalSlots; i++) {
    const currentSlotEnd = new Date(currentSlotStart);
    currentSlotEnd.setMinutes(currentSlotEnd.getMinutes() + 30);

    slotsToCreate.push({
      stationId,
      startTime: new Date(currentSlotStart),
      endTime: new Date(currentSlotEnd),
      capacityKw: maxCapacityKw,
      bookedKw: 0,
    });

    currentSlotStart = currentSlotEnd;
  }

  // Bulk insert using Prisma
  await prisma.slot.createMany({
    data: slotsToCreate,
  });

  return slotsToCreate.length;
}
