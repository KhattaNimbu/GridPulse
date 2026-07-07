const FORECAST_SERVICE_URL = process.env.FORECAST_SERVICE_URL ?? 'http://localhost:8001';
const FORECAST_SERVICE_API_KEY = process.env.FORECAST_SERVICE_API_KEY;

export type ForecastPoint = {
  time: string;
  predictedKw: number;
  predictedSessions: number;
};

export type ActualPoint = {
  time: string;
  actualKw: number;
  sessions: number;
};

export type ForecastMetrics = {
  stationId: string;
  modelVersion: string;
  mae: number;
  rmse: number;
  trainPoints: number;
  testPoints: number;
  backtest: Array<{
    time: string;
    actualKw: number;
    predictedKw: number;
  }>;
};

export type StationForecastResponse = {
  stationId: string;
  generatedAt: string;
  modelVersion: string;
  forecasts: ForecastPoint[];
  actuals: ActualPoint[];
  metrics: ForecastMetrics | null;
};

export async function fetchStationForecast(stationId: string): Promise<StationForecastResponse> {
  const headers: HeadersInit = {};
  if (FORECAST_SERVICE_API_KEY) {
    headers['X-API-Key'] = FORECAST_SERVICE_API_KEY;
  }

  const response = await fetch(`${FORECAST_SERVICE_URL}/forecast/${stationId}`, {
    cache: 'no-store',
    headers,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Failed to fetch station forecast');
  }

  return response.json();
}

