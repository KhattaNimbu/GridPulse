from __future__ import annotations

from pathlib import Path
import math

import pandas as pd

from .config import DEFAULT_HISTORY_PATH
from .synthetic import generate_synthetic_history


def load_history(history_path: Path | None = None) -> pd.DataFrame:
    path = history_path or DEFAULT_HISTORY_PATH
    if not path.exists():
        return generate_synthetic_history()

    frame = pd.read_csv(path, parse_dates=["ds"])
    if "ds" in frame.columns:
        frame["ds"] = pd.to_datetime(frame["ds"]).dt.tz_localize(None)
    frame = frame.sort_values(["station_id", "ds"]).reset_index(drop=True)
    return frame


def station_history(frame: pd.DataFrame, station_id: str) -> pd.DataFrame:
    station_frame = frame.loc[frame["station_id"] == station_id].copy()
    if station_frame.empty:
        regenerated_frame = generate_synthetic_history()
        station_frame = regenerated_frame.loc[regenerated_frame["station_id"] == station_id].copy()

    if station_frame.empty:
        raise ValueError(f"No history found for station {station_id}")
    return station_frame


def prophet_training_frame(frame: pd.DataFrame) -> pd.DataFrame:
    return frame.loc[:, ["ds", "y"]].copy()


def split_time_series(frame: pd.DataFrame, test_points: int = 48) -> tuple[pd.DataFrame, pd.DataFrame]:
    if len(frame) <= test_points + 10:
        raise ValueError("Not enough rows to create a reliable time-based split")

    train = frame.iloc[:-test_points].copy()
    test = frame.iloc[-test_points:].copy()
    return train, test


def average_kw_per_session(frame: pd.DataFrame) -> float:
    sessions = frame["sessions"].replace(0, pd.NA).dropna()
    if sessions.empty:
        return 10.0

    ratios = frame.loc[sessions.index, "y"] / sessions
    mean_ratio = float(ratios.mean())
    return mean_ratio if math.isfinite(mean_ratio) and mean_ratio > 0 else 10.0


def latest_actuals(frame: pd.DataFrame, count: int = 48) -> list[dict]:
    recent = frame.sort_values("ds").tail(count)
    return [
        {
            "time": row.ds.isoformat(),
            "actualKw": round(float(row.y), 2),
            "sessions": int(row.sessions),
        }
        for row in recent.itertuples(index=False)
    ]
