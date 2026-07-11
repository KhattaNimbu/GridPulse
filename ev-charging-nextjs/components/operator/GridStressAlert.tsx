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
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 shadow-sm">
        <div className="font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block"></span>
          Grid stress is under control
        </div>
        <p className="mt-1 text-sm text-emerald-500/80">
          Peak load is at {(peakRatio * 100).toFixed(1)}% of station capacity, below the {(threshold * 100).toFixed(0)}% alert threshold.
        </p>
      </div>
    );
  }

  const firstStressPoint = stressedPoints[0];

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-400 shadow-sm">
      <div className="font-semibold flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
        Grid stress alert
      </div>
      <p className="mt-1 text-sm text-amber-500/80">
        Load crosses {(threshold * 100).toFixed(0)}% at {firstStressPoint.label}. Peak is {data.peakBookedKw.toFixed(1)} kW
        against {data.station.maxCapacityKw.toFixed(1)} kW capacity.
      </p>
    </div>
  );
}
