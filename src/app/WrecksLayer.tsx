"use client";
import { useEffect, useState } from "react";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Marker, Popup } from "react-leaflet";
import { patchGeoJsonWithLonLat } from "../utils/geojson";

const WFS_URL =
  "https://services.data.shom.fr/INSPIRE/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=EPAVES_BDD_WFS:wrecks&outputFormat=application/json&srsName=EPSG:4326";

export default function WrecksLayer() {
  const [features, setFeatures] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(WFS_URL)
      .then((res) => res.json())
      .then((data) => {
        const patched = patchGeoJsonWithLonLat(data);
        setFeatures(patched.features || []);
      })
      .catch(() => setError("Failed to load GeoJSON"));
  }, []);

  if (error) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-[1000]">
        {error}
      </div>
    );
  }

  return (
    <MarkerClusterGroup>
      {features.map((feature, idx) => (
        <Marker
          key={feature.id || idx}
          position={[
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0],
          ]}
        >
          <Popup>
            {Object.entries(feature.properties)
              .map(([k, v]) => `<b>${k}</b>: ${v}`)
              .join("<br/>")}
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
