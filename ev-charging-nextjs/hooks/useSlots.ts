'use client';

import useSWR from 'swr';

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  capacityKw: number;
  bookedKw: number;
};

type PricingPoint = {
  time: string;
  predictedKw: number;
  predictedLoadRatio: number;
  price: number;
  rule: {
    basePrice: number;
    demandMultiplier: number;
  };
};

export type DriverSlot = Slot & {
  price: number | null;
  predictedKw: number | null;
  predictedLoadRatio: number | null;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
};

export function useSlots(stationId: string | null, onUpdate?: () => void) {
  const slotsKey = stationId ? `/api/slots?stationId=${stationId}` : null;
  const pricingKey = stationId ? `/api/pricing?stationId=${stationId}` : null;

  const {
    data: slots,
    error: slotsError,
    mutate,
  } = useSWR<Slot[]>(slotsKey, fetcher, { refreshInterval: 5000, onSuccess: onUpdate });
  const { data: pricing, error: pricingError } = useSWR<{ prices: PricingPoint[] }>(
    pricingKey,
    fetcher,
    { refreshInterval: 5000 }
  );

  const pricingMap = new Map(
    pricing?.prices.map((entry) => [
      new Date(entry.time).toISOString(),
      entry,
    ]) ?? []
  );

  const mergedSlots: DriverSlot[] | undefined = slots?.map((slot) => {
    const pricePoint = pricingMap.get(new Date(slot.startTime).toISOString());
    return {
      ...slot,
      price: pricePoint?.price ?? null,
      predictedKw: pricePoint?.predictedKw ?? null,
      predictedLoadRatio: pricePoint?.predictedLoadRatio ?? null,
    };
  });

  return {
    slots: mergedSlots,
    error: slotsError ?? pricingError,
    mutate,
  };
}

