"use client";

import { mapboxToken } from "@/env";
import Map, { Source, Layer, Marker } from "react-map-gl";
import type { CircleLayer, MapLayerMouseEvent } from "react-map-gl";
import type { FeatureCollection } from "geojson";

import Image from "next/image";
import { useCallback, useState } from "react";

const geojson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.4, 37.8] },
      properties: { name: "San Francisco" },
    },
  ],
};

const layerStyle: CircleLayer = {
  id: "stations",
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": "#007cbf",
  },
};

export default function NwsMap() {
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [cursor, setCursor] = useState<string>("auto");
  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("auto"), []);

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const {
      features,
      point: { x, y },
    } = event;
    const hoveredFeature = features && features[0];
    if (hoveredFeature) {
      console.log(hoveredFeature);
    }

    // prettier-ignore
    setHoverInfo(hoveredFeature && {feature: hoveredFeature, x, y});
  }, []);
  return (
    <div className="h-full w-full">
      <Map
        mapLib={import("mapbox-gl")}
        initialViewState={{
          longitude: -100,
          latitude: 40,
          zoom: 3.5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={["stations"]}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onHover}
      >
        <Source id="stations-source" type="geojson" data={geojson}>
          <Layer {...layerStyle} />
        </Source>
        <Marker
          longitude={-100}
          latitude={40}
          anchor="bottom"
          onClick={() => console.log("Marker Clicked")}
          style={{ cursor: "pointer" }}
        >
          <Image src="/pin.png" alt="pin" width={20} height={20} />
        </Marker>
      </Map>
    </div>
  );
}
