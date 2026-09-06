'use client';

import { useState } from 'react';

export default function StationForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWarning('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      latitude: parseFloat(formData.get('latitude') as string),
      longitude: parseFloat(formData.get('longitude') as string),
      maxCapacityKw: parseFloat(formData.get('maxCapacityKw') as string),
      numChargers: parseInt(formData.get('numChargers') as string, 10),
      chargerType: formData.get('chargerType') as string,
    };

    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to create station');
      }

      if (payload?.slotsGenerated === false) {
        setWarning('Station created, but bookable slots could not be generated. Contact support or try recreating the station.');
      }

      (e.target as HTMLFormElement).reset();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create station');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full p-6 gp-card">
      <h2 className="text-xl font-bold mb-4 text-slate-100">Add New Station</h2>
      
      {error && <div className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</div>}
      {warning && <div className="text-amber-400 text-sm mb-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">{warning}</div>}

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Name</label>
        <input name="name" type="text" required className="gp-input" placeholder="e.g. Downtown Hub" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-300">Latitude</label>
          <input name="latitude" type="number" step="any" required className="gp-input" placeholder="37.7749" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-300">Longitude</label>
          <input name="longitude" type="number" step="any" required className="gp-input" placeholder="-122.4194" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Max Capacity (kW)</label>
        <input name="maxCapacityKw" type="number" min="1" step="any" required className="gp-input" placeholder="e.g. 500" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-300">Number of Chargers</label>
          <input name="numChargers" type="number" min="1" required className="gp-input" placeholder="4" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-300">Charger Type</label>
          <select name="chargerType" required className="gp-select">
            <option value="DC Fast" className="bg-[#0a1628]">DC Fast</option>
            <option value="Level 2" className="bg-[#0a1628]">Level 2</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full gp-btn-primary"
        >
          {loading ? 'Creating station and generating slots…' : 'Create Station'}
        </button>
      </div>
    </form>
  );
}
