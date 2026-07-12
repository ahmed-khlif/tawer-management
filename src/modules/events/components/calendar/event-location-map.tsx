"use client";

import { useEffect, useMemo } from "react";
import { MapPin } from "lucide-react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const themedMarkerIcon = L.divIcon({
  className: "event-location-marker",
  html: `
    <span class="event-location-marker__pin">
      <span class="event-location-marker__core"></span>
    </span>
    <span class="event-location-marker__shadow"></span>
  `,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -36],
});

interface EventLocationMapProps {
  latitude: number;
  longitude: number;
  label: string;
  onChange: (latitude: number, longitude: number) => void;
}

function RecenterMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom(), 15), {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

function DraggableLocationMarker({
  latitude,
  longitude,
  label,
  onChange,
}: EventLocationMapProps) {
  const markerPosition = useMemo(
    () => ({ lat: latitude, lng: longitude }),
    [latitude, longitude],
  );

  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return (
    <Marker
      position={markerPosition}
      draggable
      icon={themedMarkerIcon}
      title={label}
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          const nextPosition = marker.getLatLng();
          onChange(nextPosition.lat, nextPosition.lng);
        },
      }}
    />
  );
}

export default function EventLocationMap({
  latitude,
  longitude,
  label,
  onChange,
}: EventLocationMapProps) {
  return (
    <div className="event-location-map-shell relative overflow-hidden rounded-[1.35rem] border border-border/70 bg-card shadow-sm">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="event-location-map h-56 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap latitude={latitude} longitude={longitude} />
        <DraggableLocationMarker
          latitude={latitude}
          longitude={longitude}
          label={label}
          onChange={onChange}
        />
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-background/60 via-background/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background/40 to-transparent" />

      {label ? (
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex max-w-[calc(100%-4.75rem)] items-center gap-2 rounded-full border border-primary/15 bg-background/88 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
          <MapPin className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">{label}</span>
        </div>
      ) : null}
    </div>
  );
}
