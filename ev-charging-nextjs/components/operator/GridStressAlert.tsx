'use client';

import type { LoadCurveResponse } from '@/hooks/useLoadCurve';

type Props = {
  data: LoadCurveResponse;
  threshold?: number;
};

export default function GridStressAlert({ data, threshold = 0.85 }: Props) {
  const thresholdKw = data.station.maxCapacityKw * threshold;
  const stressedPoints = data.points.filter((point) => point.bookedKw >= thresholdKw);
  const peakRatio = data.station.maxCapacityKw > 0 ? data.peakBookedKw / data.station.maxCapacityKw : 0;

  if (stressedPoints.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
        <div className="font-semibold">Grid stress is under control</div>
        <p className="mt-1 text-sm">
          Peak load is at {(peakRatio * 100).toFixed(1)}% of station capacity, below the {(threshold * 100).toFixed(0)}% alert threshold.
        </p>
      </div>
    );
  }

  const firstStressPoint = stressedPoints[0];

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
      <div className="font-semibold">Grid stress alert</div>
      <p className="mt-1 text-sm">
        Load crosses {(threshold * 100).toFixed(0)}% at {firstStressPoint.label}. Peak is {data.peakBookedKw.toFixed(1)} kW
        against {data.station.maxCapacityKw.toFixed(1)} kW capacity.
      </p>
    </div>
  );
}

