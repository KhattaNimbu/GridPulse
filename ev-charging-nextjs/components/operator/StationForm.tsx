'use client';

import { useState } from 'react';

export default function StationForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      (e.target as HTMLFormElement).reset();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create station');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Add New Station</h2>
      
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input name="name" type="text" required className="w-full border rounded p-2" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Latitude</label>
          <input name="latitude" type="number" step="any" required className="w-full border rounded p-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Longitude</label>
          <input name="longitude" type="number" step="any" required className="w-full border rounded p-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Max Capacity (kW)</label>
        <input name="maxCapacityKw" type="number" min="1" step="any" required className="w-full border rounded p-2" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Number of Chargers</label>
          <input name="numChargers" type="number" min="1" required className="w-full border rounded p-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Charger Type</label>
          <select name="chargerType" required className="w-full border rounded p-2 bg-white">
            <option value="DC Fast">DC Fast</option>
            <option value="Level 2">Level 2</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Station'}
      </button>
    </form>
  );
}
