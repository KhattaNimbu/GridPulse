# EV Charging Station Load Management Platform

An end-to-end portfolio project for managing EV charging demand without overloading the grid. The app predicts short-term station demand, enforces transactional capacity limits during booking, and uses forecast-informed dynamic pricing to flatten peaks.

## Problem Statement

EV charging demand is spiky. If every driver books at the same attractive time, a station can overload its grid allocation, degrade service quality, or force manual operator intervention. This project demonstrates a practical control loop:

- forecast likely demand for each station
- expose bookable 30-minute charging slots
- reject bookings that would push a station over safe capacity
- adjust pricing based on predicted load so peak demand becomes less attractive
- give operators a polling-based live dashboard to watch stress build in real time

## Architecture

```mermaid
flowchart LR
  U["Driver / Operator Browser"] --> N["Next.js App Router App"]
  N --> P["PostgreSQL via Prisma"]
  N --> F["FastAPI Forecasting Service"]
  F --> P
  F --> M["Prophet Models + Synthetic History"]
  P --> D["Stations / Slots / Bookings / Forecasts / Pricing Rules / Users"]
```

## Core Features

- Driver dashboard at `/driver` for browsing stations, viewing slot availability, and booking sessions.
- Operator dashboard at `/operator` for creating stations, editing pricing rules, and monitoring live load curves.
- Serializable Prisma transaction in the booking engine to prevent overbooking under concurrency.
- Prophet-based 24-hour demand forecasting in 30-minute buckets.
- Dynamic pricing based on predicted load ratio.
- NextAuth credentials auth with operator route protection.

## Tech Stack

- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- NextAuth credentials provider
- FastAPI + Prophet
- Recharts for operator load visualization
- SWR polling for live-ish updates

## Project Structure

```text
EV Management/
|-- docker-compose.yml
|-- .env.example
|-- ev-charging-nextjs/
|   |-- app/
|   |-- components/
|   |-- hooks/
|   |-- lib/
|   |-- prisma/
|   `-- scripts/
`-- forecasting-service/
    |-- app/
    |-- data/processed/
    |-- models/
    `-- scripts/
```

## Demo Credentials

Set your own demo credentials in environment variables before seeding:

- `DEMO_OPERATOR_EMAIL`
- `DEMO_OPERATOR_PASSWORD`
- `DEMO_DRIVER_EMAIL`
- `DEMO_DRIVER_PASSWORD`

This repo does not ship with usable hardcoded credentials. Seeding fails fast unless those values are provided.

## Run With Docker

### 1. Create the root `.env`

From the workspace root, create a local env file from the root example:

```bash
cp .env.example .env
```

Then replace every placeholder. At minimum, set:

- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `FORECAST_SERVICE_API_KEY`
- `DEMO_DRIVER_EMAIL`
- `DEMO_DRIVER_PASSWORD`
- `DEMO_OPERATOR_EMAIL`
- `DEMO_OPERATOR_PASSWORD`

### 2. Start the stack

From the workspace root:

```bash
docker compose up --build
```

This starts:

- Postgres on `localhost:5432`
- Next.js app on `http://localhost:3000`
- Forecasting service on `http://localhost:8001`

The web container automatically:

1. runs `prisma migrate deploy`
2. seeds demo users and stations
3. starts the Next.js dev server

The forecasting service lazily generates synthetic demand history if it is missing, then trains or reuses Prophet models on demand.

If Docker exits immediately, check the root `.env` first. The compose file intentionally refuses to start with missing required secrets.

## Run Locally Without Docker

### 1. Start Postgres

Use your own local Postgres instance and create a database named `ev_management`.

### 2. Configure the Next.js app

Create `ev-charging-nextjs/.env` from `ev-charging-nextjs/.env.example` and replace every placeholder:

```env
DATABASE_URL=postgresql://user:change-this-postgres-password@localhost:5432/ev_management
FORECAST_SERVICE_URL=http://localhost:8001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret-generated-for-your-machine
FORECAST_SERVICE_API_KEY=replace-with-the-same-internal-api-key-as-the-forecast-service
DEMO_DRIVER_EMAIL=driver@example.local
DEMO_DRIVER_PASSWORD=ChangeThisDriverPassword123!
DEMO_OPERATOR_EMAIL=operator@example.local
DEMO_OPERATOR_PASSWORD=ChangeThisOperatorPassword123!
ADMIN_EMAILS=operator@example.local
ALERT_WEBHOOK=
```

### 3. Configure the forecasting service

Create `forecasting-service/.env` from `forecasting-service/.env.example`:

```env
DATABASE_URL=postgresql://user:change-this-postgres-password@localhost:5432/ev_management
API_HOST=localhost
API_PORT=8001
DEBUG=false
FORECAST_SERVICE_API_KEY=replace-with-the-same-internal-api-key-used-by-the-nextjs-app
MODEL_PATH=./models
DATA_PATH=./data/processed
```

### 4. Start the Next.js app

```bash
cd ev-charging-nextjs
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

### 5. Start the forecasting service

```bash
cd forecasting-service
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 6. Sign in

Use the values you set in:

- `DEMO_OPERATOR_EMAIL` / `DEMO_OPERATOR_PASSWORD`
- `DEMO_DRIVER_EMAIL` / `DEMO_DRIVER_PASSWORD`

## Verification Checklist

### Auth

1. Open `http://localhost:3000/sign-in`
2. Sign in with the operator account from your env file
3. Visit `/operator` and confirm access is allowed
4. Sign in with the driver account from your env file and confirm `/operator` redirects to `/unauthorized`

### Booking and Capacity

1. Open `/driver`
2. Sign in with the driver account
3. Select a station and book a slot
4. Confirm the slot availability drops after booking
5. Run `npm run test:concurrency` to validate double-booking protection

### Forecasting and Pricing

1. Call `http://localhost:8001/forecast/<stationId>`
2. Confirm 24 hours of predictions are returned
3. Open `/driver` and confirm slot prices render
4. Open `/operator`, change a pricing rule, and confirm prices change on the driver page after polling

### Operator Live Dashboard

1. Open `/operator`
2. Click `Watch Live` on a station
3. In another tab, create bookings for the same station
4. Confirm the load curve refreshes within one polling cycle
5. Confirm the stress alert appears once load crosses 85% of capacity

## Test Commands

Run from `ev-charging-nextjs/`:

```bash
npm run lint
npm run build
npm run test:pricing
npm run test:capacity
npm run test:api
```

Additional live concurrency verification:

```bash
npm run test:concurrency
```

## Notable Engineering Decisions

### Capacity protection uses transactions, not optimistic UI guesses

The booking path performs its capacity check and slot updates inside a Prisma serializable transaction. This keeps correctness on the server, where it belongs, and protects against simultaneous booking races.

### Polling instead of pub/sub or WebSockets

V1 uses SWR polling every 5-10 seconds. This keeps the architecture simpler to explain and deploy while still being strong enough for a live demo. The trade-off is slightly stale dashboards versus lower infrastructure complexity.

### Prophet-only forecasting

The forecasting service deliberately uses Prophet rather than adding multiple competing models. That makes the forecasting behavior easier to inspect, retrain, and defend in an interview. The trade-off is less experimentation breadth in exchange for a cleaner first version.

### Synthetic history as a fallback

If historical demand data is not present, the forecasting service generates realistic synthetic station demand so the product remains runnable from a clean checkout. The trade-off is that demo forecasts are plausible rather than sourced from production telemetry.

## API Overview

- `GET /api/stations`
- `POST /api/stations`
- `GET /api/slots?stationId=...`
- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/forecasts?stationId=...`
- `GET /api/pricing?stationId=...`
- `POST /api/pricing`
- `GET /api/load-curve?stationId=...`
- `GET /api/auth/[...nextauth]`
- `POST /api/auth/[...nextauth]`

## Security Notes

- `.env` files are ignored and should never be committed.
- Runtime `logs/` output is ignored and should stay local.
- Docker and seed setup require explicit secret values instead of falling back to weak usable defaults.
- `FORECAST_SERVICE_API_KEY` should match in both app environments when running outside Docker.

## Screenshots / GIFs

Add final demo assets here before publishing:

- `docs/screenshots/home.png`
- `docs/screenshots/driver-dashboard.png`
- `docs/screenshots/operator-dashboard.png`
- `docs/screenshots/load-curve-alert.png`
- `docs/demo.gif`

## Current V1 Scope

This version focuses on:

- one Next.js app instead of separate backend/frontend repos
- one Python forecasting microservice
- credentials auth for a seeded local demo
- polling for live updates
- explainable pricing and transactional booking correctness

Available future extensions include WebSockets, waitlist/notifications, stronger optimization-based scheduling, and model benchmarking beyond Prophet.
