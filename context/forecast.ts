import { GridpointsForecastJson } from "@/lib/types/nws";
import { createContext, useContext } from "react";

export type ForecastContextValue = {
  forecastDaily: GridpointsForecastJson | undefined;
  forecastHourly: GridpointsForecastJson | undefined;
  fetching: boolean;
};

export type ForecastContextType = {
  value: ForecastContextValue | undefined;
  setValue: (value: ForecastContextValue | undefined) => void;
};

export const ForecastContext = createContext<ForecastContextType | undefined>(
  undefined
);

export function useForecastContext(): ForecastContextType {
  const c = useContext(ForecastContext);
  if (c === undefined) {
    throw new Error(
      "useForecastContext must be used with a defined ForecastContext. You probably forgot to wrap your component in a <ForecastContext.Provider>."
    );
  }
  return c;
}
