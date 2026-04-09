# CLAUDE.md — UniFleet Admin Dashboard
## Three-Layer Agentic Architecture

> This file instructs Claude (or any AI coding agent) how to think, decide, and act
> when building the UniFleet University Bus Management System full-stack application.
> The reference UI is `bus-admin-dashboard.html`. Every decision must trace back to it.

---

## ─────────────────────────────────────────
## LAYER 1 — DIRECTIVE (What To Do)
## ─────────────────────────────────────────

> This layer defines the **mission, scope, and file ownership**.
> It answers: *What are we building, and where does everything live?*

### 1.1 Project Mission

Build a production-ready, full-stack web application called **UniFleet** — a University Bus
Management Admin Dashboard. The HTML prototype `bus-admin-dashboard.html` is the single source
of truth for the UI. Every color, font, layout, component, and feature visible in that file
must be faithfully reproduced and made fully functional with real data, a real backend API,
and real-time communication.

---

### 1.2 Monorepo File Structure

```
uniFleet/
│
├── CLAUDE.md                        ← You are here. Master instructions for the agent.
├── bus-admin-dashboard.html         ← UI reference prototype. Do NOT modify.
├── .env.example                     ← Environment variable template
├── .gitignore
├── README.md
│
├── /client                          ← LAYER 3: React + Vite Frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   │
│   ├── /public
│   │   └── favicon.ico
│   │
│   └── /src
│       ├── main.jsx                 ← React entry point
│       ├── App.jsx                  ← Router + layout shell
│       ├── index.css                ← Global CSS variables (from HTML prototype)
│       │
│       ├── /assets
│       │   └── fonts/               ← Syne + DM Sans (or use Google Fonts CDN)
│       │
│       ├── /components              ← Reusable UI components
│       │   ├── Sidebar.jsx
│       │   ├── Topbar.jsx
│       │   ├── StatCard.jsx
│       │   ├── LiveMap.jsx          ← Leaflet.js map component
│       │   ├── AlertItem.jsx
│       │   ├── DataTable.jsx
│       │   ├── Pill.jsx             ← Status badge component
│       │   ├── RatingBar.jsx
│       │   ├── KanbanBoard.jsx
│       │   ├── KanbanCard.jsx
│       │   ├── EmergencyBanner.jsx
│       │   └── ChartWrapper.jsx
│       │
│       ├── /pages                   ← One file per sidebar section
│       │   ├── DashboardPage.jsx
│       │   ├── LiveMapPage.jsx
│       │   ├── RoutesPage.jsx
│       │   ├── FleetPage.jsx
│       │   ├── DriversPage.jsx
│       │   ├── TripsPage.jsx
│       │   ├── ParcelsPage.jsx
│       │   ├── BlacklistPage.jsx
│       │   ├── RewardsPage.jsx
│       │   ├── RatingsPage.jsx
│       │   ├── EmergencyPage.jsx
│       │   └── LoginPage.jsx
│       │
│       ├── /hooks                   ← Custom React hooks
│       │   ├── useSocket.js         ← Socket.io connection + event listeners
│       │   ├── useAuth.js           ← JWT auth state
│       │   └── useApi.js            ← Axios wrapper with auth headers
│       │
│       ├── /context
│       │   ├── AuthContext.jsx
│       │   └── AlertContext.jsx     ← Global emergency alert state
│       │
│       ├── /services
│       │   └── api.js               ← All Axios API call functions
│       │
│       └── /utils
│           ├── formatters.js        ← Date, currency, status formatters
│           └── mapHelpers.js        ← Route polyline color mapping
│
│
├── /server                          ← LAYER 3: Node.js + Express Backend
│   ├── package.json
│   ├── server.js                    ← Entry point. Starts Express + Socket.io
│   │
│   ├── /prisma
│   │   ├── schema.prisma            ← All database models
│   │   └── seed.js                  ← Realistic sample data seeder
│   │
│   ├── /src
│   │   ├── app.js                   ← Express app setup, middleware registration
│   │   │
│   │   ├── /routes                  ← Route files (one per resource)
│   │   │   ├── auth.routes.js
│   │   │   ├── buses.routes.js
│   │   │   ├── routes.routes.js
│   │   │   ├── stops.routes.js
│   │   │   ├── drivers.routes.js
│   │   │   ├── students.routes.js
│   │   │   ├── trips.routes.js
│   │   │   ├── parcels.routes.js
│   │   │   ├── ratings.routes.js
│   │   │   ├── alerts.routes.js
│   │   │   ├── rewards.routes.js
│   │   │   └── dashboard.routes.js
│   │   │
│   │   ├── /controllers             ← Business logic (one per resource)
│   │   │   ├── auth.controller.js
│   │   │   ├── buses.controller.js
│   │   │   ├── routes.controller.js
│   │   │   ├── stops.controller.js
│   │   │   ├── drivers.controller.js
│   │   │   ├── students.controller.js
│   │   │   ├── trips.controller.js
│   │   │   ├── parcels.controller.js
│   │   │   ├── ratings.controller.js
│   │   │   ├── alerts.controller.js
│   │   │   ├── rewards.controller.js
│   │   │   └── dashboard.controller.js
│   │   │
│   │   ├── /middleware
│   │   │   ├── auth.middleware.js   ← JWT verification
│   │   │   ├── validate.middleware.js ← Zod schema validation
│   │   │   └── error.middleware.js  ← Global error handler
│   │   │
│   │   ├── /schemas                 ← Zod validation schemas
│   │   │   ├── bus.schema.js
│   │   │   ├── route.schema.js
│   │   │   ├── driver.schema.js
│   │   │   ├── student.schema.js
│   │   │   ├── trip.schema.js
│   │   │   ├── parcel.schema.js
│   │   │   └── alert.schema.js
│   │   │
│   │   ├── /sockets
│   │   │   └── socketHandler.js     ← All Socket.io event emitters
│   │   │
│   │   └── /utils
│   │       ├── jwt.utils.js
│   │       ├── hash.utils.js
│   │       └── gpsSimulator.js      ← Simulates live bus GPS movement
│   │
│   └── /tests
│       └── api.test.js              ← Basic endpoint smoke tests
│
│
└── /docs                            ← LAYER 2 artifacts (decisions, plans, specs)
    ├── architecture.md
    ├── api-endpoints.md
    ├── db-schema.md
    ├── socket-events.md
    └── deployment.md
```

---

### 1.3 Environment Variables (`.env`)

```env
# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/unifleet

# Client
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

---

### 1.4 Feature-to-File Mapping

| Dashboard Section        | Page Component         | API Route Prefix       | DB Model(s)                  |
|--------------------------|------------------------|------------------------|------------------------------|
| Dashboard Overview       | `DashboardPage.jsx`    | `/api/dashboard`       | All models (aggregates)      |
| Live Bus Map             | `LiveMapPage.jsx`      | `/api/buses/locations` | Bus, Route, Stop             |
| Route & Stop Management  | `RoutesPage.jsx`       | `/api/routes`, `/api/stops` | Route, Stop            |
| Bus Fleet Management     | `FleetPage.jsx`        | `/api/buses`           | Bus, Driver                  |
| Driver Management        | `DriversPage.jsx`      | `/api/drivers`         | Driver, Bus, Route           |
| Special Trips            | `TripsPage.jsx`        | `/api/trips`           | Trip, Bus, Route             |
| Parcel Console           | `ParcelsPage.jsx`      | `/api/parcels`         | Parcel, Trip                 |
| Blacklist System         | `BlacklistPage.jsx`    | `/api/students`        | Student                      |
| Rewards Configuration    | `RewardsPage.jsx`      | `/api/rewards`         | RewardRule, StudentPoints    |
| Ratings Analytics        | `RatingsPage.jsx`      | `/api/ratings`         | Rating, Driver               |
| Emergency Console        | `EmergencyPage.jsx`    | `/api/alerts`          | EmergencyAlert, Student, Bus |

---

---

## ─────────────────────────────────────────
## LAYER 2 — ORCHESTRATION (Decisions)
## ─────────────────────────────────────────

> This layer defines **how the agent thinks and makes choices**.
> It answers: *In what order, using what rules, and when to pause?*

### 2.1 Build Sequence (Strict Order)

The agent MUST complete phases in this order. Do not start a phase until the previous
one is verified working.

```
Phase 0 → Environment & Tooling Setup
Phase 1 → Database Schema & Seed Data
Phase 2 → Backend API (REST endpoints)
Phase 3 → Auth System (JWT login)
Phase 4 → Real-Time Layer (Socket.io)
Phase 5 → Frontend Shell (Router + Layout)
Phase 6 → Pages & Components (11 pages)
Phase 7 → Map Integration (Leaflet.js)
Phase 8 → Charts (Recharts/Chart.js)
Phase 9 → End-to-End Testing
Phase 10 → Final Verification
```

---

### 2.2 Decision Rules

#### Design Decisions
- **Always match the HTML prototype** — `bus-admin-dashboard.html` is ground truth for all visual decisions.
- **CSS variables** — preserve exactly as defined in the prototype:
  ```css
  --bg: #0b0f1a;
  --surface: #131929;
  --surface2: #1a2235;
  --border: #1f2e47;
  --accent: #00d4ff;
  --accent2: #7c5cfc;
  --accent3: #ff5f6d;
  --accent4: #00e096;
  --warn: #ffb347;
  ```
- **Fonts** — Syne (headings, weights 600/700/800) + DM Sans (body, weights 300/400/500) via Google Fonts.
- **Never invent new UI patterns** — if it's not in the prototype, do not add it unless explicitly asked.

#### Architecture Decisions
- **Frontend state management** — use React Context + `useState`/`useReducer`. No Redux.
- **API calls** — centralize all in `/client/src/services/api.js`. Pages never call `fetch` directly.
- **Real-time** — all live data (bus positions, alerts) comes via Socket.io, not polling.
- **Authentication** — JWT stored in `localStorage`. Protected routes redirect to `/login` if token is absent or expired.
- **Map library** — Leaflet.js with OpenStreetMap tiles (free, no API key needed).
- **Charts** — Recharts (React-native, easier to theme than Chart.js).
- **ORM** — Prisma with PostgreSQL. Never write raw SQL unless Prisma cannot express the query.
- **Validation** — Zod schemas on both server (request bodies) and client (forms).

#### Naming Conventions
- React components: `PascalCase.jsx`
- Hooks: `camelCase.js`, prefixed with `use`
- API routes: `kebab-case` plural nouns (`/api/bus-routes`, `/api/emergency-alerts`)
- DB models: `PascalCase` singular (`Bus`, `Route`, `Driver`)
- Environment variables: `SCREAMING_SNAKE_CASE`
- CSS classes: follow Tailwind utility conventions

#### Error Handling Rules
- Every API controller must be wrapped in `try/catch`.
- All errors are passed to `next(err)` and handled by `error.middleware.js`.
- HTTP status codes must be semantically correct:
  - `200` OK, `201` Created, `204` No Content (delete)
  - `400` Bad Request (validation), `401` Unauthorized, `403` Forbidden
  - `404` Not Found, `500` Server Error

---

### 2.3 When To Pause and Ask

The agent must STOP and ask the human for input in these situations:

| Situation | What To Ask |
|-----------|-------------|
| PostgreSQL is not running or credentials fail | "Please provide your PostgreSQL host, port, username, and password." |
| A feature exists in the HTML prototype but the requirement is ambiguous | "The prototype shows [X]. Should it do [A] or [B]?" |
| A third-party API key or external service is needed | "This feature requires [service]. Do you have an API key?" |
| A destructive operation (drop DB, delete files) is about to run | "This will [action]. Confirm yes/no before I proceed." |
| Phase verification fails (server won't start, tests fail) | "Phase [N] failed with this error: [error]. Do you want me to debug or skip?" |

---

### 2.4 Verification Checkpoints

At the end of each phase, the agent must confirm the following before moving on:

```
[ Phase 0 ] node -v ≥ 18, npm -v ≥ 9, psql is reachable, .env is populated
[ Phase 1 ] `npx prisma migrate dev` succeeds, `node seed.js` inserts rows, DB has data
[ Phase 2 ] All REST endpoints return correct JSON via curl/Postman/browser
[ Phase 3 ] POST /api/auth/login returns a JWT, protected route rejects without token
[ Phase 4 ] Socket.io emits "bus:location" events visible in browser console
[ Phase 5 ] React app loads at localhost:5173, sidebar nav switches pages
[ Phase 6 ] All 11 pages render with real data fetched from the API
[ Phase 7 ] Leaflet map shows animated bus markers moving along routes
[ Phase 8 ] All charts (bar, line, doughnut, radar) render with real rating/trip data
[ Phase 9 ] Full user flow works: login → create route → update parcel → resolve alert
[ Phase 10] Screenshot of working dashboard matches the HTML prototype visually
```

---

### 2.5 Socket.io Event Contract

All real-time events must follow this contract precisely.

| Event Name         | Direction         | Payload                                                           |
|--------------------|-------------------|-------------------------------------------------------------------|
| `bus:location`     | Server → Client   | `{ busId, lat, lng, routeId, driverId, status }`                 |
| `alert:new`        | Server → Client   | `{ id, studentId, busId, lat, lng, message, createdAt }`         |
| `alert:resolved`   | Server → Client   | `{ id, resolvedAt, resolvedBy }`                                 |
| `parcel:updated`   | Server → Client   | `{ id, status, updatedAt }`                                      |
| `admin:connect`    | Client → Server   | `{ adminId, token }`                                             |

GPS simulation: every 3 seconds, `gpsSimulator.js` nudges each active bus's `lat/lng`
by ±0.0005 degrees to simulate movement, then emits `bus:location` for each bus.

---

---

## ─────────────────────────────────────────
## LAYER 3 — EXECUTION (Doing The Work)
## ─────────────────────────────────────────

> This layer contains the **exact commands, code patterns, and templates** the agent runs.
> It answers: *Precisely how is each piece built?*

---

### 3.1 Phase 0 — Environment Setup

```bash
# Create monorepo
mkdir uniFleet && cd uniFleet
cp /path/to/bus-admin-dashboard.html .

# Scaffold client
npm create vite@latest client -- --template react
cd client && npm install
npm install axios react-router-dom leaflet recharts socket.io-client zod
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..

# Scaffold server
mkdir server && cd server
npm init -y
npm install express prisma @prisma/client socket.io cors dotenv bcryptjs jsonwebtoken zod
npm install -D nodemon
npx prisma init
cd ..
```

---

### 3.2 Phase 1 — Prisma Database Schema

File: `/server/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         String   @default("admin")
  createdAt    DateTime @default(now())
}

model Route {
  id         String   @id @default(cuid())
  name       String
  startStop  String
  endStop    String
  status     String   @default("active")
  stops      Stop[]
  buses      Bus[]
  trips      Trip[]
  createdAt  DateTime @default(now())
}

model Stop {
  id        String  @id @default(cuid())
  name      String
  order     Int
  lat       Float
  lng       Float
  routeId   String
  route     Route   @relation(fields: [routeId], references: [id])
}

model Bus {
  id           String          @id @default(cuid())
  plateNumber  String          @unique
  model        String
  capacity     Int
  condition    String          @default("good")
  routeId      String?
  route        Route?          @relation(fields: [routeId], references: [id])
  driver       Driver?
  alerts       EmergencyAlert[]
  createdAt    DateTime        @default(now())
}

model Driver {
  id            String   @id @default(cuid())
  name          String
  phone         String
  licenseNumber String   @unique
  busId         String?  @unique
  bus           Bus?     @relation(fields: [busId], references: [id])
  status        String   @default("active")
  ratings       Rating[]
  createdAt     DateTime @default(now())
}

model Student {
  id                String          @id @default(cuid())
  universityId      String          @unique
  name              String
  email             String          @unique
  status            String          @default("active")
  blacklistedReason String?
  blacklistedUntil  DateTime?
  points            StudentPoints?
  alerts            EmergencyAlert[]
  createdAt         DateTime        @default(now())
}

model StudentPoints {
  id         String  @id @default(cuid())
  studentId  String  @unique
  student    Student @relation(fields: [studentId], references: [id])
  total      Int     @default(0)
  freeRides  Int     @default(0)
}

model Trip {
  id        String   @id @default(cuid())
  type      String   @default("special")
  routeId   String
  route     Route    @relation(fields: [routeId], references: [id])
  dateTime  DateTime
  price     Float
  seats     Int
  booked    Int      @default(0)
  status    String   @default("pending")
  parcels   Parcel[]
  createdAt DateTime @default(now())
}

model Parcel {
  id           String   @id @default(cuid())
  trackingCode String   @unique
  description  String
  status       String   @default("pending")
  tripId       String?
  trip         Trip?    @relation(fields: [tripId], references: [id])
  createdAt    DateTime @default(now())
}

model Rating {
  id          String   @id @default(cuid())
  driverId    String
  driver      Driver   @relation(fields: [driverId], references: [id])
  score       Float
  category    String
  comment     String?
  isAnonymous Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model EmergencyAlert {
  id         String   @id @default(cuid())
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id])
  busId      String
  bus        Bus      @relation(fields: [busId], references: [id])
  lat        Float
  lng        Float
  message    String?
  status     String   @default("active")
  createdAt  DateTime @default(now())
  resolvedAt DateTime?
}

model RewardRule {
  id     String @id @default(cuid())
  label  String
  points Int
}
```

Run migrations and seed:
```bash
cd server
npx prisma migrate dev --name init
node prisma/seed.js
```

---

### 3.3 Phase 2 — Express Server Entry Point

File: `/server/server.js`

```javascript
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/sockets/socketHandler');
require('dotenv').config();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ UniFleet server running on http://localhost:${PORT}`);
});
```

File: `/server/src/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Mount all route files
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/buses',     require('./routes/buses.routes'));
app.use('/api/routes',    require('./routes/routes.routes'));
app.use('/api/drivers',   require('./routes/drivers.routes'));
app.use('/api/students',  require('./routes/students.routes'));
app.use('/api/trips',     require('./routes/trips.routes'));
app.use('/api/parcels',   require('./routes/parcels.routes'));
app.use('/api/ratings',   require('./routes/ratings.routes'));
app.use('/api/alerts',    require('./routes/alerts.routes'));
app.use('/api/rewards',   require('./routes/rewards.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use(errorMiddleware);
module.exports = app;
```

---

### 3.4 Phase 3 — Auth Pattern

File: `/server/src/middleware/auth.middleware.js`

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware };
```

---

### 3.5 Phase 4 — Socket.io Handler

File: `/server/src/sockets/socketHandler.js`

```javascript
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In-memory GPS state for each bus
const busPositions = {};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: 'http://localhost:5173', credentials: true }
  });

  io.on('connection', (socket) => {
    console.log(`Admin connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`Admin disconnected: ${socket.id}`));
  });

  // Simulate live GPS every 3 seconds
  setInterval(async () => {
    const buses = await prisma.bus.findMany({
      where: { condition: { not: 'fault' } },
      include: { driver: true, route: true }
    });

    buses.forEach((bus) => {
      if (!busPositions[bus.id]) {
        busPositions[bus.id] = { lat: 32.0853, lng: 35.8456 };
      }
      busPositions[bus.id].lat += (Math.random() - 0.5) * 0.001;
      busPositions[bus.id].lng += (Math.random() - 0.5) * 0.001;

      io.emit('bus:location', {
        busId: bus.id,
        plateNumber: bus.plateNumber,
        lat: busPositions[bus.id].lat,
        lng: busPositions[bus.id].lng,
        routeId: bus.routeId,
        driverName: bus.driver?.name,
        status: bus.condition,
      });
    });
  }, 3000);

  return io;
};

module.exports = { initSocket };
```

---

### 3.6 Phase 5 — React Router Shell

File: `/client/src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';

// All page imports
import DashboardPage   from './pages/DashboardPage';
import LiveMapPage     from './pages/LiveMapPage';
import RoutesPage      from './pages/RoutesPage';
import FleetPage       from './pages/FleetPage';
import DriversPage     from './pages/DriversPage';
import TripsPage       from './pages/TripsPage';
import ParcelsPage     from './pages/ParcelsPage';
import BlacklistPage   from './pages/BlacklistPage';
import RewardsPage     from './pages/RewardsPage';
import RatingsPage     from './pages/RatingsPage';
import EmergencyPage   from './pages/EmergencyPage';

function ProtectedLayout({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ padding: '24px 28px', flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
        <Route path="/map"       element={<ProtectedLayout><LiveMapPage /></ProtectedLayout>} />
        <Route path="/routes"    element={<ProtectedLayout><RoutesPage /></ProtectedLayout>} />
        <Route path="/fleet"     element={<ProtectedLayout><FleetPage /></ProtectedLayout>} />
        <Route path="/drivers"   element={<ProtectedLayout><DriversPage /></ProtectedLayout>} />
        <Route path="/trips"     element={<ProtectedLayout><TripsPage /></ProtectedLayout>} />
        <Route path="/parcels"   element={<ProtectedLayout><ParcelsPage /></ProtectedLayout>} />
        <Route path="/blacklist" element={<ProtectedLayout><BlacklistPage /></ProtectedLayout>} />
        <Route path="/rewards"   element={<ProtectedLayout><RewardsPage /></ProtectedLayout>} />
        <Route path="/ratings"   element={<ProtectedLayout><RatingsPage /></ProtectedLayout>} />
        <Route path="/emergency" element={<ProtectedLayout><EmergencyPage /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### 3.7 Phase 7 — Leaflet Map Component

File: `/client/src/components/LiveMap.jsx`

```jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ROUTE_COLORS = ['#00d4ff', '#7c5cfc', '#00e096', '#ffb347', '#ff5f6d'];

export default function LiveMap({ buses = [], routes = [], height = '400px' }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current).setView([32.0853, 35.8456], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    buses.forEach((bus) => {
      const isEmergency = bus.status === 'fault' || bus.status === 'emergency';
      const color = isEmergency ? '#ff5f6d' : '#00e096';
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:14px;height:14px;border-radius:50%;
          background:${color};border:2px solid #fff;
          box-shadow:0 0 10px ${color};
        "></div>`,
        iconSize: [14, 14],
      });

      if (markersRef.current[bus.busId]) {
        markersRef.current[bus.busId].setLatLng([bus.lat, bus.lng]);
      } else {
        const marker = L.marker([bus.lat, bus.lng], { icon })
          .bindTooltip(bus.plateNumber || bus.busId, { permanent: false })
          .addTo(mapInstance.current);
        markersRef.current[bus.busId] = marker;
      }
    });
  }, [buses]);

  return <div ref={mapRef} style={{ height, borderRadius: '10px', zIndex: 0 }} />;
}
```

---

### 3.8 Phase 6 — API Service Layer

File: `/client/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('unifleet_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Dashboard
export const getDashboardStats  = () => api.get('/dashboard/stats');

// Buses
export const getBuses            = () => api.get('/buses');
export const createBus           = (data) => api.post('/buses', data);
export const updateBus           = (id, data) => api.put(`/buses/${id}`, data);
export const deleteBus           = (id) => api.delete(`/buses/${id}`);
export const getBusLocations     = () => api.get('/buses/locations');

// Routes
export const getRoutes           = () => api.get('/routes');
export const createRoute         = (data) => api.post('/routes', data);
export const updateRoute         = (id, data) => api.put(`/routes/${id}`, data);
export const deleteRoute         = (id) => api.delete(`/routes/${id}`);

// Drivers
export const getDrivers          = () => api.get('/drivers');
export const createDriver        = (data) => api.post('/drivers', data);
export const updateDriver        = (id, data) => api.put(`/drivers/${id}`, data);
export const deleteDriver        = (id) => api.delete(`/drivers/${id}`);

// Students / Blacklist
export const getStudents         = () => api.get('/students');
export const blacklistStudent    = (id, data) => api.post(`/students/${id}/blacklist`, data);
export const liftBlacklist       = (id) => api.delete(`/students/${id}/blacklist`);

// Trips
export const getTrips            = () => api.get('/trips');
export const createTrip          = (data) => api.post('/trips', data);
export const updateTrip          = (id, data) => api.put(`/trips/${id}`, data);

// Parcels
export const getParcels          = () => api.get('/parcels');
export const updateParcelStatus  = (id, status) => api.patch(`/parcels/${id}/status`, { status });

// Ratings
export const getRatingsAnalytics = () => api.get('/ratings/analytics');
export const getRatingComments   = () => api.get('/ratings/comments');

// Alerts
export const getAlerts           = () => api.get('/alerts');
export const resolveAlert        = (id) => api.patch(`/alerts/${id}/resolve`);

// Rewards
export const getRewardRules      = () => api.get('/rewards/rules');
export const updateRewardRules   = (rules) => api.put('/rewards/rules', { rules });

// Auth
export const login               = (email, password) => api.post('/auth/login', { email, password });
```

---

### 3.9 Phase 4 — Socket.io Client Hook

File: `/client/src/hooks/useSocket.js`

```javascript
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket(handlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    if (handlers.onBusLocation)
      socketRef.current.on('bus:location', handlers.onBusLocation);
    if (handlers.onAlertNew)
      socketRef.current.on('alert:new', handlers.onAlertNew);
    if (handlers.onAlertResolved)
      socketRef.current.on('alert:resolved', handlers.onAlertResolved);
    if (handlers.onParcelUpdated)
      socketRef.current.on('parcel:updated', handlers.onParcelUpdated);

    return () => socketRef.current.disconnect();
  }, []);

  return socketRef;
}
```

Usage in a page component:
```jsx
const [busPositions, setBusPositions] = useState([]);

useSocket({
  onBusLocation: (data) => {
    setBusPositions((prev) => {
      const existing = prev.findIndex(b => b.busId === data.busId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = data;
        return updated;
      }
      return [...prev, data];
    });
  },
  onAlertNew: (alert) => {
    // Show emergency banner
  }
});
```

---

### 3.10 Phase 10 — Final Verification Checklist

Before declaring the application complete, confirm ALL of the following:

```
VISUAL
[ ] Dark theme matches bus-admin-dashboard.html exactly
[ ] Fonts are Syne + DM Sans (not system fonts)
[ ] All 11 sidebar nav items work and switch pages correctly
[ ] Emergency banner appears and pulses on Dashboard and Emergency pages
[ ] All pills/badges show correct colors (green/red/yellow/blue)
[ ] Stat cards show real numbers from the database

FUNCTIONALITY
[ ] Login page accepts admin credentials, stores JWT, redirects to dashboard
[ ] Logout clears token and redirects to login
[ ] Routes CRUD: create / read / update / delete all work
[ ] Fleet CRUD: add bus, update condition, remove bus all work
[ ] Driver CRUD: add, assign to bus, update status all work
[ ] Trips: create special trip, update booking status works
[ ] Parcels: drag kanban card between columns updates status via API
[ ] Blacklist: add student with reason + duration, lift restriction works
[ ] Rewards: edit point values, save persists to database
[ ] Ratings: bar charts and radar chart render with real aggregated data
[ ] Comments: anonymous feed loads from database

REAL-TIME
[ ] Bus dots animate on the map every 3 seconds
[ ] Emergency alert appears instantly in console when triggered
[ ] Alert badge count in sidebar updates without page refresh
[ ] Parcel status update reflects across tabs via socket

SECURITY
[ ] Visiting any route without a token redirects to /login
[ ] API returns 401 for all requests without Authorization header
[ ] Passwords are stored as bcrypt hashes (never plaintext)
```

---

*End of CLAUDE.md — Three-Layer Architecture*
*Reference: bus-admin-dashboard.html | Stack: React + Node.js + PostgreSQL + Socket.io + Leaflet.js*
