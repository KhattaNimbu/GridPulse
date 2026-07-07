from __future__ import annotations

from datetime import datetime, timedelta, timezone
import math
import random

import pandas as pd

from .config import DATA_DIR, DEFAULT_HISTORY_PATH
from .database import fetch_stations


def station_baseline(max_capacity_kw: float) -> float:
    return max(20.0, max_capacity_kw * 0.35)


def generate_synthetic_history() -> pd.DataFrame:
    stations = fetch_stations()
    if not stations:
        raise RuntimeError("No stations found. Seed or create stations before generating synthetic demand history.")

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    start = datetime.now(timezone.utc) - timedelta(days=28)
    periods = 28 * 48
    rows = []

    for station_index, station in enumerate(stations):
        baseline = station_baseline(float(station["maxCapacityKw"]))
        random.seed(f"{station['id']}-{station_index}")

        for step in range(periods):
            current = start + timedelta(minutes=30 * step)
            hour_fraction = current.hour + current.minute / 60
            daytime_wave = math.sin(((hour_fraction - 7) / 24) * math.pi * 2)
            evening_peak = math.exp(-((hour_fraction - 19) ** 2) / 10)
            commute_peak = math.exp(-((hour_fraction - 8) ** 2) / 7)
            weekend_boost = 1.12 if current.weekday() >= 5 else 1.0
            noise = random.uniform(-0.08, 0.08)

            kw = baseline * (
                0.55
                + 0.18 * max(daytime_wave, -0.2)
                + 0.35 * evening_peak
                + 0.22 * commute_peak
                + noise
            ) * weekend_boost
            kw = max(0.0, min(float(station["maxCapacityKw"]) * 0.96, kw))
            sessions = max(0, round(kw / 18))

            rows.append(
                {
                    "station_id": station["id"],
                    "station_name": station["name"],
                    "ds": current,
                    "y": round(kw, 3),
                    "sessions": sessions,
                }
            )

    frame = pd.DataFrame(rows)
    frame.to_csv(DEFAULT_HISTORY_PATH, index=False)
    return frame
