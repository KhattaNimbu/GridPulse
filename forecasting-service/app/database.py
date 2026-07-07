from __future__ import annotations

from sqlalchemy import create_engine, text

from .config import DATABASE_URL

engine = create_engine(DATABASE_URL, future=True)


def fetch_stations() -> list[dict]:
    with engine.begin() as connection:
        rows = connection.execute(
            text(
                """
                SELECT id, name, "maxCapacityKw"
                FROM "Station"
                ORDER BY name ASC
                """
            )
        )
        return [dict(row._mapping) for row in rows]


def replace_forecasts(
    station_id: str,
    forecast_rows: list[dict],
) -> None:
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                DELETE FROM "DemandForecast"
                WHERE "stationId" = :station_id
                  AND "forecastTime" >= NOW()
                """
            ),
            {"station_id": station_id},
        )

        if not forecast_rows:
            return

        connection.execute(
            text(
                """
                INSERT INTO "DemandForecast" (
                    id,
                    "stationId",
                    "forecastTime",
                    "predictedKw",
                    "predictedSessions",
                    "modelVersion",
                    "generatedAt"
                ) VALUES (
                    :id,
                    :stationId,
                    :forecastTime,
                    :predictedKw,
                    :predictedSessions,
                    :modelVersion,
                    :generatedAt
                )
                """
            ),
            forecast_rows,
        )


def fetch_latest_forecasts(station_id: str) -> list[dict]:
    with engine.begin() as connection:
        rows = connection.execute(
            text(
                """
                SELECT id, "stationId", "forecastTime", "predictedKw", "predictedSessions", "modelVersion", "generatedAt"
                FROM "DemandForecast"
                WHERE "stationId" = :station_id
                ORDER BY "forecastTime" ASC
                """
            ),
            {"station_id": station_id},
        )
        return [dict(row._mapping) for row in rows]
