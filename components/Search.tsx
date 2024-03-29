"use client";

import { useStationContext } from "@/context/stations";
import {
  StateCode,
  stateCodeNameList,
  stateCodeToStateName,
} from "@/lib/types/nws";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import nwsApi from "@/lib/nws/api";
import { useForecastContext } from "@/context/forecast";

export default function Search() {
  const stationContext = useStationContext();
  const forecastContext = useForecastContext();
  const handleChange = async (key: string | number) => {
    if (!key || !stateCodeToStateName[key as StateCode]) {
      return;
    }
    stationContext.setValue({
      stationsGeoJson: undefined,
      fetching: true,
    });
    forecastContext.setValue(undefined);
    const stations = await nwsApi.getStations(key as StateCode);
    stationContext.setValue({
      stationsGeoJson: stations,
      fetching: false,
    });
  };
  return (
    <div>
      <Autocomplete
        label="Search"
        placeholder=""
        className="max-w-xs"
        defaultItems={stateCodeNameList}
        onSelectionChange={handleChange}
      >
        {(item) => (
          <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
}
