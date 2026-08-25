"use client";

export const ABUJA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "lugbe junction": { lat: 8.973, lng: 7.378 },
  "lugbe federal housing": { lat: 8.955, lng: 7.352 },
  "lugbe zone 5": { lat: 8.965, lng: 7.362 },
  "lugbe": { lat: 8.96, lng: 7.36 },
  "secretariat, garki": { lat: 9.032, lng: 7.491 },
  "garki": { lat: 9.02, lng: 7.48 },
  "wuse": { lat: 9.072, lng: 7.475 },
  "wuse market": { lat: 9.063, lng: 7.461 },
  "cbd": { lat: 9.065, lng: 7.495 },
  "central business district": { lat: 9.065, lng: 7.495 },
  "airport road": { lat: 9.002, lng: 7.305 },
  "berger": { lat: 9.061, lng: 7.452 },
  "berger junction": { lat: 9.061, lng: 7.452 },
  "galadimawa": { lat: 9.005, lng: 7.418 },
  "lokogoma": { lat: 8.988, lng: 7.425 },
  "kubwa": { lat: 9.155, lng: 7.322 },
  "gwarinpa": { lat: 9.105, lng: 7.408 },
  "jahi": { lat: 9.085, lng: 7.428 },
  "maitama": { lat: 9.092, lng: 7.502 },
  "asokoro": { lat: 9.038, lng: 7.525 },
};

export function getCoordinates(areaName: string): { lat: number; lng: number } | null {
  if (!areaName) return null;
  const normalized = areaName.trim().toLowerCase();
  
  // Try exact match
  if (ABUJA_COORDINATES[normalized]) {
    return ABUJA_COORDINATES[normalized];
  }
  
  // Try substring match
  for (const [key, coords] of Object.entries(ABUJA_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  
  return null;
}

export function getStaticMapUrl(pickup: string, destination: string): string | null {
  const pickupCoords = getCoordinates(pickup);
  const destCoords = getCoordinates(destination);
  
  if (!pickupCoords || !destCoords) return null;
  
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  if (mapboxToken) {
    const pickupMarker = `pin-s-a+14213D(${pickupCoords.lng},${pickupCoords.lat})`;
    const destMarker = `pin-s-b+FFC93C(${destCoords.lng},${destCoords.lat})`;
    
    // Style GeoJSON path representing the route
    const geojson = {
      type: "Feature",
      properties: {
        stroke: "#14213D",
        "stroke-width": 3,
        "stroke-opacity": 0.8
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [pickupCoords.lng, pickupCoords.lat],
          [destCoords.lng, destCoords.lat]
        ]
      }
    };
    
    const geojsonStr = encodeURIComponent(JSON.stringify(geojson));
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/geojson(${geojsonStr}),${pickupMarker},${destMarker}/auto/450x150?access_token=${mapboxToken}`;
  }
  
  if (googleKey) {
    return `https://maps.googleapis.com/maps/api/staticmap?size=450x150&markers=color:0x14213D|label:A|${pickupCoords.lat},${pickupCoords.lng}&markers=color:0xFFC93C|label:B|${destCoords.lat},${destCoords.lng}&path=color:0x14213D|weight:3|${pickupCoords.lat},${pickupCoords.lng}|${destCoords.lat},${destCoords.lng}&key=${googleKey}`;
  }
  
  // Keyless fallback to Yandex static maps so it functions out-of-the-box
  return `https://static-maps.yandex.ru/1.x/?l=map&size=450,150&pt=${pickupCoords.lng},${pickupCoords.lat},pm2dbm~${destCoords.lng},${destCoords.lat},pm2ylm`;
}
