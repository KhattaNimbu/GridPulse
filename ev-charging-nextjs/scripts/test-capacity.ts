import assert from 'node:assert/strict';

import { assertCapacityAvailable } from '../lib/capacity';

const slotStart = new Date('2026-07-05T10:00:00.000Z');

assert.doesNotThrow(() => {
  assertCapacityAvailable(
    [{ startTime: slotStart, bookedKw: 40, capacityKw: 100 }],
    100,
    50
  );
}, 'request within capacity should pass');

assert.throws(() => {
  assertCapacityAvailable(
    [{ startTime: slotStart, bookedKw: 70, capacityKw: 100 }],
    100,
    40
  );
}, /Capacity exceeded/, 'request above capacity should fail');

assert.throws(() => {
  assertCapacityAvailable(
    [{ startTime: slotStart, bookedKw: 70, capacityKw: 120 }],
    80,
    15
  );
}, /Available: 10kW/, 'station max capacity should cap slot capacity');

console.log('Capacity unit tests passed.');
