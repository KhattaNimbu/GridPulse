'use client';

import { useState } from 'react';
import { CURRENCY_SYMBOL } from '@/lib/currency';

type PricingRule = {
  basePrice: number;
  demandMultiplier: number;
};

type Props = {
  stationId: string;
  initialRule: PricingRule | null;
  onSuccess: () => void;
};

export default function PricingRuleForm({ stationId, initialRule, onSuccess }: Props) {
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
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-white/10">
      <h3 className="text-lg font-semibold text-slate-200">Pricing Settings</h3>
      <p className="mt-1 text-sm text-slate-400">Adjust off-peak base price and how strongly demand changes pricing.</p>

      {error && <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
      {message && <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">{message}</div>}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-300">Base Price ({CURRENCY_SYMBOL})</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={basePrice}
            onChange={(event) => setBasePrice(Number(event.target.value))}
            className="gp-input"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-300">Demand Multiplier</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={demandMultiplier}
            onChange={(event) => setDemandMultiplier(Number(event.target.value))}
            className="gp-input"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 gp-btn-secondary w-full sm:w-auto"
      >
        {loading ? 'Saving...' : 'Save Pricing'}
      </button>
    </form>
  );
}
