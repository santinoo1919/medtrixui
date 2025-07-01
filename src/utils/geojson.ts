export function patchGeoJsonWithLonLat(data: any) {
  if (!data.features) return data;
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
  return { ...data, features };
}
