# COMMUNE — Full Project Reference

This document is the detailed technical map of the project: architecture, folder structure, modules, components, feature coverage, and implementation status.

---

## 1) Project Identity

- **Name:** COMMUNE
- **Type:** Full-stack monorepo
- **Goal:** A community operating system for collaboration, events, messaging, profiles, and discovery.
- **Monorepo Tooling:** Turbo + npm workspaces

---

## 2) Top-Level Structure

```text
commune/
├─ apps/
│  ├─ api/                     # NestJS backend
│  └─ web/                     # React frontend
├─ packages/
│  └─ shared-types/            # shared contracts (API/Web)
├─ docker-compose.yml          # local postgres + redis
├─ package.json                # root workspace scripts
├─ turbo.json                  # pipeline graph/caching
└─ PRODUCTION.md               # deployment guide
```

### Root Scripts

- `npm run dev` → runs all app dev tasks through Turbo
- `npm run build` → builds all packages/apps
- `npm run lint` → runs lint pipeline
- `npm run dev:api` / `npm run dev:web` → run each app independently

---

## 3) Backend (apps/api)

### 3.1 Core Runtime

- **Framework:** NestJS 11
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Cache/Queue infra:** Redis + Bull
- **Validation:** `class-validator` + global `ValidationPipe`
- **Security pieces:** JWT auth, OAuth providers, throttling
- **API docs:** Swagger enabled outside production

### 3.2 Bootstrap Behavior (`src/main.ts`)

- Global prefix: `/api`
- URI versioning default: `v1`
- CORS origin from `FRONTEND_URL`
- Global exception filter + response transform interceptor
- Swagger route: `/docs` (non-production)

### 3.3 App Module Registration (`src/app.module.ts`)

#### Domain modules
- `AuthModule`
- `CommunityModule`
- `CollaborationModule`
- `MessagingModule`
- `EventModule`
- `PortfolioModule`

#### Intelligence modules
- `RecommendationModule`
- `ReputationModule`
- `SearchModule`

#### Infrastructure modules
- `NotificationModule`
- `MediaModule`
- `QueueModule`

### 3.4 API Controllers Present

- `auth.controller.ts`
- `community.controller.ts`
- `collaboration.controller.ts`
- `event.controller.ts`
- `messaging.controller.ts`
- `notification.controller.ts`
- `portfolio.controller.ts`
- `search.controller.ts`

### 3.5 API Services Present

- `auth.service.ts`
- `community.service.ts`
- `collaboration.service.ts`
- `event.service.ts`
- `messaging.service.ts`
- `notification.service.ts`
- `portfolio.service.ts`
- `search.service.ts`

### 3.6 Data Layer

- TypeORM data source and setup scripts in `src/database/`
- Migrations present:
  - `1708627200000-InitialSchema.ts`
  - `1708627300000-AddIndexes.ts`
- Seed scripts present in `src/database/seeds/`

### 3.7 Backend Status Snapshot

- **Implemented:** core domains, auth stack, search, notifications, messaging APIs, migrations/seeding.
- **Likely evolving:** recommendation/reputation/queue/media feature depth and production tuning.

---

## 4) Frontend (apps/web)

### 4.1 Core Runtime

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 7
- **UI:** Ant Design 5 + custom design tokens (`index.css` + themed variables)
- **Data fetching:** TanStack React Query
- **State:** Zustand (`auth.store.ts`, `ui.store.ts`)
- **Animation:** Framer Motion
- **DnD:** dnd-kit

### 4.2 Routing Surface (`src/App.tsx`)

#### Public routes
- `/` → Landing page
- `/login` → Login/Register
- `/oauth/callback` → OAuth return handler

#### Protected shell (`/dashboard/*`)
- `/dashboard/communities`
- `/dashboard/communities/:slug`
- `/dashboard/communities/:slug/tasks`
- `/dashboard/discover`
- `/dashboard/tasks`
- `/dashboard/events`
- `/dashboard/portfolio/:username`
- `/dashboard/settings`
- `/dashboard/messages`
- `/dashboard/notifications`

#### Legacy redirects
- `/communities`, `/communities/:slug`, `/tasks`, `/events`, `/discover`

### 4.3 Frontend Modules and Pages

#### `auth/`
- `LoginPage.tsx`
- `OAuthCallbackPage.tsx`
- `useAuth.ts`

#### `community/`
- `DashboardPage.tsx`
- `CommunitiesPage.tsx`
- `CommunityDetailPage.tsx`
- `useCommunities.ts`, `useCommunity.ts`

#### `collaboration/`
- `KanbanPage.tsx`
- `useTasks.ts`

#### `event/`
- `EventsPage.tsx`
- `useEvents.ts`

#### `messaging/`
- `MessagingPage.tsx`

#### `notification/`
- `NotificationsPage.tsx`

#### `portfolio/`
- `PortfolioPage.tsx`
- `usePortfolio.ts`

#### `discovery/`
- `DiscoverPage.tsx`

#### `settings/`
- `SettingsPage.tsx`

### 4.4 Shared Components (`src/shared/components`)

- `CommuneLogo.tsx`
- `CommunityCard.tsx`
- `ContributionHeatmap.tsx`
- `EventCard.tsx`
- `StatCard.tsx`
- `Skeletons.tsx`
- `index.ts` (exports)

### 4.5 API Client Layer (`src/api`)

- `client.ts` (axios base client)
- `auth.api.ts`
- `communities.api.ts`
- `events.api.ts`
- `messaging.api.ts`
- `notifications.api.ts`
- `portfolio.api.ts`
- `search.api.ts`
- `tasks.api.ts`

### 4.6 Frontend Status Snapshot

- **Implemented:** all major dashboard surfaces (communities, tasks, events, portfolio, messaging, notifications, discover, settings).
- **Implemented UI infra:** theme system (dark/light), reusable cards, loading skeletons, route-level code splitting.
- **In active polish:** feature UX refinements, edge-case handling, consistency and strict typing cleanup.

---

## 5) Shared Contracts (packages/shared-types)

`packages/shared-types/src/index.ts` contains shared interfaces, including:

- User (`IUser`, `IUserSummary`)
- Auth (`IAuthResponse`)
- Community (`ICommunity`)
- Task (`ITask`)
- Event (`IEvent`)
- Notification (`INotification`)
- Reputation (`IReputation`)
- Portfolio (`IPortfolio`, entries, skills)
- Search (`ISearchResult`)
- Pagination (`IPaginatedResponse<T>`)

This package is consumed by both API and web via workspace dependency `@commune/shared-types`.

---

## 6) Infrastructure and Environments

### 6.1 Local Infra (`docker-compose.yml`)

- PostgreSQL 16 with pgvector container image
- Redis 7
- Named volumes for persistence

### 6.2 Deployment Doc

- `PRODUCTION.md` covers:
  - env variable matrix
  - migration/seed flow
  - build/deploy steps
  - docker production strategy
  - hosting recommendations
  - security hardening checklist

---

## 7) Feature Matrix (Implemented vs Pending)

> Legend: ✅ implemented | 🟡 partial/iterating | ⬜ not found in current workspace state

### Authentication
- ✅ Email/password login flow
- ✅ OAuth callback flow and provider wiring
- 🟡 Full account recovery / email verification UX not clearly visible in current frontend routes

### Communities
- ✅ Community browsing and detail pages
- ✅ Member listing and role display
- ✅ Join/leave interactions
- 🟡 Deep moderation/admin tools appear limited in visible frontend routes

### Collaboration (Tasks)
- ✅ Kanban board page with drag/drop support
- ✅ Task data hook and API layer
- 🟡 Advanced automation/reporting not explicitly visible

### Events
- ✅ Event listing and creation flow
- ✅ Event API + hooks
- 🟡 Rich event analytics/export not explicitly visible

### Messaging
- ✅ Friend request API and response flow
- ✅ DM channels and message send/read polling UI
- 🟡 Full group/community channel chat appears placeholder/limited from current UI state

### Notifications
- ✅ Dedicated notifications page and API integration
- ✅ mark-as-read / mark-all-read support

### Portfolio
- ✅ Portfolio profile page and API hooks
- ✅ Skills/entries/reputation surfacing
- 🟡 Advanced portfolio customization workflow likely still evolving

### Discover/Search
- ✅ Discover page and backend search module
- ✅ Search result typing supports community/user/event/task
- 🟡 Ranking/semantic enhancements may evolve further

### Recommendations/Reputation/Queue/Media
- ✅ Module folders exist in backend architecture
- 🟡 Visible frontend consumption for all these modules is partial or not explicit in current route set

---

## 8) Design System and UX Surface

### Theme System
- Global CSS variable-driven tokens (`index.css`)
- Theme mode in UI store (`dark` / `light`)
- Ant Design theme provider switch in `App.tsx`

### Layout
- `AppLayout.tsx` provides dashboard shell (sidebar/header/content)
- Public marketing route (`LandingPage.tsx`) exists outside dashboard shell

### Reusable Visual Components
- Community card
- Event card
- Stat card
- Contribution heatmap
- Shared skeleton loaders
- Centralized logo component

---

## 9) Data Flow and Conventions

### Frontend
- `src/api/*` contains HTTP contract wrappers
- `src/modules/*/hooks/*` contains React Query hooks
- Pages consume hooks and render UI
- Zustand stores hold auth and UI preferences

### Backend
- Controller handles request/response boundaries
- Service layer contains business logic
- TypeORM entities + repositories persist state
- Global interceptor normalizes response envelope

---

## 10) What Is Added vs Not Added (Practical View)

### Added / Present in Workspace
- Full monorepo setup (API + Web + shared types)
- Auth, communities, tasks, events, messaging, notifications, portfolio, search modules
- DB migrations and seeding scripts
- Production deployment playbook

### Not Explicitly Added (or Not clearly surfaced in current code snapshot)
- Mobile-native app client
- E2E test suite for web app flow (not obvious from current visible tree)
- Public plugin architecture / extension system
- Multi-tenant org-level billing/subscription layer
- Dedicated observability dashboards/code for telemetry pipelines

---

## 11) Recommended Next Documentation Files (Optional)

If you want to take this even further, add:

1. `CONTRIBUTING.md` — setup conventions, branch naming, PR checklist
2. `ARCHITECTURE_DECISIONS.md` — ADRs and design rationale
3. `API_CONTRACTS.md` — endpoint matrix by module
4. `SECURITY.md` — vulnerability reporting and secure coding checklist

---

## 12) Quick Navigation Map

- Backend entry: `apps/api/src/main.ts`
- Backend module registry: `apps/api/src/app.module.ts`
- Frontend entry: `apps/web/src/main.tsx`
- Frontend router: `apps/web/src/App.tsx`
- Layout shell: `apps/web/src/layouts/AppLayout.tsx`
- Shared types: `packages/shared-types/src/index.ts`
- Deployment guide: `PRODUCTION.md`

---

If you’d like, I can also generate a **component-by-component API + prop reference** for all React components in `apps/web/src/shared/components` and `apps/web/src/modules/*/pages` as a third documentation file.
