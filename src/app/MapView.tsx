"use client";

import { MapContainer, TileLayer, type MapContainerProps } from "react-leaflet";

export default function MapView() {
  const props: MapContainerProps = {
    center: [43.3, 5.4],
    zoom: 10,
    style: { height: "100vh", width: "100%" },
  };
  return (
    <MapContainer {...props}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
    </MapContainer>
  );
}
