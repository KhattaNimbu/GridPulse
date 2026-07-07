import assert from 'node:assert/strict';

import { computePrice } from '../lib/pricing';

assert.equal(
  computePrice({ basePrice: 12, demandMultiplier: 0.5, predictedLoadRatio: 0 }),
  12,
  'zero demand should keep the base price'
);

assert.equal(
  computePrice({ basePrice: 12, demandMultiplier: 0.5, predictedLoadRatio: 1 }),
  18,
  'full capacity demand should apply the full multiplier'
);

assert.equal(
  computePrice({ basePrice: 12, demandMultiplier: 0, predictedLoadRatio: 0.8 }),
  12,
  'zero multiplier should ignore demand'
);

assert.equal(
  computePrice({ basePrice: 12, demandMultiplier: 0.5, predictedLoadRatio: -1 }),
  12,
  'negative load ratio should clamp to zero'
);

console.log('Pricing unit tests passed.');

