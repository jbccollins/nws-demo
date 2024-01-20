import {
  GridpointsForecastJson,
  PointsJson,
  StateCode,
  StationsGeoJson,
  ZonesForecastJson,
} from "@/lib/types/nws";
import { RoughUsaPolygon } from "@/constants/roughUsaPolygon";
// @ts-expect-error
import { point, booleanPointInPolygon } from "@turf/turf";

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

const alaskaBoundingBox = [-179.148909, 51.214183, 179.77847, 71.5388];
const hawaiiBoundingBox = [-178.334698, 18.910361, -154.806773, 28.402123];

const isPointInBoundingBox = (
  longitude: number,
  latitude: number,
  boundingBox: number[]
) => {
  return (
    longitude >= boundingBox[0] &&
    latitude >= boundingBox[1] &&
    longitude <= boundingBox[2] &&
    latitude <= boundingBox[3]
  );
};

const isPointInUsaPolygon = (longitude: number, latitude: number): boolean => {
  const pt = point([longitude, latitude]);
  return booleanPointInPolygon(pt, RoughUsaPolygon);
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
  // TODO: This is a sanity hack to filter out stations that are clearly way outside of the US.
  // Some results come back with coordinates in europe which is very odd.
  stations.features = stations.features.filter((s) => {
    const [longitude, latitude] = s.geometry.coordinates;
    return (
      //isPointInBoundingBox(longitude, latitude, usBoundingBox) ||
      isPointInBoundingBox(longitude, latitude, alaskaBoundingBox) ||
      isPointInBoundingBox(longitude, latitude, hawaiiBoundingBox) ||
      isPointInUsaPolygon(longitude, latitude)
    );
  });
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
