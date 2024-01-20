"use client";

import { useStationContext } from "@/context/stations";
import { StateCode, stateCodeNameList } from "@/lib/types/nws";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import nwsApi from "@/lib/nws/api";

export default function Search() {
  const stationContext = useStationContext();
  const handleChange = async (key: string | number) => {
    stationContext.setValue({
      stationsGeoJson: undefined,
      fetching: true,
    });
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
