"use client";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState, useCallback, useRef } from "react";
import type { FeatureCollection } from "geojson";
import WrecksGeoJSON from "./WrecksGeoJSON";

export default function MapView() {
  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[43.3, 5.4]}
        zoom={10}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <WrecksGeoJSON />
      </MapContainer>
    </div>
  );
}
