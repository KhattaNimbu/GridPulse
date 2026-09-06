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

// Monochrome-plus-one-green: the booked-load series is the only chromatic
// element; the capacity ceiling is a dashed Ink Black rule.
const MINT_GREEN = '#0c8c5e';
const INK_BLACK = '#08090a';
const MUTED_GRAY = '#6b6f72';

export default function LoadCurveChart({ data }: Props) {
  return (
    <div className="gp-card p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
            Today&apos;s load curve
          </h3>
          <p className="mt-1 text-[14px] text-muted-gray">
            Watching booked kW against station capacity in 30-minute slices.
          </p>
        </div>
        <div className="text-[14px] text-muted-gray sm:text-right">
          <div>Peak booked: <span className="font-medium text-ink-black">{data.peakBookedKw.toFixed(1)} kW</span></div>
          <div>Capacity: <span className="font-medium text-ink-black">{data.station.maxCapacityKw.toFixed(1)} kW</span></div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.points} margin={{ top: 16, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="colorBookedKw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={MINT_GREEN} stopOpacity={0.12} />
                <stop offset="95%" stopColor={MINT_GREEN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f2" vertical={false} />
            <XAxis dataKey="label" minTickGap={18} stroke={MUTED_GRAY} tick={{ fill: MUTED_GRAY }} axisLine={false} tickLine={false} />
            <YAxis stroke={MUTED_GRAY} width={56} tick={{ fill: MUTED_GRAY }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#dddddd',
                color: '#000000',
                borderRadius: '4px',
                fontSize: '13px',
              }}
              itemStyle={{ color: MINT_GREEN }}
              labelStyle={{ color: INK_BLACK }}
              formatter={(value, name) => {
                const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                return [
                  `${numericValue.toFixed(1)} kW`,
                  name === 'bookedKw' ? 'Booked Load' : 'Capacity',
                ];
              }}
              labelFormatter={(label) => `Slot ${label}`}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
            <ReferenceLine
              y={data.station.maxCapacityKw}
              stroke={INK_BLACK}
              strokeDasharray="4 4"
              label={{ position: 'top', value: 'Max capacity', fill: INK_BLACK, fontSize: 13 }}
            />
            <Area
              type="monotone"
              dataKey="bookedKw"
              name="Booked Load"
              stroke={MINT_GREEN}
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
