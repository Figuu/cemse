export type MappableLocation =
  | string
  | { lat?: number; lng?: number; address?: string } 
  | null 
  | undefined;

export const formatLocation = (location: MappableLocation): string => {
  if (!location) return "";
  if (typeof location === "string") return location;
  const { address, lat, lng } = location;
  if (address && typeof address === "string") return address;
  const latText = typeof lat === "number" ? lat.toFixed(4) : undefined;
  const lngText = typeof lng === "number" ? lng.toFixed(4) : undefined;
  if (latText && lngText) return `${latText}, ${lngText}`;
  return "";
};


