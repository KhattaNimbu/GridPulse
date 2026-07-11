from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
DEFAULT_HISTORY_PATH = DATA_DIR / "charging_demand_history.csv"

for env_path in (BASE_DIR / ".env", BASE_DIR / ".env.local", ROOT_DIR / ".env", ROOT_DIR / ".env.local"):
    load_dotenv(env_path, override=False)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:change-me@localhost:5432/ev_management")
FORECAST_SERVICE_API_KEY = os.getenv("FORECAST_SERVICE_API_KEY", "")
MODEL_VERSION = "prophet-v1"
FORECAST_HOURS = 24
BUCKET_MINUTES = 30

