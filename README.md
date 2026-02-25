# COMMUNE — Community Operating System

A full-stack, production-minded monorepo for building modern online communities with collaboration, messaging, events, portfolio profiles, notifications, and search.

## Highlights

- Monorepo architecture powered by Turbo + npm workspaces
- NestJS API with modular domain design and TypeORM/PostgreSQL
- React + Vite frontend with Ant Design, Zustand, React Query, and Framer Motion
- Real-time-ready messaging stack and notification flows
- Community-centric workflow: discovery → join → collaborate → showcase contributions

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Ant Design 5
- TanStack React Query
- Zustand
- Framer Motion
- dnd-kit (Kanban drag-and-drop)

### Backend
- NestJS 11 + TypeScript
- TypeORM + PostgreSQL (pgvector image in local docker setup)
- Redis 7
- JWT + OAuth (Google/GitHub)
- Bull queue support

### Monorepo
- Turbo repo pipeline (`dev`, `build`, `lint`)
- Shared contract package: `packages/shared-types`

## Repository Layout

```text
commune/
├─ apps/
│  ├─ api/        # NestJS backend
│  └─ web/        # React frontend
├─ packages/
│  └─ shared-types/
├─ docker-compose.yml
├─ turbo.json
└─ PRODUCTION.md
```

## Quick Start (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Start local infrastructure (Postgres + Redis)

```bash
docker compose up -d
```

### 3) Run database setup (API)

```bash
cd apps/api
npm run db:setup
```

### 4) Run both apps from repo root

```bash
cd ../..
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API docs (non-production): http://localhost:3000/docs

## Useful Commands

From repo root:

```bash
npm run dev
npm run build
npm run lint
npm run dev:web
npm run dev:api
```

From `apps/api`:

```bash
npm run migration:run
npm run migration:revert
npm run seed
npm run test
```

From `apps/web`:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Main Product Areas

- Authentication (email/password + OAuth)
- Communities and member management
- Community task boards (Kanban)
- Events and RSVPs
- Direct messaging and friend requests
- User portfolio and reputation surface
- Notifications center
- Discover + search (communities/people)

## Documentation

- Production deployment: [PRODUCTION.md](./PRODUCTION.md)
- Full architecture and component reference: [PROJECT_REFERENCE.md](./PROJECT_REFERENCE.md)

## Current State

This repository is actively evolving. Core product flows are implemented; polish and incremental hardening are ongoing.

## License

No license file is currently included in this repository.
