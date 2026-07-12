# TransitOps Backend

A REST API backend for **TransitOps** — a centralized platform to manage the complete lifecycle of transport operations: vehicles, drivers, dispatching, maintenance, fuel logging, and analytics. Built with Node.js, Express, and SQLite (via `better-sqlite3`, no external database server needed).

## Features

- **Multi-tenant**: every organization's data is fully isolated by `org_id`.
- **Auth**: JWT-based login, organization signup, staff invites, role-based access (`admin`, `manager`, `dispatcher`).
- **Vehicles**: registration, type, status (active / maintenance / inactive), odometer tracking.
- **Drivers**: license tracking, status (available / on_trip / off_duty), vehicle assignment.
- **Dispatch (Trips)**: create trips, validates vehicle/driver availability, enforces a proper status lifecycle (`scheduled → in_progress → completed`, or `cancelled`), auto-updates driver availability.
- **Maintenance**: service/repair/inspection logs, auto-flips vehicle status to `maintenance` while work is open and back to `active` on completion.
- **Fuel logging**: per-vehicle fuel entries with cost, liters, odometer, and station.
- **Analytics**: dashboard summary, fleet utilization, fuel efficiency, maintenance cost breakdown, monthly cost/trip trends.

## Getting Started

```bash
npm install
cp .env.example .env      # edit JWT_SECRET before deploying
npm start                 # or: npm run dev (with nodemon)
```

The API runs on `http://localhost:5000` by default. SQLite data is stored at `data/transitops.db`, created automatically on first run.

## Environment Variables

| Variable      | Description                          | Default       |
|---------------|---------------------------------------|---------------|
| `PORT`        | Port to listen on                     | `5000`        |
| `NODE_ENV`    | `development` / `production`          | `development` |
| `JWT_SECRET`  | Secret used to sign JWTs — **change this** | —        |

## Authentication

Every route except `/health`, `/api/auth/register-organization`, and `/api/auth/login` requires:

```
Authorization: Bearer <token>
```

Roles: `admin` (full access), `manager` (operational CRUD, no user/vehicle deletion), `dispatcher` (dispatch trips, log fuel, assign vehicles — read-mostly elsewhere).

## API Reference

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register-organization` | Public | Create a new org + its first admin user |
| POST | `/api/auth/register-user` | admin | Add a staff user to your org |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET  | `/api/auth/me` | Any | Current user profile |

### Vehicles
| Method | Route | Access |
|---|---|---|
| GET | `/api/vehicles` | Any (filters: `status`, `type`, `search`, `page`, `limit`) |
| GET | `/api/vehicles/:id` | Any |
| POST | `/api/vehicles` | admin, manager |
| PUT | `/api/vehicles/:id` | admin, manager |
| DELETE | `/api/vehicles/:id` | admin |

### Drivers
| Method | Route | Access |
|---|---|---|
| GET | `/api/drivers` | Any (filters: `status`, `search`, `page`, `limit`) |
| GET | `/api/drivers/:id` | Any |
| POST | `/api/drivers` | admin, manager |
| PUT | `/api/drivers/:id` | admin, manager |
| PATCH | `/api/drivers/:id/assign-vehicle` | admin, manager, dispatcher |
| DELETE | `/api/drivers/:id` | admin |

### Trips / Dispatch
| Method | Route | Access |
|---|---|---|
| GET | `/api/trips` | Any (filters: `status`, `vehicle_id`, `driver_id`) |
| GET | `/api/trips/:id` | Any |
| POST | `/api/trips` | admin, manager, dispatcher — dispatches a trip; requires vehicle `active` & driver `available` |
| PUT | `/api/trips/:id` | admin, manager, dispatcher — edit while still `scheduled` |
| PATCH | `/api/trips/:id/status` | admin, manager, dispatcher — advance lifecycle (`in_progress`, `completed`, `cancelled`) |
| DELETE | `/api/trips/:id` | admin, manager |

### Maintenance
| Method | Route | Access |
|---|---|---|
| GET | `/api/maintenance` | Any (filters: `vehicle_id`, `status`, `type`) |
| GET | `/api/maintenance/:id` | Any |
| POST | `/api/maintenance` | admin, manager |
| PUT | `/api/maintenance/:id` | admin, manager |
| PATCH | `/api/maintenance/:id/status` | admin, manager |
| DELETE | `/api/maintenance/:id` | admin |

### Fuel Logs
| Method | Route | Access |
|---|---|---|
| GET | `/api/fuel-logs` | Any (filters: `vehicle_id`, `driver_id`, `from`, `to`) |
| GET | `/api/fuel-logs/:id` | Any |
| POST | `/api/fuel-logs` | admin, manager, dispatcher |
| PUT | `/api/fuel-logs/:id` | admin, manager, dispatcher |
| DELETE | `/api/fuel-logs/:id` | admin, manager |

### Analytics
| Method | Route | Description |
|---|---|---|
| GET | `/api/analytics/dashboard` | Summary cards: counts by status, this month's costs, upcoming maintenance |
| GET | `/api/analytics/fleet-utilization` | Trip count & distance per vehicle |
| GET | `/api/analytics/fuel-efficiency` | Fuel cost & liters per vehicle |
| GET | `/api/analytics/maintenance-costs` | Cost breakdown by vehicle and by type |
| GET | `/api/analytics/monthly-trend?months=6` | Fuel/maintenance cost & trip count trend for charts |

## Example: Full flow with curl

```bash
# 1. Register your organization
curl -X POST http://localhost:5000/api/auth/register-organization \
  -H "Content-Type: application/json" \
  -d '{"organization_name":"SwiftFleet","name":"Asha","email":"asha@swiftfleet.com","password":"secret123"}'

# 2. Use the returned token for everything else
TOKEN="<paste token here>"

# 3. Register a vehicle
curl -X POST http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"registration_no":"KL-07-AB-1234","type":"Bus","capacity":40}'

# 4. Register a driver
curl -X POST http://localhost:5000/api/drivers \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Rahul Nair","license_number":"KL9920210001"}'

# 5. Dispatch a trip
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"vehicle_id":1,"driver_id":1,"origin":"Kochi","destination":"Munnar","scheduled_start":"2026-08-01T08:00:00"}'
```

## Business Rules Enforced

- A trip cannot be dispatched unless its vehicle is `active` and its driver is `available`.
- Dispatching a trip sets the driver to `on_trip`; completing or cancelling it returns the driver to `available`.
- Trip status can only move forward: `scheduled → in_progress → completed`, or `scheduled/in_progress → cancelled`. Skipping steps or reopening a finished trip returns `400`.
- Opening a maintenance record with status `scheduled`/`in_progress` sets the vehicle to `maintenance`; marking it `completed` returns the vehicle to `active`.
- Odometer readings from maintenance and fuel logs bump the vehicle's tracked odometer (never move it backward).
- All list/detail/update/delete operations are scoped to the caller's organization — no cross-tenant data leakage.

## Project Structure

```
transitops-backend/
├── server.js                 # App entry point
├── config/db.js              # SQLite connection + schema
├── middleware/                # auth, validation, error handling
├── controllers/                # business logic per module
├── routes/                     # route + validation definitions per module
├── utils/                      # ApiError, asyncHandler
├── .env.example
└── data/transitops.db          # created automatically on first run
```
