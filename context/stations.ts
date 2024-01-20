import { StationsGeoJson } from "@/lib/types/nws";
import { createContext, useContext } from "react";

export type StationContextValue = {
  stationsGeoJson: StationsGeoJson | undefined;
  fetching: boolean;
};

export type StationContextType = {
  value: StationContextValue | undefined;
  setValue: (value: StationContextValue) => void;
};

export const StationContext = createContext<StationContextType | undefined>(
  undefined
);

export function useStationContext(): StationContextType {
  const c = useContext(StationContext);
  if (c === undefined) {
    throw new Error(
      "useStationContext must be used with a defined StationContext. You probably forgot to wrap your component in a <StationContext.Provider>."
    );
  }
  return c;
}
