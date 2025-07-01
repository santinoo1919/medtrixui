import type { Feature, FeatureCollection } from "geojson";

export function patchGeoJsonWithLonLat(data: FeatureCollection) {
  if (!data.features) return data;
  const features = data.features
    .filter(
      (f: Feature) =>
        f.properties && f.properties.longitude && f.properties.latitude
    )
    .map((f: Feature) =>
      f.properties
        ? {
            ...f,
            geometry: {
              type: "Point",
              coordinates: [f.properties.longitude, f.properties.latitude],
            },
          }
        : f
    );
  return { ...data, features };
}
