'use client';

import useSWR from 'swr';

export type LoadCurvePoint = {
  id: string;
  time: string;
  label: string;
  bookedKw: number;
  capacityKw: number;
};

export type LoadCurveResponse = {
  station: {
    id: string;
    name: string;
    maxCapacityKw: number;
  };
  updatedAt: string;
  peakBookedKw: number;
  points: LoadCurvePoint[];
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch load curve');
  }
  return response.json() as Promise<LoadCurveResponse>;
};

export function useLoadCurve(stationId: string | null, refreshInterval = 5000) {
  const key = stationId ? `/api/load-curve?stationId=${stationId}` : null;
  const { data, error, mutate, isLoading } = useSWR<LoadCurveResponse>(key, fetcher, {
    refreshInterval,
  });

  return {
    data,
    error,
    mutate,
    isLoading,
  };
}

