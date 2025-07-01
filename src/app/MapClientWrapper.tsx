"use client";
import dynamic from "next/dynamic";
// @ts-expect-error: Dynamic import of client component, type not needed
const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function MapClientWrapper() {
  return <MapView />;
}
