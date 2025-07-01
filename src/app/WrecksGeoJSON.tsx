"use client";

import { GeoJSON, useMapEvents } from "react-leaflet";
import { useEffect, useState, useCallback, useRef } from "react";
import type { FeatureCollection } from "geojson";
import L from "leaflet";

const wreckIcon = L.icon({
  iconUrl: "/ship.png",
  iconSize: [20, 32], // downsized from default
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
  shadowUrl: "/marker-shadow.png",
  shadowSize: [32, 32],
  shadowAnchor: [10, 32],
});

export default function WrecksGeoJSON() {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null
  );
  const [zoom, setZoom] = useState<number>(10);
  const [showZoomWarning, setShowZoomWarning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback((bbox: [number, number, number, number]) => {
    setLoading(true);
    const bboxParam = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]},EPSG:4326`;
    const WFS_URL = `https://services.data.shom.fr/INSPIRE/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=EPAVES_BDD_WFS:wrecks&outputFormat=application/json&srsName=EPSG:4326&bbox=${bboxParam}`;
    fetch(WFS_URL)
      .then((res) => res.json())
      .then((data) => {
        const features = data.features
          .filter(
            (f: any) =>
              f.properties && f.properties.longitude && f.properties.latitude
          )
          .map((f: any) => ({
            ...f,
            geometry: {
              type: "Point",
              coordinates: [f.properties.longitude, f.properties.latitude],
            },
          }));
        setGeojsonData({ ...data, features });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load GeoJSON");
        setLoading(false);
      });
  }, []);

  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const b = map.getBounds();
      const bbox: [number, number, number, number] = [
        b.getWest(),
        b.getSouth(),
        b.getEast(),
        b.getNorth(),
      ];
      setBounds(bbox);
      setZoom(map.getZoom());
    },
    zoomend: (e) => {
      const map = e.target;
      setZoom(map.getZoom());
      const b = map.getBounds();
      const bbox: [number, number, number, number] = [
        b.getWest(),
        b.getSouth(),
        b.getEast(),
        b.getNorth(),
      ];
      setBounds(bbox);
    },
  });

  useEffect(() => {
    if (zoom < 8) {
      setShowZoomWarning(true);
      setGeojsonData(null);
      setLoading(false);
      return;
    }
    setShowZoomWarning(false);
    if (bounds) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchData(bounds);
      }, 300);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [bounds, zoom, fetchData]);

  useEffect(() => {
    if (!bounds) {
      setLoading(true);
      fetchData([5, 43, 6, 44]);
    }
  }, [bounds, fetchData]);

  if (error) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-[1000]">
        {error}
      </div>
    );
  }

  if (showZoomWarning) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded shadow-lg z-[1000]">
        Zoom in to level 8 or higher to see wrecks in this area.
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white bg-opacity-80 px-4 py-2 rounded shadow-lg z-[1000] flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-slate-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span className="text-slate-600">Loading wrecks...</span>
        </div>
      )}
      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          pointToLayer={(_, latlng) => L.marker(latlng, { icon: wreckIcon })}
          onEachFeature={(feature, layer) => {
            let popupContent = "";
            if (feature.properties) {
              popupContent = Object.entries(feature.properties)
                .map(([k, v]) => `<b>${k}</b>: ${v}`)
                .join("<br/>");
            }
            layer.bindPopup(popupContent);
          }}
        />
      )}
    </>
  );
}
