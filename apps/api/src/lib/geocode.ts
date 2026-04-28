/**
 * Stub geocode: sets lat/lng from city/country hash for map demo.
 * Replace with Mapbox Geocoding API in production.
 */
export function approximateCoords(city: string, country: string): { lat: number; lng: number } {
  let h = 0;
  const s = `${city}|${country}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  const lat = 25 + (Math.abs(h % 2000) / 100 - 10);
  const lng = -40 + (Math.abs((h >> 8) % 3000) / 100 - 15);
  return { lat, lng };
}
