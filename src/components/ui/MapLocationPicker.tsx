"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLng } from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, X } from "lucide-react";
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

interface MapLocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

// Component to handle map click events
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapLocationPicker({
  value,
  onChange,
  placeholder = "Buscar ubicación...",
  label = "Ubicación",
  error,
  required = false,
}: MapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-16.5000, -68.1500]); // Default to La Paz, Bolivia
  const mapRef = useRef<L.Map>(null);

  // Initialize with default location if no value provided
  useEffect(() => {
    if (!value) {
      // Default to La Paz, Bolivia
      const defaultLocation: LocationData = {
        lat: -16.5000,
        lng: -68.1500,
        address: "La Paz, Bolivia",
      };
      onChange(defaultLocation);
    } else {
      setMapCenter([value.lat, value.lng]);
    }
  }, [value, onChange]);

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Reverse geocoding to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      const newLocation: LocationData = {
        lat,
        lng,
        address,
      };
      
      onChange(newLocation);
      setSearchQuery(address);
    } catch (error) {
      console.error("Error getting address:", error);
      const newLocation: LocationData = {
        lat,
        lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
      onChange(newLocation);
      setSearchQuery(newLocation.address);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        const newLocation: LocationData = {
          lat,
          lng,
          address: result.display_name,
        };
        
        onChange(newLocation);
        setMapCenter([lat, lng]);
        
        // Center map on the found location
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
      }
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearLocation = () => {
    setSearchQuery("");
    const defaultLocation: LocationData = {
      lat: -16.5000,
      lng: -68.1500,
      address: "La Paz, Bolivia",
    };
    onChange(defaultLocation);
    setMapCenter([defaultLocation.lat, defaultLocation.lng]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location-search">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location-search"
              value={searchQuery || value?.address || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-10"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            />
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            size="sm"
          >
            <Search className="h-4 w-4" />
          </Button>
          {value && (
            <Button
              type="button"
              onClick={clearLocation}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Selecciona la ubicación en el mapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ blockSize: "100%", inlineSize: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {value && (
                <Marker position={[value.lat, value.lng]} />
              )}
              <MapClickHandler onLocationSelect={handleMapClick} />
            </MapContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Haz clic en el mapa para seleccionar la ubicación exacta
          </p>
        </CardContent>
      </Card>

      {value && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Ubicación seleccionada:</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{value.address}</p>
          <p className="text-xs text-muted-foreground">
            Coordenadas: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
