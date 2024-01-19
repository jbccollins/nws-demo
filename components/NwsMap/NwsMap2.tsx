"use client";

import { mapboxToken } from "@/env";
import * as React from "react";
import { useRef } from "react";
import { Map, Source, Layer } from "react-map-gl";
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from "./StationsClusterLayer";

import type { MapLayerMouseEvent, MapRef } from "react-map-gl";
import type { GeoJSONSource } from "react-map-gl";
import { useStationContext } from "@/context/stations";

const MAPBOX_TOKEN = mapboxToken; // Set your mapbox token here

export default function NwsMap() {
  const stationContext = useStationContext();
  const { value: stationsGeoJson } = stationContext;

  const mapRef = useRef<MapRef>(null);

  const onClick = (event: MapLayerMouseEvent) => {
    if (!mapRef?.current) {
      console.error("mapRef is not defined");
      return;
    }
    const feature = event?.features?.[0];
    const clusterId = feature?.properties?.cluster_id;

    console.log(">>>>>", feature);

    const mapboxSource = mapRef.current.getSource("stations") as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        return;
      }

      if (!mapRef?.current) {
        console.error("mapRef is not defined");
        return;
      }

      if (!feature) {
        console.error("feature is not defined");
        return;
      }

      if (feature.layer.id === clusterLayer.id) {
        mapRef.current.easeTo({
          // WTF why is coordinates not on this type?
          // @ts-ignore
          center: feature.geometry.coordinates,
          zoom,
          duration: 500,
        });
      }

      if (feature.layer.id === unclusteredPointLayer.id) {
        const stationId = feature.properties?.stationIdentifier;
        console.log(stationId);
      }
    });
  };

  const [cursor, setCursor] = React.useState<string>("auto");
  const onMouseEnter = React.useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = React.useCallback(() => setCursor("auto"), []);

  return (
    <>
      <Map
        initialViewState={{
          latitude: 40.67,
          longitude: -103.59,
          zoom: 3,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={
          [clusterLayer.id, unclusteredPointLayer.id] as string[]
        }
        onClick={onClick}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={mapRef}
      >
        {stationsGeoJson && (
          <Source
            id="stations"
            type="geojson"
            data={stationsGeoJson}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source>
        )}
      </Map>
    </>
  );
}
