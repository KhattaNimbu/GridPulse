from fastapi import FastAPI, HTTPException, Request

from .config import FORECAST_SERVICE_API_KEY
from .dataset import latest_actuals, load_history, station_history
from .predict import generate_forecast

app = FastAPI(title="EV Forecasting Service")

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/forecast/{station_id}")
def get_station_forecast(station_id: str, request: Request):
    if FORECAST_SERVICE_API_KEY and request.headers.get("x-api-key") != FORECAST_SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        forecast = generate_forecast(station_id)
        history = station_history(load_history(), station_id)
        return {
            **forecast,
            "actuals": latest_actuals(history),
        }
    except FileNotFoundError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
