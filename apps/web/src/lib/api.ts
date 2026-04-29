import { getSupabaseClient } from "./supabase";

export const API_BASE = "";
export const WS_BASE = process.env.NEXT_PUBLIC_WS_URL?.trim() || "";

export type ApiErrorBody = {
  error: { code: string; message: string; details?: Record<string, unknown> };
};

type SbUser = {
  id: string;
  email?: string;
  user_metadata?: { name?: string; role?: string };
  app_metadata?: { role?: string };
};

function toRole(sbUser: SbUser): "CUSTOMER" | "STAFF" | "ADMIN" {
  const appRole = String(sbUser.app_metadata?.role ?? "").toUpperCase();
  const userRole = String(sbUser.user_metadata?.role ?? "").toUpperCase();
  const role = appRole || userRole;
  if (role === "ADMIN" || role === "STAFF") return role;
  return "CUSTOMER";
}

async function resolveRole(sbUser: SbUser | null): Promise<"CUSTOMER" | "STAFF" | "ADMIN"> {
  if (!sbUser) return "CUSTOMER";
  const fromMeta = toRole(sbUser);
  if (fromMeta !== "CUSTOMER") return fromMeta;

  const sb = getSupabaseClient();
  const byId = await sb.from("User").select("role").eq("id", sbUser.id).maybeSingle();
  const roleValue = String(byId.data?.role ?? "").toUpperCase();
  if (roleValue === "ADMIN" || roleValue === "STAFF") return roleValue;

  if (sbUser.email) {
    const byEmail = await sb.from("User").select("role").eq("email", sbUser.email).maybeSingle();
    const emailRoleValue = String(byEmail.data?.role ?? "").toUpperCase();
    if (emailRoleValue === "ADMIN" || emailRoleValue === "STAFF") return emailRoleValue;
  }
  return "CUSTOMER";
}

async function getAuthedUser(token?: string | null): Promise<SbUser | null> {
  const sb = getSupabaseClient();
  if (token) {
    const { data, error } = await sb.auth.getUser(token);
    if (error) throw new Error(error.message);
    return data.user as SbUser;
  }
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user as SbUser;
}

function parseAddress(addr: string) {
  const parts = addr.split(",");
  return {
    street: parts[0]?.trim() || "Main St",
    city: parts[1]?.trim() || "London",
    country: parts[2]?.trim() || "UK",
    postalCode: parts[3]?.trim() || "0000",
  };
}

function mkid() {
  return crypto.randomUUID().replace(/-/g, "");
}

async function queueEmail(eventType: string, payload: Record<string, unknown>) {
  const sb = getSupabaseClient();
  try {
    await sb.from("EmailQueue").insert({
      id: mkid(),
      eventType,
      payload,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Optional queue table; ignore if not provisioned yet.
  }
}

async function supabaseApiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null }
): Promise<T> {
  const sb = getSupabaseClient();
  const method = (options.method ?? "GET").toUpperCase();
  const body =
    typeof options.body === "string" && options.body.length > 0
      ? (JSON.parse(options.body) as Record<string, unknown>)
      : null;
  const url = new URL(path, "http://nexship.local");
  const p = url.pathname;
  const authed = await getAuthedUser(options.token);
  const role = await resolveRole(authed);

  if (p === "/admin/shipments" && method === "GET") {
    if (role !== "ADMIN" && role !== "STAFF") throw new Error("Forbidden");
    const status = url.searchParams.get("status");
    let q = sb
      .from("Shipment")
      .select("id,trackingId,status,carrier,receiverName,createdAt,customerId,originId,destinationId")
      .order("createdAt", { ascending: false });
    if (status) q = q.eq("status", status);
    const { data: shipments, error } = await q;
    if (error) throw new Error(error.message);
    const customerIds = [...new Set((shipments ?? []).map((s) => s.customerId).filter(Boolean))];
    const addressIds = [
      ...new Set((shipments ?? []).flatMap((s) => [s.originId, s.destinationId]).filter(Boolean)),
    ];
    const [{ data: customers }, { data: addresses }] = await Promise.all([
      customerIds.length
        ? sb.from("User").select("id,email,name").in("id", customerIds)
        : Promise.resolve({ data: [] as any[] }),
      addressIds.length
        ? sb.from("Address").select("id,street,city,state,country,postalCode").in("id", addressIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const customerMap = new Map((customers ?? []).map((c: any) => [c.id, c]));
    const addressMap = new Map((addresses ?? []).map((a: any) => [a.id, a]));
    return {
      items: (shipments ?? []).map((s: any) => ({
        ...s,
        customer: customerMap.get(s.customerId) ?? { id: s.customerId, email: "", name: null },
        origin: addressMap.get(s.originId) ?? { street: "", city: "", state: null, country: "" },
        destination:
          addressMap.get(s.destinationId) ?? { street: "", city: "", state: null, country: "" },
      })),
      total: shipments?.length ?? 0,
      page: 1,
      limit: shipments?.length ?? 0,
    } as T;
  }

  if (p === "/admin/users" && method === "GET") {
    if (role !== "ADMIN" && role !== "STAFF") throw new Error("Forbidden");
    const { data, error } = await sb
      .from("User")
      .select("id,email,name,role,createdAt")
      .order("createdAt", { ascending: false });
    if (error) throw new Error(error.message);
    return { users: data ?? [] } as T;
  }

  if (p === "/shipments" && method === "GET") {
    if (!authed) throw new Error("Unauthorized");
    const limit = Number(url.searchParams.get("limit") ?? "50");
    let q = sb
      .from("Shipment")
      .select("id,trackingId,status,weightKg,originId,destinationId,customerId")
      .order("createdAt", { ascending: false })
      .limit(limit);
    if (role === "CUSTOMER") q = q.eq("customerId", authed.id);
    const { data: shipments, error } = await q;
    if (error) throw new Error(error.message);
    const ids = [
      ...new Set((shipments ?? []).flatMap((s) => [s.originId, s.destinationId]).filter(Boolean)),
    ];
    const { data: addresses } = ids.length
      ? await sb.from("Address").select("id,city,country").in("id", ids)
      : { data: [] as any[] };
    const map = new Map((addresses ?? []).map((a: any) => [a.id, a]));
    return {
      items: (shipments ?? []).map((s: any) => ({
        ...s,
        origin: map.get(s.originId) ?? { city: "", country: "" },
        destination: map.get(s.destinationId) ?? { city: "", country: "" },
      })),
    } as T;
  }

  if (p === "/shipments" && method === "POST") {
    if (!authed) throw new Error("Unauthorized");
    const originIn = body?.origin as any;
    const destIn = body?.destination as any;
    const originPayload = originIn?.street ? originIn : parseAddress(String(originIn ?? ""));
    const destinationPayload = destIn?.street ? destIn : parseAddress(String(destIn ?? ""));
    const now = new Date().toISOString();
    const { data: origin, error: oErr } = await sb
      .from("Address")
      .insert({ id: mkid(), ...originPayload })
      .select()
      .single();
    if (oErr) throw new Error(oErr.message);
    const { data: destination, error: dErr } = await sb
      .from("Address")
      .insert({ id: mkid(), ...destinationPayload })
      .select()
      .single();
    if (dErr) throw new Error(dErr.message);
    const trackingId = `NXSP${Math.floor(100000000 + Math.random() * 900000000)}`;
    const insertPayload = {
      id: mkid(),
      trackingId,
      status: "CREATED",
      customerId: authed.id,
      originId: origin.id,
      destinationId: destination.id,
      description: body?.description ?? null,
      weightKg: body?.weightKg ?? null,
      shipmentType: body?.shipmentType ?? null,
      carrier: body?.carrier ?? null,
      paymentMethod: body?.paymentMethod ?? null,
      senderName: body?.senderName ?? null,
      senderPhone: body?.senderPhone ?? null,
      senderEmail: body?.senderEmail ?? null,
      receiverName: body?.receiverName ?? null,
      receiverPhone: body?.receiverPhone ?? null,
      receiverEmail: body?.receiverEmail ?? null,
      departureAt: body?.departureAt ?? null,
      estimatedAt: body?.estimatedAt ?? null,
      notes: body?.notes ?? null,
      updatedAt: now,
    };
    const { data: shipment, error: sErr } = await sb
      .from("Shipment")
      .insert(insertPayload)
      .select()
      .single();
    if (sErr) throw new Error(sErr.message);
    await sb.from("TrackingEvent").insert({
      id: mkid(),
      shipmentId: shipment.id,
      status: "CREATED",
      description: "Shipment created and scheduled",
      city: origin.city ?? null,
      country: origin.country ?? null,
      lat: origin.lat ?? null,
      lng: origin.lng ?? null,
    });
    await sb.from("Notification").insert({
      id: mkid(),
      userId: authed.id,
      shipmentId: shipment.id,
      type: "IN_APP",
      subject: "Shipment created",
      message: `Shipment ${shipment.trackingId} has been created successfully.`,
      read: false,
      sentAt: new Date().toISOString(),
    });
    await queueEmail("shipment_created", {
      shipmentId: shipment.id,
      trackingId: shipment.trackingId,
      senderEmail: shipment.senderEmail,
      receiverEmail: shipment.receiverEmail,
    });
    return { shipment } as T;
  }

  if (p.match(/^\/shipments\/[^/]+$/) && method === "DELETE") {
    if (role !== "ADMIN") throw new Error("Forbidden");
    const id = p.split("/")[2];
    const { error } = await sb.from("Shipment").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true } as T;
  }

  if (p.match(/^\/shipments\/[^/]+$/) && method === "GET") {
    if (!authed) throw new Error("Unauthorized");
    const id = p.split("/")[2];
    const { data: shipment, error } = await sb.from("Shipment").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    const [{ data: origin }, { data: destination }] = await Promise.all([
      sb.from("Address").select("*").eq("id", shipment.originId).single(),
      sb.from("Address").select("*").eq("id", shipment.destinationId).single(),
    ]);
    return { shipment: { ...shipment, origin, destination } } as T;
  }

  if (p.match(/^\/shipments\/[^/]+$/) && method === "PATCH") {
    if (!authed) throw new Error("Unauthorized");
    const id = p.split("/")[2];
    const patch: Record<string, unknown> = { ...(body ?? {}) };
    delete patch.origin;
    delete patch.destination;
    const { data: existing, error: getErr } = await sb
      .from("Shipment")
      .select("originId,destinationId")
      .eq("id", id)
      .single();
    if (getErr) throw new Error(getErr.message);
    if (body?.origin) {
      const { error: oErr } = await sb.from("Address").update(body.origin).eq("id", existing.originId);
      if (oErr) throw new Error(oErr.message);
    }
    if (body?.destination) {
      const { error: dErr } = await sb
        .from("Address")
        .update(body.destination)
        .eq("id", existing.destinationId);
      if (dErr) throw new Error(dErr.message);
    }
    const { data: shipment, error } = await sb.from("Shipment").update(patch).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return { shipment } as T;
  }

  if (p.match(/^\/shipments\/[^/]+\/status$/) && method === "PATCH") {
    if (!authed) throw new Error("Unauthorized");
    const id = p.split("/")[2];
    const status = String(body?.status ?? "");
    const { data: shipment, error: uErr } = await sb
      .from("Shipment")
      .update({ status, deliveredAt: status === "DELIVERED" ? new Date().toISOString() : null })
      .eq("id", id)
      .select()
      .single();
    if (uErr) throw new Error(uErr.message);
    const eventPayload = {
      id: mkid(),
      shipmentId: id,
      status,
      description: body?.description ?? `Status updated to ${status}`,
      city: body?.city ?? null,
      country: body?.country ?? null,
      lat: body?.lat ?? null,
      lng: body?.lng ?? null,
      timestamp: body?.timestamp ?? new Date().toISOString(),
    };
    const { data: event, error: eErr } = await sb.from("TrackingEvent").insert(eventPayload).select().single();
    if (eErr) throw new Error(eErr.message);
    if (shipment.customerId) {
      await sb.from("Notification").insert({
        id: mkid(),
        userId: shipment.customerId,
        shipmentId: shipment.id,
        type: "IN_APP",
        subject: "Shipment update",
        message: `Your shipment ${shipment.trackingId} is now ${status.replace(/_/g, " ")}.`,
        read: false,
        sentAt: new Date().toISOString(),
      });
    }
    await queueEmail("shipment_status_updated", {
      shipmentId: shipment.id,
      trackingId: shipment.trackingId,
      status,
    });
    return { shipment, event } as T;
  }

  if (p === "/notifications" && method === "GET") {
    if (!authed) throw new Error("Unauthorized");
    const { data, error } = await sb
      .from("Notification")
      .select("*")
      .eq("userId", authed.id)
      .order("sentAt", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { items: data ?? [] } as T;
  }

  if (p.match(/^\/notifications\/[^/]+\/read$/) && method === "PATCH") {
    if (!authed) throw new Error("Unauthorized");
    const id = p.split("/")[2];
    const { error } = await sb
      .from("Notification")
      .update({ read: true })
      .eq("id", id)
      .eq("userId", authed.id);
    if (error) throw new Error(error.message);
    return { updated: 1 } as T;
  }

  if (p === "/notifications/read-all" && method === "PATCH") {
    if (!authed) throw new Error("Unauthorized");
    const { error } = await sb
      .from("Notification")
      .update({ read: true })
      .eq("userId", authed.id)
      .eq("read", false);
    if (error) throw new Error(error.message);
    return { ok: true } as T;
  }

  if (p === "/admin/analytics/overview" && method === "GET") {
    const { data: shipments, error } = await sb.from("Shipment").select("status,createdAt,deliveredAt");
    if (error) throw new Error(error.message);
    const all = shipments ?? [];
    const activeShipments = all.filter((s: any) => !["DELIVERED", "FAILED", "RETURNED"].includes(s.status)).length;
    const deliveredTotal = all.filter((s: any) => s.status === "DELIVERED").length;
    const failedTotal = all.filter((s: any) => s.status === "FAILED").length;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const deliveredToday = all.filter((s: any) => s.status === "DELIVERED" && s.deliveredAt && new Date(s.deliveredAt) >= startOfDay).length;
    const finished = deliveredTotal + failedTotal;
    const deliveryRate = finished === 0 ? 0 : deliveredTotal / finished;
    const hours = all
      .filter((s: any) => s.deliveredAt)
      .map((s: any) => (new Date(s.deliveredAt).getTime() - new Date(s.createdAt).getTime()) / 3600000);
    const avgTransitHours = hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : 0;
    return { activeShipments, deliveredToday, deliveryRate, avgTransitHours, totalRevenue: 0 } as T;
  }

  if (p.match(/^\/track\/[^/]+$/) && method === "GET") {
    const trackingId = decodeURIComponent(p.split("/")[2]);
    const { data: shipment, error } = await sb
      .from("Shipment")
      .select("*")
      .eq("trackingId", trackingId)
      .single();
    if (error || !shipment) throw new Error("Tracking ID not found");
    const [{ data: origin }, { data: destination }, { data: events }] = await Promise.all([
      sb.from("Address").select("city,country,lat,lng").eq("id", shipment.originId).single(),
      sb.from("Address").select("city,country,lat,lng").eq("id", shipment.destinationId).single(),
      sb.from("TrackingEvent").select("*").eq("shipmentId", shipment.id).order("timestamp", { ascending: true }),
    ]);
    return {
      trackingId: shipment.trackingId,
      status: shipment.status,
      estimatedAt: shipment.estimatedAt,
      origin,
      destination,
      events: events ?? [],
    } as T;
  }

  if (p === "/contact" && method === "POST") {
    const now = new Date().toISOString();
    const { error } = await sb.from("LogisticsNews").insert({
      id: mkid(),
      title: `Contact: ${body?.subject ?? "General Inquiry"}`,
      content: `${body?.message ?? ""}`,
      source: String(body?.email ?? ""),
      url: null,
      imageUrl: null,
      published: false,
      updatedAt: now,
    });
    if (error) throw new Error(error.message);
    return { ok: true } as T;
  }

  if (p === "/chat/threads" && method === "GET") {
    if (!authed) throw new Error("Unauthorized");
    if (role !== "ADMIN" && role !== "STAFF") throw new Error("Forbidden");
    const { data: messages, error } = await sb
      .from("Message")
      .select("senderId,receiverId,createdAt")
      .order("createdAt", { ascending: false });
    if (error) throw new Error(error.message);
    const userIds = new Set<string>();
    for (const m of messages ?? []) {
      if (m.senderId !== authed.id) userIds.add(m.senderId);
      if (m.receiverId !== authed.id) userIds.add(m.receiverId);
    }
    const ids = [...userIds];
    const { data: users } = ids.length
      ? await sb.from("User").select("id,name,email,avatarUrl").in("id", ids)
      : { data: [] as any[] };
    return { threads: users ?? [] } as T;
  }

  if (p.match(/^\/chat\/messages\/[^/]+$/) && method === "GET") {
    if (!authed) throw new Error("Unauthorized");
    const otherIdRaw = decodeURIComponent(p.split("/")[3]);
    let otherId = otherIdRaw;
    if (otherIdRaw === "admin") {
      const { data: admin } = await sb
        .from("User")
        .select("id")
        .in("role", ["ADMIN", "STAFF"])
        .limit(1)
        .maybeSingle();
      otherId = admin?.id ?? otherIdRaw;
    }
    const { data: messages, error } = await sb
      .from("Message")
      .select("*")
      .or(`and(senderId.eq.${authed.id},receiverId.eq.${otherId}),and(senderId.eq.${otherId},receiverId.eq.${authed.id})`)
      .order("createdAt", { ascending: true });
    if (error) throw new Error(error.message);
    return { messages: messages ?? [] } as T;
  }

  if (p === "/chat/messages" && method === "POST") {
    if (!authed) throw new Error("Unauthorized");
    let receiverId = String(body?.receiverId ?? "");
    if (!receiverId || receiverId === "admin") {
      const { data: admin } = await sb
        .from("User")
        .select("id")
        .in("role", ["ADMIN", "STAFF"])
        .limit(1)
        .maybeSingle();
      if (!admin?.id) throw new Error("No admin available");
      receiverId = admin.id;
    }
    const { data: message, error } = await sb
      .from("Message")
      .insert({ id: mkid(), senderId: authed.id, receiverId, content: String(body?.content ?? "") })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { message } as T;
  }

  if (p === "/support/message" && method === "POST") {
    const email = String(body?.email ?? "");
    const name = String(body?.name ?? "");
    const content = String(body?.content ?? "");
    if (!email || !content) throw new Error("Invalid support message");
    const now = new Date().toISOString();
    let { data: guest } = await sb.from("User").select("id").eq("email", email).maybeSingle();
    if (!guest?.id) {
      const { data: created, error: cErr } = await sb
        .from("User")
        .insert({ id: mkid(), email, name, role: "CUSTOMER", updatedAt: now })
        .select("id")
        .single();
      if (cErr) throw new Error(cErr.message);
      guest = created;
    }
    const { data: admin } = await sb
      .from("User")
      .select("id")
      .in("role", ["ADMIN", "STAFF"])
      .limit(1)
      .maybeSingle();
    if (!admin?.id) throw new Error("No support admin available");
    const { error } = await sb.from("Message").insert({
      id: mkid(),
      senderId: guest.id,
      receiverId: admin.id,
      content,
    });
    if (error) throw new Error(error.message);
    return { ok: true } as T;
  }

  if (p === "/support/messages" && method === "GET") {
    const email = url.searchParams.get("email");
    if (!email) throw new Error("Email is required");
    const { data: guest } = await sb.from("User").select("id").eq("email", email).maybeSingle();
    if (!guest?.id) return { messages: [], userId: null } as T;
    const { data: admin } = await sb
      .from("User")
      .select("id")
      .in("role", ["ADMIN", "STAFF"])
      .limit(1)
      .maybeSingle();
    if (!admin?.id) return { messages: [], userId: guest.id } as T;
    const { data: messages, error } = await sb
      .from("Message")
      .select("*")
      .or(`and(senderId.eq.${guest.id},receiverId.eq.${admin.id}),and(senderId.eq.${admin.id},receiverId.eq.${guest.id})`)
      .order("createdAt", { ascending: true });
    if (error) throw new Error(error.message);
    return { messages: messages ?? [], userId: guest.id } as T;
  }

  throw new Error(`Unsupported Supabase route: ${method} ${p}`);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  return supabaseApiFetch<T>(path, options);
}
