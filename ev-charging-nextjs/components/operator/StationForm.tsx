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
    <form onSubmit={handleSubmit} className="gp-card w-full p-6">
      <h2 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
        Add a new station
      </h2>
      <p className="mt-1 text-[14px] text-muted-gray">
        Creating a station also generates its bookable slots.
      </p>

      {error && <div className="gp-notice gp-notice-error mt-4">{error}</div>}
      {warning && <div className="gp-notice gp-notice-warning mt-4">{warning}</div>}

      <div className="mt-5 flex flex-col gap-4">
        <label className="block">
          <span className="gp-label">Name</span>
          <input name="name" type="text" required className="gp-input" placeholder="e.g. Downtown Hub" />
        </label>

        <div className="flex gap-4">
          <label className="flex-1">
            <span className="gp-label">Latitude</span>
            <input name="latitude" type="number" step="any" required className="gp-input" placeholder="37.7749" />
          </label>
          <label className="flex-1">
            <span className="gp-label">Longitude</span>
            <input name="longitude" type="number" step="any" required className="gp-input" placeholder="-122.4194" />
          </label>
        </div>

        <label className="block">
          <span className="gp-label">Max capacity (kW)</span>
          <input name="maxCapacityKw" type="number" min="1" step="any" required className="gp-input" placeholder="e.g. 500" />
        </label>

        <div className="flex gap-4">
          <label className="flex-1">
            <span className="gp-label">Number of chargers</span>
            <input name="numChargers" type="number" min="1" required className="gp-input" placeholder="4" />
          </label>
          <label className="flex-1">
            <span className="gp-label">Charger type</span>
            <select name="chargerType" required className="gp-select">
              <option value="DC Fast">DC Fast</option>
              <option value="Level 2">Level 2</option>
            </select>
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading} className="gp-btn-primary mt-6 w-full">
        {loading ? 'Creating station and generating slots…' : 'Create station'}
      </button>
    </form>
  );
}
