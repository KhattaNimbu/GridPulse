from __future__ import annotations

from .database import fetch_stations
from .predict import generate_forecast
from .train import train_station_model


def retrain_and_refresh_all() -> list[dict]:
    summaries = []
    for station in fetch_stations():
        metrics = train_station_model(station["id"])
        forecast = generate_forecast(station["id"])
        summaries.append(
            {
                "stationId": station["id"],
                "stationName": station["name"],
                "mae": metrics["mae"],
                "rmse": metrics["rmse"],
                "forecastPoints": len(forecast["forecasts"]),
            }
        )
    return summaries


if __name__ == "__main__":
    for summary in retrain_and_refresh_all():
        print(summary)

