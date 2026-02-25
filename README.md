# COMMUNE — Community Operating System

<p align="center">
	A modern full-stack platform where developers discover communities, collaborate on tasks,
	join events, message each other, and build a public contribution portfolio.
</p>

<p align="center">
	<img alt="Monorepo" src="https://img.shields.io/badge/Monorepo-Turbo-7C6AEF" />
	<img alt="Frontend" src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-36BFAA" />
	<img alt="Backend" src="https://img.shields.io/badge/Backend-NestJS%2011-F5A623" />
	<img alt="Database" src="https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Redis-60A5FA" />
	<img alt="TypeScript" src="https://img.shields.io/badge/Language-TypeScript-3178C6" />
</p>

---

## ✨ What’s Inside

- **Communities**: create, join, and manage focused dev communities
- **Collaboration**: Kanban task workflows with drag-and-drop interactions
- **Messaging**: DMs + community channels + friend request flows
- **Events**: discover, RSVP, and organize community events
- **Portfolio**: skill management, contributions, and public profile pages
- **Notifications**: centralized activity and updates
- **Discovery/Search**: explore people, communities, and activity
- **Modern UX**: animated landing page, smooth transitions, and skeleton loading states

---

## 🧱 Tech Stack

### Frontend (`apps/web`)
- React 19 + TypeScript + Vite 7
- Ant Design 5
- TanStack React Query
- Zustand
- Framer Motion
- dnd-kit

### Backend (`apps/api`)
- NestJS 11 + TypeScript
- TypeORM
- PostgreSQL 16 (local via `pgvector/pgvector:pg16`)
- Redis 7
- JWT auth + Google/GitHub OAuth
- Bull queues

### Monorepo
- Turbo + npm workspaces
- Shared contracts in `packages/shared-types`

---

## 📁 Repository Structure

```text
commune/
├─ apps/
│  ├─ api/                # NestJS backend
│  └─ web/                # React frontend
├─ packages/
│  └─ shared-types/       # Shared TypeScript types
├─ docker-compose.yml     # Local Postgres + Redis
├─ turbo.json
├─ PRODUCTION.md
└─ PROJECT_REFERENCE.md
```

---

## 🚀 Local Development (Quick Start)

### 1) Install dependencies

```bash
npm install
```

### 2) Start infrastructure (Postgres + Redis)

```bash
docker compose up -d
```

### 3) Initialize database

```bash
cd apps/api
npm run db:setup
cd ../..
```

### 4) Run the app

```bash
npm run dev
```

App URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`

---

## ⚙️ Useful Commands

### From repo root

```bash
npm run dev
npm run build
npm run lint
npm run dev:web
npm run dev:api
```

### API (`apps/api`)

```bash
npm run dev
npm run build
npm run start:prod
npm run migration:run
npm run migration:revert
npm run seed
npm run test
```

### Web (`apps/web`)

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 🔐 Environment Variables

### API (`apps/api/.env`)

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=commune
DB_PASSWORD=commune
DB_NAME=commune_dev

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=commune-dev-secret-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/oauth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/oauth/github/callback
```

### Web (`apps/web/.env` or `.env.production`)

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 🚢 Deploy This **Right Now**

If you want the fastest real deployment today, use:
- **Backend + PostgreSQL + Redis:** Railway
- **Frontend:** Vercel

### A) Deploy backend (Railway)

1. Push this repo to GitHub.
2. In Railway, create a new project from this repo.
3. Set service root to `apps/api`.
4. Add PostgreSQL and Redis plugins/services in the same Railway project.
5. Set backend start command:

```bash
npm run start:prod
```

6. Set backend build command:

```bash
npm run build
```

7. Add required env vars in Railway (`PORT`, `FRONTEND_URL`, `DB_*`, `REDIS_*`, `JWT_*`, OAuth keys).
8. Run migrations once (Railway shell / job):

```bash
npm run migration:run
```

9. Confirm API is live at your Railway URL (e.g. `https://your-api.railway.app/api/v1`).

### B) Deploy frontend (Vercel)

1. Import the same GitHub repo in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Set build command:

```bash
npm run build
```

4. Set output directory:

```bash
dist
```

5. Add environment variable:

```env
VITE_API_URL=https://your-api.railway.app/api/v1
```

6. Deploy.

### C) Final production checks

- Set `FRONTEND_URL` in backend to your Vercel URL
- Update OAuth callback URLs to your production API domain
- Verify login, communities, portfolio, messaging, and notifications

---

## 🏭 Alternative: Single-Server Docker Deploy

For a VPS/VM setup, use Docker + reverse proxy. See full guide in [PRODUCTION.md](./PRODUCTION.md).

---

## 📚 Documentation

- Deployment hardening and production details: [PRODUCTION.md](./PRODUCTION.md)
- Full architecture and module reference: [PROJECT_REFERENCE.md](./PROJECT_REFERENCE.md)

---

## 📌 Status

Commune is actively evolving with core end-to-end flows implemented and ongoing UX/performance improvements.

## 📄 License

No license file is currently included in this repository.
