import {
  GridpointsForecastJson,
  PointsJson,
  StateCode,
  StationsGeoJson,
  ZonesForecastJson,
} from "@/lib/types/nws";

const nwsApiBaseUrl = "https://api.weather.gov";

// The NWS API is a bit flaky so we'll retry a few times with exponential backoff
const fetchWithExponentialBackoff = async (
  url: string,
  retries = 3,
  backoffMs = 1000
): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) {
    if (retries > 0) {
      console.log("Retrying fetch...");
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      return fetchWithExponentialBackoff(url, retries - 1, backoffMs * 2);
    } else {
      throw new Error(`Error fetching ${url}: ${response.statusText}`);
    }
  }
  return response;
};

// e.g: https://api.weather.gov/stations?state=AL&limit=500
const getStations = async (stateCode: StateCode, limit?: number) => {
  const _limit = limit || 500;
  let maxCalls = 10; // Limit to 5000 stations
  let stations: StationsGeoJson | null = null;
  const url = `${nwsApiBaseUrl}/stations?state=${stateCode}&limit=${_limit}`;
  const response = await fetchWithExponentialBackoff(url);
  stations = (await response.json()) as StationsGeoJson;

  let nextUrl = stations.pagination?.next;
  // Keep fetching more stations as long as there is a nextUrl
  while (nextUrl && maxCalls > 0) {
    const response = await fetchWithExponentialBackoff(nextUrl);
    const moreStations = (await response.json()) as StationsGeoJson;
    stations.features = stations.features.concat(moreStations.features);
    nextUrl = moreStations.pagination?.next;
    maxCalls--;
  }
  return stations;
};

// e.g: https://api.weather.gov/zones/ObservationStation/ALZ261/forecast
const getZoneForecast = async (zoneId: string) => {
  const url = `${nwsApiBaseUrl}/zones/ObservationStation/${zoneId}/forecast`;
  const response = await fetchWithExponentialBackoff(url);
  const forecast = (await response.json()) as ZonesForecastJson;
  return forecast;
};

// e.g: https://api.weather.gov/points/33.4808,-86.7199
const getPoints = async (lat: number, lon: number) => {
  const url = `${nwsApiBaseUrl}/points/${lat},${lon}`;
  const response = await fetchWithExponentialBackoff(url);
  const points = (await response.json()) as PointsJson;
  return points;
};

// e.g: https://api.weather.gov/gridpoints/MOB/53,87/forecast/hourly
// Note that this is a bit of a weird one since we just pass the url in directly
// We could compose it from the getPoints data result but... eh...
// They just give us the URL in that response so we'll just use it directly
const getGridpointsForecastHourly = async (url: string) => {
  const response = await fetchWithExponentialBackoff(url);
  const forecast = (await response.json()) as GridpointsForecastJson;
  return forecast;
};

// e.g: https://api.weather.gov/gridpoints/MOB/53,87/forecast
const getGridpointsForecastDaily = async (url: string) => {
  const response = await fetchWithExponentialBackoff(url);
  const forecast = (await response.json()) as GridpointsForecastJson;
  return forecast;
};

export default {
  getStations,
  getZoneForecast,
  getPoints,
  getGridpointsForecastHourly,
  getGridpointsForecastDaily,
} as const;
