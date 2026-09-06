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
      <div className="gp-notice gp-notice-success">
        <div className="flex items-center gap-2 font-medium">
          <span className="gp-eyebrow-dot" />
          Grid stress is under control
        </div>
        <p className="mt-1 text-[14px]">
          Peak load is at {(peakRatio * 100).toFixed(1)}% of station capacity, below the{' '}
          {(threshold * 100).toFixed(0)}% alert threshold.
        </p>
      </div>
    );
  }

  const firstStressPoint = stressedPoints[0];

  return (
    <div className="gp-notice gp-notice-warning">
      <div className="flex items-center gap-2 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-signal-amber" />
        Grid stress alert
      </div>
      <p className="mt-1 text-[14px]">
        Load crosses {(threshold * 100).toFixed(0)}% at {firstStressPoint.label}. Peak is{' '}
        {data.peakBookedKw.toFixed(1)} kW against {data.station.maxCapacityKw.toFixed(1)} kW capacity.
      </p>
    </div>
  );
}
