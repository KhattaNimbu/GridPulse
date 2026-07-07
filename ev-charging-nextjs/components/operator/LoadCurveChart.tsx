'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LoadCurveResponse } from '@/hooks/useLoadCurve';

type Props = {
  data: LoadCurveResponse;
};

export default function LoadCurveChart({ data }: Props) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Load Curve</h3>
          <p className="text-sm text-gray-600">
            Watching booked kW against station capacity in 30-minute slices.
          </p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>Peak booked: {data.peakBookedKw.toFixed(1)} kW</div>
          <div>Capacity: {data.station.maxCapacityKw.toFixed(1)} kW</div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.points} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" minTickGap={18} stroke="#6b7280" />
            <YAxis stroke="#6b7280" width={56} />
            <Tooltip
              formatter={(value, name) => {
                const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                return [
                  `${numericValue.toFixed(1)} kW`,
                  name === 'bookedKw' ? 'Booked Load' : 'Capacity',
                ];
              }}
              labelFormatter={(label) => `Slot ${label}`}
            />
            <Legend />
            <ReferenceLine
              y={data.station.maxCapacityKw}
              stroke="#f97316"
              strokeDasharray="4 4"
              label="Max Capacity"
            />
            <Line
              type="monotone"
              dataKey="bookedKw"
              name="Booked Load"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="capacityKw"
              name="Capacity"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
