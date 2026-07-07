from __future__ import annotations

from pathlib import Path
import json
import pickle

from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error

from .config import MODEL_VERSION, MODELS_DIR
from .dataset import load_history, prophet_training_frame, split_time_series, station_history


def model_path_for_station(station_id: str) -> Path:
    return MODELS_DIR / f"{station_id}.pkl"


def metrics_path_for_station(station_id: str) -> Path:
    return MODELS_DIR / f"{station_id}.metrics.json"


def train_station_model(station_id: str) -> dict:
    history = station_history(load_history(), station_id)
    series = prophet_training_frame(history)
    train_frame, test_frame = split_time_series(series)

    model = Prophet(daily_seasonality=True, weekly_seasonality=True)
    model.fit(train_frame)

    future = model.make_future_dataframe(periods=len(test_frame), freq="30min", include_history=False)
    forecast = model.predict(future)
    y_true = test_frame["y"].to_numpy()
    y_pred = forecast["yhat"].clip(lower=0).to_numpy()

    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(mean_squared_error(y_true, y_pred) ** 0.5)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with model_path_for_station(station_id).open("wb") as handle:
        pickle.dump(model, handle)

    metrics = {
        "stationId": station_id,
        "modelVersion": MODEL_VERSION,
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "trainPoints": len(train_frame),
        "testPoints": len(test_frame),
        "backtest": [
            {
                "time": ds.isoformat(),
                "actualKw": round(float(actual), 2),
                "predictedKw": round(float(predicted), 2),
            }
            for ds, actual, predicted in zip(test_frame["ds"], y_true, y_pred)
        ],
    }

    with metrics_path_for_station(station_id).open("w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2)

    return metrics


if __name__ == "__main__":
    from .database import fetch_stations

    for station in fetch_stations():
        result = train_station_model(station["id"])
        print(
            f"Trained {station['name']} ({station['id']}) "
            f"MAE={result['mae']:.3f} RMSE={result['rmse']:.3f}"
        )

