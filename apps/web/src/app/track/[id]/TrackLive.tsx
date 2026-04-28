"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io, type Socket } from "socket.io-client";
import { MapPin, Navigation } from "lucide-react";
import { WS_BASE, apiFetch } from "@/lib/api";

// Fix for default Leaflet icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type TrackEvent = {
  status: string;
  description: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  timestamp: string;
};

type TrackPayload = {
  trackingId: string;
  status: string;
  estimatedAt: string | null;
  origin: { city: string; country: string; lat: number | null; lng: number | null };
  destination: { city: string; country: string; lat: number | null; lng: number | null };
  events: TrackEvent[];
};

export function TrackLive({ trackingId }: { trackingId: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const historyPolylineRef = useRef<L.Polyline | null>(null);
  const currentLegPolylineRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [data, setData] = useState<TrackPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const points = useMemo(() => {
    if (!data) return [] as [number, number][];
    const pts: [number, number][] = [];
    
    // Start with Origin
    if (data.origin.lat != null && data.origin.lng != null) {
      pts.push([data.origin.lat, data.origin.lng]);
    }
    
    // Add all events with locations
    data.events.forEach(e => {
      if (e.lat != null && e.lng != null) {
        pts.push([e.lat, e.lng]);
      }
    });

    return pts;
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<TrackPayload>(`/track/${encodeURIComponent(trackingId)}`);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Not found");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trackingId]);

  useEffect(() => {
    if (!data || !mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      L.control.zoom({ position: "topright" }).addTo(mapInstance.current);
      markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    const map = mapInstance.current;
    const markersGroup = markersGroupRef.current!;

    // Clear old markers
    markersGroup.clearLayers();

    // Add markers for all points
    points.forEach((pt, idx) => {
      const isLast = idx === points.length - 1;
      const marker = L.marker(pt, {
        icon: isLast ? L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="bg-teal h-4 w-4 rounded-full border-2 border-white animate-ping"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        }) : DefaultIcon
      }).addTo(markersGroup);
      
      const label = idx === 0 ? "Origin" : idx === points.length - 1 ? "Current Location" : `Checkpoint ${idx}`;
      marker.bindTooltip(label, { permanent: false, direction: 'top' });
    });

    // Draw Polylines
    if (points.length >= 2) {
      const historyCoords = points.slice(0, -1);
      const lastLegCoords = points.slice(-2);

      // History line (teal dimmed)
      if (!historyPolylineRef.current) {
        historyPolylineRef.current = L.polyline(historyCoords, {
          color: "#06b6d4",
          weight: 2,
          opacity: 0.4,
          dashArray: "5, 10"
        }).addTo(map);
      } else {
        historyPolylineRef.current.setLatLngs(historyCoords);
      }

      // Current leg (bright teal/white)
      if (!currentLegPolylineRef.current) {
        currentLegPolylineRef.current = L.polyline(lastLegCoords, {
          color: "#2dd4bf",
          weight: 4,
          opacity: 1,
        }).addTo(map);
      } else {
        currentLegPolylineRef.current.setLatLngs(lastLegCoords);
      }
    }

    // Auto Zoom to fit all points
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
    }
  }, [data, points]);

  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(WS_BASE, {
        path: "/ws/socket.io",
        query: { trackingId },
        transports: ["websocket", "polling"],
      });
      socket.on("location_update", (payload: { lat: number; lng: number; status: string; timestamp: string }) => {
        setData((prev) => {
          if (!prev) return prev;
          const ev: TrackEvent = {
            status: payload.status,
            description: "Live update",
            city: null,
            country: null,
            lat: payload.lat,
            lng: payload.lng,
            timestamp: payload.timestamp,
          };
          return { ...prev, status: payload.status, events: [...prev.events, ev] };
        });
      });
    } catch { /* optional */ }
    return () => {
      socket?.disconnect();
    };
  }, [trackingId]);

  if (error) return <p className="px-4 py-16 text-center text-red-300">{error}</p>;
  if (!data) return <p className="px-4 py-16 text-center text-slate-400">Loading tracking…</p>;

  return (
    <div className="mx-auto max-w-6xl gap-6 px-4 py-6 md:py-8 lg:grid lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="relative h-[350px] md:h-[500px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div ref={mapRef} className="h-full w-full" />
          <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 rounded-full bg-navy/80 px-4 py-2 backdrop-blur border border-slate-700">
            <div className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Live Operations Center</span>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Route Intelligence</p>
            <div className="rounded-full bg-teal/10 px-3 py-1 text-[10px] font-bold text-teal border border-teal/20">
              {data.status}
            </div>
          </div>
          <p className="mt-4 font-mono text-2xl text-white font-bold">{data.trackingId}</p>
          
          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-slate-800 p-2">
                <MapPin className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Origin</p>
                <p className="text-white font-medium">{data.origin.city}, {data.origin.country}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-teal/20 p-2">
                <Navigation className="h-4 w-4 text-teal animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-teal font-bold tracking-widest">Current Leg</p>
                <p className="text-white font-medium">In Transit to Destination</p>
              </div>
            </div>
          </div>

          <Link 
            href="/contact" 
            className="mt-10 block w-full rounded-2xl bg-teal py-4 text-center text-sm font-bold text-navy hover:bg-teal-600 transition-all shadow-lg shadow-teal/20"
          >
            Request Assistance
          </Link>
        </div>
        
        <div className="mt-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <ol className="space-y-4 border-l-2 border-slate-800 ml-3 pl-6">
            {[...data.events].reverse().map((e, i) => (
              <li key={`${e.timestamp}-${i}`} className="relative">
                <span className={`absolute -left-[33px] top-1 h-3 w-3 rounded-full border-2 border-navy ${i === 0 ? 'bg-teal' : 'bg-slate-700'}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase">{e.status.replace(/_/g, " ")}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {new Date(e.timestamp).toLocaleString()}
                    {e.city ? ` · ${e.city}` : ""}
                  </span>
                  {e.description && <p className="mt-1 text-xs text-slate-400 leading-relaxed">{e.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
