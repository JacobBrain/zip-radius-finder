"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ZipLocation {
  zip_code: string;
  city: string;
  state: string;
  distance: number;
  lat: number;
  lng: number;
}

interface ZipMapProps {
  centerCoords: { lat: number; lng: number } | null;
  centerZip: string;
  zipDetails: ZipLocation[];
}

// Fix for default marker icons in Next.js/webpack
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Red icon for center ZIP
const centerIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to fit map bounds to all markers
function FitBounds({
  centerCoords,
  zipDetails,
}: {
  centerCoords: { lat: number; lng: number } | null;
  zipDetails: ZipLocation[];
}) {
  const map = useMap();

  useEffect(() => {
    const validPoints: [number, number][] = [];

    if (centerCoords && centerCoords.lat !== 0 && centerCoords.lng !== 0) {
      validPoints.push([centerCoords.lat, centerCoords.lng]);
    }

    zipDetails.forEach((z) => {
      if (z.lat !== 0 && z.lng !== 0) {
        validPoints.push([z.lat, z.lng]);
      }
    });

    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, centerCoords, zipDetails]);

  return null;
}

export default function ZipMap({
  centerCoords,
  centerZip,
  zipDetails,
}: ZipMapProps) {
  // Default center (US geographic center) if no coords
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const mapCenter: [number, number] =
    centerCoords && centerCoords.lat !== 0 && centerCoords.lng !== 0
      ? [centerCoords.lat, centerCoords.lng]
      : defaultCenter;

  return (
    <MapContainer
      center={mapCenter}
      zoom={10}
      className="zip-map"
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Center ZIP marker (red) */}
      {centerCoords && centerCoords.lat !== 0 && centerCoords.lng !== 0 && (
        <Marker position={[centerCoords.lat, centerCoords.lng]} icon={centerIcon}>
          <Popup>
            <strong>Center: {centerZip}</strong>
          </Popup>
        </Marker>
      )}

      {/* Result ZIP markers (blue) */}
      {zipDetails.map(
        (z) =>
          z.lat !== 0 &&
          z.lng !== 0 && (
            <Marker key={z.zip_code} position={[z.lat, z.lng]} icon={defaultIcon}>
              <Popup>
                <strong>{z.zip_code}</strong>
                <br />
                {z.city}, {z.state}
                <br />
                {z.distance.toFixed(2)} mi
              </Popup>
            </Marker>
          )
      )}

      <FitBounds centerCoords={centerCoords} zipDetails={zipDetails} />
    </MapContainer>
  );
}
