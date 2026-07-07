import assert from 'node:assert/strict';

import { buildLoadCurveResponse } from '../lib/loadCurve';

async function run() {
  const now = new Date('2026-07-05T09:15:00.000Z');

  const response = await buildLoadCurveResponse(
    {
      station: {
        async findUnique() {
          return {
            id: 'station-1',
            name: 'Demo Station',
            maxCapacityKw: 100,
          };
        },
      },
      slot: {
        async findMany() {
          return [
            {
              id: 'slot-1',
              startTime: new Date('2026-07-05T09:00:00.000Z'),
              endTime: new Date('2026-07-05T09:30:00.000Z'),
              bookedKw: 60,
              capacityKw: 100,
            },
            {
              id: 'slot-2',
              startTime: new Date('2026-07-05T09:30:00.000Z'),
              endTime: new Date('2026-07-05T10:00:00.000Z'),
              bookedKw: 85,
              capacityKw: 100,
            },
          ];
        },
      },
    },
    'station-1',
    now
  );

  assert.ok(response, 'station response should exist');
  assert.equal(response.station.name, 'Demo Station');
  assert.equal(response.points.length, 2);
  assert.equal(response.peakBookedKw, 85);
  assert.equal(response.updatedAt, now.toISOString());
  assert.match(response.points[0].label, /\d{2}:\d{2}/);

  console.log('Load curve API integration test passed.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
