'use client';

import { useState } from 'react';

type PricingRule = {
  basePrice: number;
  demandMultiplier: number;
};

type Props = {
  stationId: string;
  stationName: string;
  initialRule: PricingRule | null;
  onSuccess: () => void;
};

export default function PricingRuleForm({ stationId, stationName, initialRule, onSuccess }: Props) {
  const [basePrice, setBasePrice] = useState(initialRule?.basePrice ?? 12);
  const [demandMultiplier, setDemandMultiplier] = useState(initialRule?.demandMultiplier ?? 0.5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId,
          basePrice,
          demandMultiplier,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save pricing rule');
      }

      setMessage('Pricing rule saved.');
      onSuccess();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save pricing rule');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{stationName}</h3>
      <p className="mt-1 text-sm text-gray-600">Adjust off-peak base price and how strongly demand changes pricing.</p>

      {error && <div className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</div>}
      {message && <div className="mt-3 rounded bg-green-100 p-2 text-sm text-green-700">{message}</div>}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Base Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={basePrice}
            onChange={(event) => setBasePrice(Number(event.target.value))}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Demand Multiplier</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={demandMultiplier}
            onChange={(event) => setDemandMultiplier(Number(event.target.value))}
            className="w-full rounded border p-2"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Pricing'}
      </button>
    </form>
  );
}

