import { StationsGeoJson } from "@/lib/types/nws";
import { createContext, useContext } from "react";

export type StationContextType = {
  value: StationsGeoJson | undefined;
  setValue: (value: StationsGeoJson) => void;
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
