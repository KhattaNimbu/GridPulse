from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import pickle
import uuid

from .config import FORECAST_HOURS, MODEL_VERSION
from .database import replace_forecasts
from .dataset import average_kw_per_session, load_history, station_history
from .train import metrics_path_for_station, model_path_for_station, train_station_model


def ensure_model(station_id: str):
    model_path = model_path_for_station(station_id)
    if not model_path.exists():
        train_station_model(station_id)

    with model_path.open("rb") as handle:
        return pickle.load(handle)


def load_metrics(station_id: str) -> dict | None:
    metrics_path = metrics_path_for_station(station_id)
    if not metrics_path.exists():
        return None

    with metrics_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def generate_forecast(station_id: str, horizon_hours: int = FORECAST_HOURS) -> dict:
    history = station_history(load_history(), station_id)
    avg_kw_session = average_kw_per_session(history)
    model = ensure_model(station_id)
    periods = int(horizon_hours * 60 / 30)

    future = model.make_future_dataframe(periods=periods, freq="30min", include_history=False)
    forecast = model.predict(future)
    generated_at = datetime.now(timezone.utc)

    rows = []
    api_rows = []
    for forecast_row in forecast[["ds", "yhat"]].itertuples(index=False):
        predicted_kw = max(0.0, float(forecast_row.yhat))
        predicted_sessions = max(0, round(predicted_kw / avg_kw_session))
        record = {
            "id": str(uuid.uuid4()),
            "stationId": station_id,
            "forecastTime": forecast_row.ds.to_pydatetime(),
            "predictedKw": predicted_kw,
            "predictedSessions": predicted_sessions,
            "modelVersion": MODEL_VERSION,
            "generatedAt": generated_at,
        }
        rows.append(record)
        api_rows.append(
            {
                "time": forecast_row.ds.isoformat(),
                "predictedKw": round(predicted_kw, 2),
                "predictedSessions": predicted_sessions,
            }
        )

    replace_forecasts(station_id, rows)

    return {
        "stationId": station_id,
        "generatedAt": generated_at.isoformat(),
        "modelVersion": MODEL_VERSION,
        "metrics": load_metrics(station_id),
        "forecasts": api_rows,
    }

