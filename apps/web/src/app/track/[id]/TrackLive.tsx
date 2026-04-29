"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MapPin, Navigation, Truck, CheckCircle2, Clock, X, Package } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// We import Leaflet and CSS only on the client
import "leaflet/dist/leaflet.css";

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
  id: string;
  trackingId: string;
  status: string;
  estimatedAt: string | null;
  origin: { city: string; country: string; lat: number | null; lng: number | null };
  destination: { city: string; country: string; lat: number | null; lng: number | null };
  events: TrackEvent[];
};

type EventPoint = {
  lat: number;
  lng: number;
  city: string | null;
  status: string;
  timestamp: string;
};

type MapPoint = {
  lat: number;
  lng: number;
  city: string | null;
  label: "previous" | "current";
};

export function TrackLive({ trackingId }: { trackingId: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const liveMarkerRef = useRef<any>(null);
  const liveTrailRef = useRef<any>(null);
  const travelAnimRef = useRef<number | null>(null);
  
  const [data, setData] = useState<TrackPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  const points = useMemo(() => {
    if (!data) return [] as [number, number][];
    const pts: [number, number][] = [];
    
    if (data.origin.lat != null && data.origin.lng != null) {
      pts.push([data.origin.lat, data.origin.lng]);
    }
    
    data.events.forEach(e => {
      if (e.lat != null && e.lng != null) {
        pts.push([e.lat, e.lng]);
      }
    });

    if (data.destination.lat != null && data.destination.lng != null) {
        pts.push([data.destination.lat, data.destination.lng]);
    }

    return pts;
  }, [data]);

  const eventPoints = useMemo(() => {
    if (!data) return [] as EventPoint[];
    return data.events
      .filter((e): e is TrackEvent & { lat: number; lng: number } => e.lat != null && e.lng != null)
      .map((e) => ({
        lat: e.lat,
        lng: e.lng,
        city: e.city,
        status: e.status,
        timestamp: e.timestamp,
      }));
  }, [data]);

  const previousAndCurrentPoints = useMemo(() => {
    if (!data) return null as { previous: MapPoint; current: MapPoint } | null;

    const fromOrigin =
      data.origin.lat != null && data.origin.lng != null
        ? { lat: data.origin.lat, lng: data.origin.lng, city: data.origin.city }
        : null;
    const fromDestination =
      data.destination.lat != null && data.destination.lng != null
        ? { lat: data.destination.lat, lng: data.destination.lng, city: data.destination.city }
        : null;

    if (eventPoints.length >= 2) {
      const prev = eventPoints[eventPoints.length - 2];
      const curr = eventPoints[eventPoints.length - 1];
      return {
        previous: { lat: prev.lat, lng: prev.lng, city: prev.city, label: "previous" },
        current: { lat: curr.lat, lng: curr.lng, city: curr.city, label: "current" },
      };
    }

    if (eventPoints.length === 1 && fromOrigin) {
      const curr = eventPoints[0];
      return {
        previous: { lat: fromOrigin.lat, lng: fromOrigin.lng, city: fromOrigin.city, label: "previous" },
        current: { lat: curr.lat, lng: curr.lng, city: curr.city, label: "current" },
      };
    }

    if (fromOrigin && fromDestination) {
      return {
        previous: { lat: fromOrigin.lat, lng: fromOrigin.lng, city: fromOrigin.city, label: "previous" },
        current: { lat: fromDestination.lat, lng: fromDestination.lng, city: fromDestination.city, label: "current" },
      };
    }

    return null;
  }, [data, eventPoints]);

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

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!, {
          zoomControl: false,
          attributionControl: false
        });

        const primaryTiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        });
        const fallbackTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap &copy; CARTO",
        });
        primaryTiles.on("tileerror", () => {
          if (!mapInstance.current.hasLayer(fallbackTiles)) {
            fallbackTiles.addTo(mapInstance.current);
          }
        });
        primaryTiles.addTo(mapInstance.current);

        L.control.zoom({ position: "bottomright" }).addTo(mapInstance.current);
        markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      const map = mapInstance.current;
      const markersGroup = markersGroupRef.current!;
      markersGroup.clearLayers();

      const iconA = L.divIcon({
          className: 'custom-pin-a',
          html: `<div style="position:relative; width:30px; height:42px;">
                  <svg viewBox="0 0 384 512" style="fill:#22c55e; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
                  </svg>
                  <span style="position:absolute; top:8px; left:0; right:0; text-align:center; color:white; font-weight:900; font-family:sans-serif; font-size:14px;">A</span>
                 </div>`,
          iconSize: [30, 42],
          iconAnchor: [15, 42]
      });

      const iconB = L.divIcon({
          className: 'custom-pin-b',
          html: `<div style="position:relative; width:30px; height:42px;">
                  <svg viewBox="0 0 384 512" style="fill:#ef4444; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
                  </svg>
                  <span style="position:absolute; top:8px; left:0; right:0; text-align:center; color:white; font-weight:900; font-family:sans-serif; font-size:14px;">B</span>
                 </div>`,
          iconSize: [30, 42],
          iconAnchor: [15, 42]
      });

      const previousPoint = previousAndCurrentPoints?.previous ?? null;
      const currentPoint = previousAndCurrentPoints?.current ?? null;

      if (previousPoint) {
          L.marker([previousPoint.lat, previousPoint.lng], { icon: iconA })
              .addTo(markersGroup)
              .bindPopup(`<div style="font-family:sans-serif; font-weight:bold; color:#1e293b;">Previous Location</div><div style="font-size:12px; color:#64748b;">${previousPoint.city ?? "Unknown city"}</div>`);
      }

      if (currentPoint) {
          L.marker([currentPoint.lat, currentPoint.lng], { icon: iconB })
              .addTo(markersGroup)
              .bindPopup(`<div style="font-family:sans-serif; font-weight:bold; color:#1e293b;">Current Location</div><div style="font-size:12px; color:#64748b;">${currentPoint.city ?? "Unknown city"}</div>`);
      }

      const latestEvent = data.events[data.events.length - 1];
      if (latestEvent?.lat && latestEvent?.lng) {
        L.popup({ closeButton: false, offset: [0, -10] })
          .setLatLng([latestEvent.lat, latestEvent.lng])
          .setContent(`<div style="padding:10px; min-width:140px;">
                          <div style="font-size:10px; font-weight:bold; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Shipment Update</div>
                          <div style="font-size:14px; font-weight:bold; color:#0f172a; margin-top:2px;">${latestEvent.status.replace(/_/g, " ")}</div>
                       </div>`)
          .openOn(map);
      }

      const segmentPoints: [number, number][] =
        previousPoint && currentPoint
          ? [
              [previousPoint.lat, previousPoint.lng],
              [currentPoint.lat, currentPoint.lng],
            ]
          : points;

      if (segmentPoints.length >= 2) {
        if (routePolylineRef.current) {
          routePolylineRef.current.setLatLngs(segmentPoints);
        } else {
          routePolylineRef.current = L.polyline(segmentPoints, {
            color: "#2563eb",
            weight: 5,
            opacity: 0.9,
            lineJoin: "round",
          }).addTo(map);
        }
      }

      if (segmentPoints.length > 0) {
        const bounds = L.latLngBounds(segmentPoints);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true });
      }

      if (!liveTrailRef.current) {
        liveTrailRef.current = L.polyline([], {
          color: "#22d3ee",
          weight: 4,
          opacity: 0.85,
          lineJoin: "round",
          dashArray: "8 10",
        }).addTo(map);
      }

      const currentPos = segmentPoints[segmentPoints.length - 1];
      if (currentPos) {
        const animatedIcon = L.divIcon({
          className: "live-transit-marker",
          html: `<div style="position:relative; width:24px; height:24px;">
                  <div style="position:absolute; inset:0; border-radius:9999px; background:rgba(6,182,212,0.28); animation:ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="position:absolute; inset:4px; border-radius:9999px; background:#06b6d4; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; box-shadow:0 2px 8px rgba(0,0,0,0.4);">🚚</div>
                </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        if (!liveMarkerRef.current) {
          liveMarkerRef.current = L.marker(currentPos, { icon: animatedIcon }).addTo(map);
        } else {
          liveMarkerRef.current.setLatLng(currentPos);
        }
      }

      setLeafletReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [data, points, previousAndCurrentPoints]);

  useEffect(() => {
    if (!leafletReady || !mapInstance.current || !previousAndCurrentPoints) return;
    let stop = false;
    const map = mapInstance.current;
    const start: [number, number] = [previousAndCurrentPoints.previous.lat, previousAndCurrentPoints.previous.lng];
    const end: [number, number] = [previousAndCurrentPoints.current.lat, previousAndCurrentPoints.current.lng];
    const duration = 9000;
    const startedAt = performance.now();
    const segment: [number, number][] = [];

    if (travelAnimRef.current) {
      cancelAnimationFrame(travelAnimRef.current);
    }

    const tick = (now: number) => {
      if (stop) return;
      const raw = ((now - startedAt) % duration) / duration;
      const t = raw < 0.5 ? raw * 2 : 2 - raw * 2;
      const eased = t * t * (3 - 2 * t);
      const lat = start[0] + (end[0] - start[0]) * eased;
      const lng = start[1] + (end[1] - start[1]) * eased;
      const pos: [number, number] = [lat, lng];

      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng(pos);
      }
      segment.push(pos);
      if (liveTrailRef.current) {
        liveTrailRef.current.setLatLngs(segment.slice(-30));
      }
      map.panTo(pos, { animate: true, duration: 0.4 });

      travelAnimRef.current = requestAnimationFrame(tick);
    };

    travelAnimRef.current = requestAnimationFrame(tick);
    return () => {
      stop = true;
      if (travelAnimRef.current) {
        cancelAnimationFrame(travelAnimRef.current);
        travelAnimRef.current = null;
      }
    };
  }, [previousAndCurrentPoints, leafletReady]);

  useEffect(() => {
    if (!data || !data.id || !supabase) return () => {};
    
    const channel = supabase
      .channel(`tracking_${data.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "TrackingEvent", filter: `shipmentId=eq.${data.id}` },
        (payload) => {
          const newEvent = payload.new;
          setData((prev) => {
            if (!prev) return prev;
            const ev: TrackEvent = {
              status: newEvent.status,
              description: newEvent.description || "Live operational update",
              city: newEvent.city || null,
              country: newEvent.country || null,
              lat: newEvent.lat,
              lng: newEvent.lng,
              timestamp: newEvent.timestamp,
            };
            return { ...prev, status: newEvent.status, events: [...prev.events, ev] };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data?.id]);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-red-500/10 p-4 mb-4">
            <X className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Tracking ID Not Found</h2>
        <p className="text-slate-400 mt-2">Please check your tracking number and try again.</p>
        <Link href="/track" className="mt-6 text-teal hover:underline font-bold">Try another number</Link>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-slate-800 border-t-teal animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Connecting to NexShip satellites...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-900/50 border border-slate-800 p-6 backdrop-blur">
        <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-teal/10 p-3">
                <Truck className="h-6 w-6 text-teal" />
            </div>
            <div>
                <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Track Shipment</h1>
                <p className="text-2xl font-black text-white tracking-tighter">{data.trackingId}</p>
            </div>
        </div>
        <div className="flex gap-8">
            <div className="hidden sm:block">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Current Status</p>
                <div className="mt-1 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
                    </span>
                    <p className="text-sm font-bold text-white uppercase">{data.status.replace(/_/g, " ")}</p>
                </div>
            </div>
            <div className="hidden md:block">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Est. Delivery</p>
                <p className="mt-1 text-sm font-bold text-white uppercase">
                    {data.estimatedAt ? new Date(data.estimatedAt).toLocaleDateString() : "Calculating..."}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
            <div className="rounded-[2rem] bg-slate-900/40 border border-slate-800 p-4 md:p-5 backdrop-blur-sm">
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 shadow-xl bg-white relative">
                    <div ref={mapRef} className="h-[420px] md:h-[500px] w-full" />
                </div>
                
                <div className="mt-4 rounded-[1.5rem] bg-white p-6 border border-slate-200">
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                            className="bg-green-500 h-full transition-all duration-1000" 
                            style={{ width: data.status === "DELIVERED" ? "100%" : "65%" }}
                        />
                    </div>
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordered</span>
                            <span className="text-xs font-bold text-slate-800 mt-1">Confirmed</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Send [A]</span>
                            <span className="text-xs font-bold text-slate-800 mt-1">{data.origin.city}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Transit</span>
                            <span className="text-xs font-bold text-slate-800 mt-1">Processing</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receiving</span>
                            <span className="text-xs font-bold text-slate-800 mt-1">{data.destination.city}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-[2rem] bg-slate-900/40 border border-slate-800 p-8 backdrop-blur-sm">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Journey Log
                </h3>
                <div className="space-y-8">
                    {data.events.map((e, i) => (
                        <div key={i} className="flex gap-6 group">
                            <div className="flex flex-col items-center">
                                <div className={`h-4 w-4 rounded-full border-4 border-navy ${i === data.events.length - 1 ? 'bg-teal' : 'bg-slate-700'}`} />
                                {i < data.events.length - 1 && <div className="w-0.5 flex-1 bg-slate-800 my-1" />}
                            </div>
                            <div className="pb-8">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-white uppercase tracking-widest">{e.status.replace(/_/g, " ")}</span>
                                    <span className="text-[10px] font-bold text-slate-500">{new Date(e.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-2 font-medium">{e.description || "Package movement recorded"}</p>
                                {e.city && <p className="text-[10px] font-bold text-teal mt-1 uppercase tracking-widest">📍 {e.city}, {e.country}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Consignment Details</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">From</p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{data.origin.city}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase">To</p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{data.destination.city}</p>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Weight</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">2.45 KG</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Service Type</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">Global Express Saver</p>
                    </div>
                </div>
            </div>

            <div className="rounded-[2rem] bg-teal p-8 shadow-xl shadow-teal/20 text-navy">
                <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                    <p className="font-black uppercase tracking-tighter text-lg">Insured Shipment</p>
                </div>
                <p className="text-sm font-bold opacity-80 leading-relaxed">
                    This shipment is covered by NexShip Premium Protection. Real-time monitoring active.
                </p>
            </div>

            <Link 
                href="/contact"
                className="block w-full rounded-[2rem] bg-slate-900 py-6 text-center text-sm font-black text-white uppercase tracking-widest hover:bg-black transition-all shadow-xl"
            >
                Support Center
            </Link>
        </div>
      </div>
    </div>
  );
}
