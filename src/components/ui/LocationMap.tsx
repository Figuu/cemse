"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { LatLng } from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationMapProps {
  location: LocationData;
  title?: string;
  height?: string;
}

export function LocationMap({ 
  location, 
  title = "Ubicación del Trabajo",
  height = "h-64"
}: LocationMapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`${height} w-full rounded-lg overflow-hidden`}>
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            style={{ blockSize: "100%", inlineSize: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]} />
          </MapContainer>
        </div>
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Dirección:</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
        </div>
      </CardContent>
    </Card>
  );
}
