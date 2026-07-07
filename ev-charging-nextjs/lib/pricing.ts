export type ComputePriceInput = {
  basePrice: number;
  demandMultiplier: number;
  predictedLoadRatio: number;
};

export function computePrice(input: ComputePriceInput): number {
  const safeRatio = Math.max(0, input.predictedLoadRatio);
  const multiplier = Math.max(0, input.demandMultiplier);
  const price = input.basePrice * (1 + multiplier * safeRatio);
  return Number(price.toFixed(2));
}

