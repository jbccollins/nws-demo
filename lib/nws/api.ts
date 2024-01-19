import { StateCode, StationsGeoJson } from "@/lib/types/nws";

const nwsApiBaseUrl = "https://api.weather.gov";

const getStations = async (stateCode: StateCode, limit?: number) => {
  const _limit = limit || 500;
  const url = `${nwsApiBaseUrl}/stations?state=${stateCode}&limit=${_limit}`;
  const response = await fetch(url);
  const stations = (await response.json()) as StationsGeoJson;
  return stations;
};

export default {
  getStations,
} as const;
