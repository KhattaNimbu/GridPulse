const FORECAST_SERVICE_URL = process.env.FORECAST_SERVICE_URL ?? 'http://localhost:8001';
const FORECAST_SERVICE_API_KEY = process.env.FORECAST_SERVICE_API_KEY;
const FORECAST_CACHE_TTL_MS = 60_000;

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

const forecastCache = new Map<string, { expiresAt: number; response: StationForecastResponse }>();
const forecastRequests = new Map<string, Promise<StationForecastResponse>>();

export async function fetchStationForecast(stationId: string): Promise<StationForecastResponse> {
  const cached = forecastCache.get(stationId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.response;
  }

  const existingRequest = forecastRequests.get(stationId);
  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
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

    const forecast = (await response.json()) as StationForecastResponse;
    forecastCache.set(stationId, {
      expiresAt: Date.now() + FORECAST_CACHE_TTL_MS,
      response: forecast,
    });
    return forecast;
  })();
  forecastRequests.set(stationId, request);

  try {
    return await request;
  } finally {
    forecastRequests.delete(stationId);
  }
}
