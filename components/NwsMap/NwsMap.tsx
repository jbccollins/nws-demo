"use client";

import { mapboxToken } from "@/env";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Map, Source, Layer } from "react-map-gl";
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from "./StationsClusterLayer";

import type {
  LngLatBoundsLike,
  MapLayerMouseEvent,
  MapRef,
  MapboxGeoJSONFeature,
} from "react-map-gl";
import type { GeoJSONSource } from "react-map-gl";
import { useStationContext } from "@/context/stations";
import { HoverForecastData, StationsGeoJson } from "@/lib/types/nws";
import nwsApi from "@/lib/nws/api";
import HoverForecast from "./HoverForecast";
import { extractZoneIdFromForecastUrl, findStationById } from "@/lib/util/nws";
import { useForecastContext } from "@/context/forecast";
import bbox from "@mapbox/geojson-extent";

type HoverInfo = {
  feature: MapboxGeoJSONFeature;
  x: number;
  y: number;
};

export default function NwsMap() {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | undefined>(undefined);
  const [hoverForecast, setHoverForecast] = useState<
    HoverForecastData | undefined
  >(undefined);
  const [cursor, setCursor] = useState<string>("auto");

  const mapRef = useRef<MapRef>(null);

  const stationContext = useStationContext();
  const { value: stationsContextValue } = stationContext;
  const { stationsGeoJson } = stationsContextValue || {};

  const forecastContext = useForecastContext();
  const { setValue: setForecastContextValue } = forecastContext;

  // Try to zoom to fit the stations when the stations change
  // TODO: Some stations are over in like... europe... which is very odd
  useEffect(() => {
    if (!stationsContextValue || !stationsGeoJson) {
      return;
    }
    // get bounding box
    const boundingBox = bbox(stationsGeoJson);
    const firstFour = boundingBox.slice(0, 4);
    const bounds: LngLatBoundsLike = [
      [firstFour[0], firstFour[1]],
      [firstFour[2], firstFour[3]],
    ];
    console.log("boundingBox", boundingBox);
    if (!mapRef?.current) {
      console.error("mapRef is not defined");
      return;
    }
    mapRef.current.fitBounds(bounds, {
      padding: 40,
    });
    console.log("stationsContextValue changed");
  }, [stationsContextValue]);

  const fetchHoverForecast = async (zoneId: string) => {
    setHoverForecast({
      zoneId,
      data: undefined,
      fetching: true,
    });
    const data = await nwsApi.getZoneForecast(zoneId);

    // TODO: This isn't really safe. If the user moves quickly from one station to another
    // the first station's data might come back after the second station's data
    // and we'd end up setting the wrong thing here. A future fix for this would be to
    // check the zoneId against the current hoverForecast's zoneId and only set the data
    // if they match.
    setHoverForecast({
      zoneId,
      data,
      fetching: false,
    });
  };

  const handleStationClick = async (stationId: string) => {
    if (!stationsContextValue) {
      return;
    }
    const station = findStationById(
      stationsGeoJson as StationsGeoJson,
      stationId
    );
    if (!station) {
      alert("Could not find station :(");
      return;
    }
    setForecastContextValue({
      forecastHourly: undefined,
      forecastDaily: undefined,
      fetching: true,
    });

    const [lng, lat] = station.geometry.coordinates;
    const points = await nwsApi.getPoints(lat, lng);

    const forecastHourly = nwsApi.getGridpointsForecastHourly(
      points.properties.forecastHourly
    );
    const forecastDaily = nwsApi.getGridpointsForecastDaily(
      points.properties.forecast
    );

    const [forecastHourlyData, forecastDailyData] = await Promise.allSettled([
      forecastHourly,
      forecastDaily,
    ]);

    if (
      forecastHourlyData.status === "fulfilled" &&
      forecastDailyData.status === "fulfilled"
    ) {
      if (
        !forecastHourlyData?.value?.properties ||
        !forecastDailyData?.value?.properties
      ) {
        alert("Could not get forecast data :(");
        setForecastContextValue(undefined);
        return;
      }
      setForecastContextValue({
        forecastHourly: forecastHourlyData.value,
        forecastDaily: forecastDailyData.value,
        fetching: false,
      });
    } else {
      alert("Could not get forecast data :(");
      setForecastContextValue(undefined);
    }
  };

  const onClick = (event: MapLayerMouseEvent) => {
    setForecastContextValue(undefined);
    if (!mapRef?.current) {
      console.error("mapRef is not defined");
      return;
    }
    const feature = event?.features?.[0];
    const clusterId = feature?.properties?.cluster_id;

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
        // Just means that the user clicked the map but not on a feature
        // console.error("feature is not defined");
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
        handleStationClick(stationId);
      }
    });
  };

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const {
      features,
      point: { x, y },
    } = event;
    const hoveredFeature = features && features[0];
    if (hoveredFeature) {
      // Don't show tooltips for clusters
      if (hoveredFeature.layer.id === clusterLayer.id) {
        setHoverInfo(undefined);
        return;
      }
    }

    setHoverInfo(hoveredFeature && { feature: hoveredFeature, x, y });
  }, []);

  const onMouseEnter = useCallback((event: MapLayerMouseEvent) => {
    setCursor("pointer");
    const { features } = event;
    const hoveredFeature = features && features[0];
    if (
      hoveredFeature &&
      hoveredFeature.layer.id === unclusteredPointLayer.id
    ) {
      const zoneId = extractZoneIdFromForecastUrl(
        hoveredFeature.properties?.forecast
      );
      // TODO: We could probably do a better job of not fetching the same data over and over
      // But for now, just fetch it every time
      fetchHoverForecast(zoneId);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setCursor("auto");
    setHoverForecast(undefined);
  }, []);

  return (
    <>
      <Map
        initialViewState={{
          latitude: 40.67,
          longitude: -103.59,
          zoom: 3,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={
          [clusterLayer.id, unclusteredPointLayer.id] as string[]
        }
        onClick={onClick}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onHover}
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
        {hoverInfo && (
          <div
            className="tooltip absolute m-2 p-1 bg-black bg-opacity-80 text-white max-w-xs text-xs z-10 pointer-events-none"
            style={{ left: hoverInfo.x, top: hoverInfo.y }}
          >
            <div>Station Name: {hoverInfo.feature?.properties?.name}</div>
            <div>
              Station ID: {hoverInfo.feature?.properties?.stationIdentifier}
            </div>
            {hoverForecast && (
              <HoverForecast forecast={hoverForecast}></HoverForecast>
            )}
            <div></div>
            <div>Click to view detailed hourly forecast information</div>
          </div>
        )}
      </Map>
    </>
  );
}
