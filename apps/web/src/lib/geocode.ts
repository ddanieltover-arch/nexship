/**
 * Geocode a location string (city, address, etc.) to lat/lng coordinates
 * using OpenStreetMap's Nominatim API (free, no key required).
 */
export async function geocodeAddress(
  query: string
): Promise<{ lat: number; lng: number } | null> {
  if (!query || query.trim().length === 0) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: query.trim(),
      format: "json",
      limit: "1",
    })}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "NexShip-Logistics/1.0",
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;

    const results = await res.json();
    if (!results || results.length === 0) return null;

    const { lat, lon } = results[0];
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lon),
    };
  } catch (err) {
    console.error("Geocoding failed for:", query, err);
    return null;
  }
}
