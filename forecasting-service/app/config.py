from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
DEFAULT_HISTORY_PATH = DATA_DIR / "charging_demand_history.csv"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:change-me@localhost:5432/ev_management")
FORECAST_SERVICE_API_KEY = os.getenv("FORECAST_SERVICE_API_KEY", "")
MODEL_VERSION = "prophet-v1"
FORECAST_HOURS = 24
BUCKET_MINUTES = 30

