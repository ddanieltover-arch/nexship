# API Design Reference

Base URL: `/api/v1`

All authenticated routes require: `Authorization: Bearer <token>`

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Create account |
| POST | `/auth/login` | None | Get JWT tokens |
| POST | `/auth/refresh` | Refresh token | Rotate access token |
| POST | `/auth/logout` | User | Invalidate session |
| GET | `/auth/me` | User | Get current user profile |
| PATCH | `/auth/me` | User | Update profile |

### POST /auth/register
```json
Request: { "email": "str", "password": "str", "name": "str", "phone": "str?" }
Response 201: { "user": User, "accessToken": "str", "refreshToken": "str" }
Errors: 409 (email taken), 400 (validation)
```

---

## Shipments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/shipments` | Customer+ | List own shipments |
| POST | `/shipments` | Customer+ | Create shipment |
| GET | `/shipments/:id` | Owner/Admin | Get shipment detail |
| PATCH | `/shipments/:id` | Staff/Admin | Update shipment |
| DELETE | `/shipments/:id` | Admin | Delete shipment |
| PATCH | `/shipments/:id/status` | Staff/Admin | Update status + create tracking event |
| POST | `/shipments/:id/documents` | Owner/Staff | Upload document |
| GET | `/shipments/:id/events` | Owner/Admin | Get tracking timeline |

### GET /shipments (query params)
```
?status=IN_TRANSIT
?page=1&limit=20
?search=trackingId or address
?from=2024-01-01&to=2024-12-31
```

---

## Public Tracking

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/track/:trackingId` | None | Get shipment + events by tracking ID |

### Response
```json
{
  "trackingId": "str",
  "status": "IN_TRANSIT",
  "estimatedAt": "ISO8601",
  "origin": { "city": "str", "country": "str" },
  "destination": { "city": "str", "country": "str" },
  "events": [
    { "status": "str", "description": "str", "city": "str", "lat": 0, "lng": 0, "timestamp": "ISO8601" }
  ]
}
```

---

## WebSocket — Live Tracking

```
WS /ws/track/:trackingId
```

**Server → Client events:**
```json
{ "event": "location_update", "data": { "lat": 0, "lng": 0, "status": "str", "timestamp": "ISO8601" } }
{ "event": "status_change", "data": { "status": "str", "description": "str" } }
{ "event": "delivered", "data": { "timestamp": "ISO8601" } }
```

**Client → Server events:**
```json
{ "event": "subscribe", "trackingId": "str" }
{ "event": "unsubscribe", "trackingId": "str" }
```

---

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/shipments` | Admin | All shipments with filters |
| GET | `/admin/users` | Admin | All users |
| PATCH | `/admin/users/:id/role` | Admin | Change user role |
| DELETE | `/admin/users/:id` | Admin | Delete user |
| GET | `/admin/analytics/overview` | Admin/Staff | KPI summary |
| GET | `/admin/analytics/shipments` | Admin/Staff | Volume over time |
| GET | `/admin/analytics/delivery-rate` | Admin/Staff | Success rate metrics |

### GET /admin/analytics/overview response
```json
{
  "activeShipments": 0,
  "deliveredToday": 0,
  "deliveryRate": 0.0,
  "avgTransitHours": 0,
  "totalRevenue": 0
}
```

---

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | User | List user notifications |
| PATCH | `/notifications/:id/read` | User | Mark as read |
| PATCH | `/notifications/read-all` | User | Mark all as read |

---

## Error Format (all endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Standard error codes
- `VALIDATION_ERROR` — 400
- `UNAUTHORIZED` — 401
- `FORBIDDEN` — 403
- `NOT_FOUND` — 404
- `CONFLICT` — 409
- `RATE_LIMITED` — 429
- `INTERNAL_ERROR` — 500
