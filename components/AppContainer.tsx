"use client";

import NwsMapContainer from "@/components/NwsMap/NwsMapContainer";
import Search from "@/components/Search";
import {
  ForecastContext,
  ForecastContextType,
  ForecastContextValue,
} from "@/context/forecast";
import {
  StationContext,
  StationContextType,
  StationContextValue,
} from "@/context/stations";
import { StationsGeoJson } from "@/lib/types/nws";
import { useState } from "react";
import ForecastContainer from "./Forecast/ForecastContainer";

export default function AppContainer() {
  const [stationContextValue, setStationContextValue] = useState<
    StationContextValue | undefined
  >(undefined);

  const [forecastContextValue, setForecastContextValue] = useState<
    ForecastContextValue | undefined
  >(undefined);

  const stationContext: StationContextType = {
    value: stationContextValue,
    setValue: setStationContextValue,
  };

  const forecastContext: ForecastContextType = {
    value: forecastContextValue,
    setValue: setForecastContextValue,
  };

  return (
    <StationContext.Provider value={stationContext}>
      <ForecastContext.Provider value={forecastContext}>
        <div className="h-full w-full relative">
          <NwsMapContainer />
          <div className="top-0 right-0 absolute m-3">
            <Search />
          </div>
          <ForecastContainer />
        </div>
        {stationContextValue?.fetching && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="text-white">Fetching stations...</div>
          </div>
        )}
      </ForecastContext.Provider>
    </StationContext.Provider>
  );
}
