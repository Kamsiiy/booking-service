# booking-service

A Booking/Reservation service built with **Bun.js**, **TypeScript**, and **PostgreSQL** (via **TypeORM**), following the same structure as our other services: `models/schemas` (TypeORM entities), `forms` (typed payloads), `services` (business logic), `controllers`, and `routes`.

Routing uses Bun's native `Bun.serve({ routes })` — no custom router class.

---

## Prerequisites

- [Bun](https://bun.sh/) v1.2+ (native route object support)
- PostgreSQL v14+, running locally (no Docker for this project)

## Installation

```bash
git clone <this-repo-url>
cd booking-service
bun install
cp .env.example .env
```

Update `.env` with your local Postgres credentials, then create the database:

```bash
createdb booking_service
```

## Running migrations

```bash
bun run migrate:db
```

## Running the app

```bash
bun start
```

Server starts at `http://localhost:3000`.

## Project Structure

```
src/
  models/schemas/   # TypeORM EntitySchema definitions
  forms/            # Typed entity + create/update payload interfaces
  services/         # Business logic, extends BaseService for common CRUD
  controllers/      # Request handling, calls services, returns Response via HttpResponse
  routes/           # Bun.serve route objects, one per feature, merged in app.ts
  database/migrations/
  common/HttpResponse.ts
  data-source.ts
  app.ts
index.ts
```

## Endpoints

Baseline (already wired up):

```bash
curl http://localhost:3000/health

curl http://localhost:3000/resources

curl http://localhost:3000/resources/1

```
### Feature 3 — Search & Policy

#### Availability Search

Search for resources of a specific type that are available for the entire requested time range:

```bash
curl "http://localhost:3000/availability?type=room&from=2026-08-01T10:00:00Z&to=2026-08-01T12:00:00Z"
```

#### Booking History

Get past bookings with pagination:

```bash
curl "http://localhost:3000/bookings/history?page=1&limit=10"
```

Filter booking history by resource:

```bash
curl "http://localhost:3000/bookings/history?page=1&limit=10&resource_id=1"
```

Filter booking history by status:

```bash
curl "http://localhost:3000/bookings/history?page=1&limit=10&status=confirmed"
```

Filter by both resource and status:

```bash
curl "http://localhost:3000/bookings/history?page=1&limit=10&resource_id=1&status=cancelled"
```

#### Cancellation Policy

Cancel a booking:

```bash
curl -X PATCH "http://localhost:3000/bookings/1/cancel"
```

Cancellation is only allowed when there are at least 2 hours before the booking's `start_time`. Otherwise, the API returns `400` with an explanatory error message.

The rest of the endpoints (resource CRUD, availability windows, blocking, bookings, search, cancellation policy, history) are being built out across three feature branches — see `ASSIGNMENT.md`. Add curl examples for each endpoint here as you build it.


## Authentication

### Environment variable
Add to your `.env`:

​```
JWT_SECRET=your-secret-key
​```

### Sign up

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Sign in

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Response includes a `token` (JWT), valid for 1 hour.

### Protected routes

Resource block/unblock and all booking create/update/cancel routes require a valid token.

Without a token — returns 401:

```bash
curl -X PATCH http://localhost:3000/resources/1/block
```

With a token:

```bash
curl -X PATCH http://localhost:3000/resources/1/block \
  -H "Authorization: Bearer <token>"
```
## Notes

- Storage is Postgres, not in-memory — restart-safe, but you're responsible for running migrations.
