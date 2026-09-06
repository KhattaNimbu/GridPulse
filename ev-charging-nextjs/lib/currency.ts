// Single source of truth for the app's currency. Every price shown to a
// driver or operator, and every stored priceCharged, is in this unit.
export const CURRENCY_SYMBOL = '₹';

export function formatCurrency(value: number): string {
  return `${CURRENCY_SYMBOL}${value.toFixed(2)}`;
}
