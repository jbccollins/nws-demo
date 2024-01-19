"use client";

import NwsMapContainer from "@/components/NwsMap/NwsMapContainer";
import Search from "@/components/Search";
import { StationContext, StationContextType } from "@/context/stations";
import { StationsGeoJson } from "@/lib/types/nws";
import { useState } from "react";

export default function AppContainer() {
  const [stationContextValue, setStationContextValue] = useState<
    StationsGeoJson | undefined
  >(undefined);

  const stationContext: StationContextType = {
    value: stationContextValue,
    setValue: setStationContextValue,
  };

  return (
    <StationContext.Provider value={stationContext}>
      <div className="h-full w-full relative">
        <NwsMapContainer />
        <div className="top-0 right-0 absolute">
          <Search />
        </div>
      </div>
    </StationContext.Provider>
  );
}
