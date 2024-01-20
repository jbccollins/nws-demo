import { StationsGeoJson } from "@/lib/types/nws";

export const extractZoneIdFromForecastUrl = (url: string): string => {
  const urlParts = url.split("/");
  const zoneId = urlParts[urlParts.length - 1];
  return zoneId;
};

export const findStationById = (stations: StationsGeoJson, id: string) => {
  const station = stations.features.find(
    (s) => s.properties.stationIdentifier === id
  );
  return station;
};
