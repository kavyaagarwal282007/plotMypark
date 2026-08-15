# Smart Street Parking — Backend

FastAPI + PostgreSQL (PostGIS) backend for the SIH "Smart and Effective
Realtime Management of Street Parking" project.

## Architecture

```
Website (frontend team)
    │  REST + WebSocket
    ▼
Backend API (this repo)
    │
 ┌──┴──────────────┐
 ▼                  ▼
PostgreSQL      AI service
(+ PostGIS)     (YOLO / OpenCV — teammate's repo)
```

AI events flow in via `POST /api/events/ai`, get written to the DB, and are
instantly pushed to all connected clients over `/ws/parking`.

## Setup

1. **Install PostgreSQL with PostGIS** (or use a hosted one — Render/Railway/
   Supabase all support it).
   ```sql
   CREATE DATABASE smart_parking;
   \c smart_parking
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate   # venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # edit .env with your real DATABASE_URL and a random SECRET_KEY
   ```

4. **Seed demo data** (creates sample zones + admin/citizen test accounts)
   ```bash
   python seed.py
   ```

5. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```
   API docs (auto-generated): http://localhost:8000/docs

## Demo accounts (after seeding)

| Role    | Email                 | Password    |
|---------|------------------------|-------------|
| Admin   | admin@parking.gov.in   | admin123    |
| Citizen | citizen@example.com    | citizen123  |

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a citizen account |
| POST | `/api/auth/login` | — | Get JWT access token |
| GET | `/api/auth/me` | ✅ | Current user info |
| GET | `/api/parking` | — | List all parking zones |
| GET | `/api/parking/nearby?lat=&lng=&radius_m=` | — | **Smart recommendation**: ranked by availability + distance + traffic |
| GET | `/api/parking/{id}` | — | Zone detail with live availability + dynamic price |
| POST | `/api/parking/{id}/reserve` | ✅ | Reserve first free slot in a zone |
| POST | `/api/parking/{id}/cancel?slot_id=` | ✅ | Cancel a reservation |
| POST | `/api/booking` | ✅ | Book a specific slot for a duration |
| GET | `/api/bookings` | ✅ | Current user's bookings |
| GET | `/api/prediction?zone_id=` | — | 15/30/60-min availability forecast |
| POST | `/api/events/ai` | — (internal, called by AI service) | AI reports car-in/car-out for a slot |
| POST | `/api/violations` | — (internal, called by AI service) | AI reports illegal parking |
| GET | `/api/analytics` | ✅ admin | City-wide occupancy/revenue dashboard data |
| GET | `/api/violations` | ✅ admin | List reported violations |
| POST | `/api/violations/{id}/verify?confirmed=` | ✅ admin | Admin confirms/dismisses a violation |
| WS | `/ws/parking` | — | Real-time push: slot updates, violation alerts |

## Dynamic pricing formula

```
price = base_price × (1 + α × occupancy_rate) × time_multiplier
```
- `α = 0.8` (tunable, in `app/recommendation.py`)
- `time_multiplier = 1.4` during peak hours (8–11 AM, 5–8 PM), else `1.0`

## Smart recommendation score

```
score = 0.5 × availability_rate + 0.3 × distance_score + 0.2 × traffic_score
```
Zones score ≥0.7 → ✅ recommended, ≥0.45 → ⚠️ ok, else → ❌ avoid.
`traffic_level` is currently a placeholder ("medium") — wire in a real
traffic API or the AI team's congestion signal when ready; the response
shape won't need to change.

## Integration notes for teammates

- **Frontend**: point API calls at `http://localhost:8000/api/...`, connect
  to `ws://localhost:8000/ws/parking` for live updates. CORS is open (`*`)
  for now — tighten before final submission.
- **AI**: call `POST /api/events/ai?slot_id=...&event_type=car_in` (or
  `car_out`) whenever your model detects a state change. Call
  `POST /api/violations` when a vehicle is detected outside a valid zone.
  Optionally write rows to the `predictions` table directly (or add an
  endpoint) once your forecasting model is ready — `/api/prediction`
  already prefers stored predictions over the built-in mock heuristic.

## Next steps / future scope (good for your PPT)

- Replace mock prediction heuristic with a real time-series/ML model
- Real payment gateway integration (Razorpay/UPI)
- Alembic migrations instead of `create_all`
- Rate limiting + refresh tokens
- Push notifications (slot about to expire, violation confirmed)
