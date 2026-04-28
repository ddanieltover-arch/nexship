"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

type TrackEvent = {
  id: string;
  status: string;
  description: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  timestamp: string;
};

type MapShipment = {
  id: string;
  trackingId: string;
  status: string;
  origin: { city: string; country: string; lat: number | null; lng: number | null };
  destination: { street: string; city: string; country: string; lat: number | null; lng: number | null };
  events: TrackEvent[];
};

export function GlobalOperationsMap({ accessToken }: { accessToken: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [shipments, setShipments] = useState<MapShipment[]>([]);
  const [ready, setReady] = useState(false);

  // Fetch shipment data with events
  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ items: MapShipment[] }>("/admin/shipments?limit=100", { token: accessToken });
        setShipments(res.items);
      } catch (err) {
        console.error("Map data fetch failed", err);
      }
    })();
  }, [accessToken]);

  // Initialize Leaflet map (client-side only) with satellite tiles
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [30, -20],
        zoom: 3,
      });

      // Satellite / Terrain tile layer (Esri World Imagery)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      ).addTo(map);

      // Add labels on top of satellite
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.8 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstance.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);

      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Plot ALL locations on the map
  useEffect(() => {
    if (!ready || !mapInstance.current || !markersGroupRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default;

      const OriginIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background:#06b6d4;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 8px rgba(6,182,212,0.6);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const DestIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 8px rgba(59,130,246,0.6);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const EventIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background:#f59e0b;width:10px;height:10px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px rgba(245,158,11,0.5);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const markersGroup = markersGroupRef.current;
      markersGroup.clearLayers();

      const allBounds: [number, number][] = [];

      shipments.forEach((s) => {
        const routePoints: [number, number][] = [];

        // 1. Origin marker
        if (s.origin.lat != null && s.origin.lng != null) {
          const pt: [number, number] = [s.origin.lat, s.origin.lng];
          allBounds.push(pt);
          routePoints.push(pt);

          L.marker(pt, { icon: OriginIcon })
            .addTo(markersGroup)
            .bindTooltip(
              `<strong>📦 Origin</strong><br/>${s.origin.city}, ${s.origin.country}<br/><span style="color:#06b6d4">${s.trackingId}</span>`,
              { direction: "top", className: "leaflet-tooltip-custom" }
            );
        }

        // 2. All tracking event markers (admin-inputted locations)
        s.events.forEach((ev) => {
          if (ev.lat != null && ev.lng != null) {
            const pt: [number, number] = [ev.lat, ev.lng];
            allBounds.push(pt);
            routePoints.push(pt);

            L.marker(pt, { icon: EventIcon })
              .addTo(markersGroup)
              .bindTooltip(
                `<strong>📍 ${ev.status.replace(/_/g, " ")}</strong><br/>${ev.city || "Unknown"}${ev.country ? ", " + ev.country : ""}<br/><span style="font-size:10px;color:#888">${new Date(ev.timestamp).toLocaleString()}</span>`,
                { direction: "top", className: "leaflet-tooltip-custom" }
              );
          }
        });

        // 3. Destination marker
        if (s.destination.lat != null && s.destination.lng != null) {
          const pt: [number, number] = [s.destination.lat, s.destination.lng];
          allBounds.push(pt);
          routePoints.push(pt);

          L.marker(pt, { icon: DestIcon })
            .addTo(markersGroup)
            .bindTooltip(
              `<strong>🏁 Destination</strong><br/>${s.destination.city}, ${s.destination.country}<br/><span style="color:#3b82f6">${s.trackingId}</span>`,
              { direction: "top", className: "leaflet-tooltip-custom" }
            );
        }

        // 4. Draw route polyline connecting all points in order
        if (routePoints.length >= 2) {
          L.polyline(routePoints, {
            color: "#06b6d4",
            weight: 3,
            opacity: 0.7,
            dashArray: "8, 6",
          }).addTo(markersGroup);
        }
      });

      // Fit map to show all points at city level
      if (allBounds.length > 0) {
        mapInstance.current.fitBounds(L.latLngBounds(allBounds), {
          padding: [60, 60],
          maxZoom: 14,
          animate: true,
        });
      }
    })();
  }, [ready, shipments]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl">
      <div ref={mapRef} className="h-full w-full" style={{ minHeight: "450px" }} />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-black/70 border border-white/10 p-3 backdrop-blur-md">
        <div className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#06b6d4] border-2 border-white" />
            <span className="text-white">Origins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] border-2 border-white" />
            <span className="text-white">Tracking Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#3b82f6] border-2 border-white" />
            <span className="text-white">Destinations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
