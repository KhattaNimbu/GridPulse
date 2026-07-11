'use client';

import {
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
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
    <div className="gp-card p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100">Today&apos;s Load Curve</h3>
          <p className="text-sm text-slate-400 mt-1">
            Watching booked kW against station capacity in 30-minute slices.
          </p>
        </div>
        <div className="text-right text-sm text-slate-400">
          <div>Peak booked: <span className="font-semibold text-slate-200">{data.peakBookedKw.toFixed(1)} kW</span></div>
          <div>Capacity: <span className="font-semibold text-slate-200">{data.station.maxCapacityKw.toFixed(1)} kW</span></div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.points} margin={{ top: 16, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="colorBookedKw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" minTickGap={18} stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" width={56} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0a1628', borderColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '8px' }}
              itemStyle={{ color: '#22d3ee' }}
              formatter={(value, name) => {
                const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                return [
                  `${numericValue.toFixed(1)} kW`,
                  name === 'bookedKw' ? 'Booked Load' : 'Capacity',
                ];
              }}
              labelFormatter={(label) => `Slot ${label}`}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <ReferenceLine
              y={data.station.maxCapacityKw}
              stroke="#4ade80"
              strokeDasharray="4 4"
              label={{ position: 'top', value: 'Max Capacity', fill: '#4ade80', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="bookedKw"
              name="Booked Load"
              stroke="#22d3ee"
              fillOpacity={1}
              fill="url(#colorBookedKw)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
