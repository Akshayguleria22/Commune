# Commune — Production Deployment Guide

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Environment Variables](#2-environment-variables)
3. [Database Setup](#3-database-setup)
4. [Build & Deploy Backend](#4-build--deploy-backend)
5. [Build & Deploy Frontend](#5-build--deploy-frontend)
6. [Docker Production Setup](#6-docker-production-setup)
7. [Recommended Hosting](#7-recommended-hosting)
8. [Security Hardening](#8-security-hardening)
9. [Monitoring & Logging](#9-monitoring--logging)
10. [CI/CD Pipeline](#10-cicd-pipeline)

---

## 1. Pre-Deployment Checklist

- [ ] All environment variables set (see section 2)
- [ ] PostgreSQL 16+ with pgvector extension available
- [ ] Redis 7+ instance available
- [ ] Domain name configured with SSL/TLS
- [ ] OAuth callback URLs updated to production domain
- [ ] JWT secret is a strong random string (32+ chars)
- [ ] CORS origin set to production frontend URL
- [ ] Database migrations run successfully
- [ ] Seed data applied if needed
- [ ] Build passes with zero errors (`turbo build`)

---

## 2. Environment Variables

### Backend (`apps/api/.env`)

Start from `apps/api/.env.production.example` and set your real secrets in hosting provider env settings.

```env
NODE_ENV=production
PORT=3000

# Frontend URL — CORS origin
FRONTEND_URL=https://your-domain.com

# Database (Neon)
# Runtime traffic: use pooler URL
DATABASE_URL=postgresql://<user>:<password>@<pooler-host>/<db>?sslmode=verify-full
# Optional migration URL: direct endpoint (without pooler)
MIGRATION_DATABASE_URL=postgresql://<user>:<password>@<direct-host>/<db>?sslmode=verify-full
DB_SSL=true

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<64-char-random-hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis — use managed Redis (Upstash, Railway, AWS ElastiCache)
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# OAuth — update callback URLs to production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.your-domain.com/api/v1/auth/oauth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://api.your-domain.com/api/v1/auth/oauth/github/callback
```

### Frontend (`apps/web/.env.production`)

```env
VITE_API_URL=https://api.your-domain.com/api/v1
```

> **Important:** Update OAuth callback URLs in both Google Cloud Console and GitHub Developer Settings to match your production domain.

---

## 3. Database Setup

### Option A: Managed PostgreSQL (Recommended)

Use **Neon** (free tier), **Supabase**, **Railway**, or **AWS RDS**.

1. Create a PostgreSQL 16+ database
2. Enable the `pgvector` extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run migrations:
   ```bash
   cd apps/api
   npm run migration:run
   ```
4. (Optional) Seed initial data:
   ```bash
   npm run seed
   ```

### Option B: Self-Hosted with Docker

The included `docker-compose.yml` already configures PostgreSQL with pgvector and Redis. For production, add resource limits and persistence.

---

## 4. Build & Deploy Backend

### Build

```bash
cd apps/api
npm run build
```

This compiles TypeScript to `dist/`. The production entry point is:

```bash
node dist/main.js
```

### Run in Production

```bash
NODE_ENV=production node dist/main.js
```

Or use **PM2** for process management:

```bash
npm install -g pm2
pm2 start dist/main.js --name commune-api -i max
pm2 save
pm2 startup
```

### Health Check

The API exposes Swagger docs at `GET /api/v1/docs` (disable in production if desired).

---

## 5. Build & Deploy Frontend

### Build

```bash
cd apps/web
npm run build
```

This creates an optimized static build in `dist/`.

### Deploy Options

| Platform       | Command / Steps                                      |
|----------------|------------------------------------------------------|
| **Vercel**     | Connect repo → Framework: Vite → Root: `apps/web`    |
| **Netlify**    | Build: `cd apps/web && npm run build` → Publish: `apps/web/dist` |
| **Cloudflare Pages** | Framework: None → Build: `npm run build` → Output: `dist` |
| **Static host** | Upload `apps/web/dist/` to any CDN/static server    |

### SPA Routing

Add a redirect rule so all routes serve `index.html`:

**Vercel** (`apps/web/vercel.json`):
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Netlify** (`apps/web/public/_redirects`):
```
/*    /index.html   200
```

**Nginx**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 6. Docker Production Setup

Create a `Dockerfile` for the API:

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Production `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  api:
    build: ./apps/api
    ports:
      - '3000:3000'
    env_file: ./apps/api/.env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USERNAME}']
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD}', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

volumes:
  pgdata:
  redisdata:
```

---

## 7. Recommended Hosting

### Budget-Friendly (Free / <$10/mo)

| Component   | Service                | Cost       |
|-------------|------------------------|------------|
| **Backend** | Railway / Render       | Free–$5/mo |
| **Frontend**| Vercel / Netlify       | Free       |
| **Database**| Neon / Supabase        | Free tier  |
| **Redis**   | Upstash                | Free tier  |

### Production-Grade

| Component   | Service                | Notes                  |
|-------------|------------------------|------------------------|
| **Backend** | AWS ECS / GCP Cloud Run | Auto-scaling           |
| **Frontend**| Vercel / Cloudflare    | Edge CDN               |
| **Database**| AWS RDS / Neon Pro     | Managed backups        |
| **Redis**   | AWS ElastiCache / Upstash | Managed, persistent |

### Quickest Path: Railway

1. Push code to GitHub
2. Create Railway project → Add PostgreSQL + Redis services
3. Add API service → Set root to `apps/api` → Set start command: `npm run start:prod`
4. Add environment variables from section 2
5. Deploy frontend to Vercel with `VITE_API_URL` pointing to Railway API URL

---

## 8. Security Hardening

### Already Implemented
- JWT access + refresh token rotation
- Bcrypt password hashing
- Rate limiting via `@nestjs/throttler`
- CORS restricted to `FRONTEND_URL`
- Input validation via `class-validator`

### Production Additions

1. **HTTPS Only** — Use a reverse proxy (Nginx/Caddy) or managed platform with SSL
2. **Helmet** — Add HTTP security headers:
   ```bash
   npm install helmet
   ```
   ```typescript
   // main.ts
   import helmet from 'helmet';
   app.use(helmet());
   ```
3. **Rate Limiting** — Already configured via throttler. Tighten for auth routes:
   ```typescript
   @Throttle({ default: { limit: 5, ttl: 60000 } })
   ```
4. **Environment Variables** — Never commit `.env` files. Use platform secrets.
5. **CORS** — Restrict to exact production domain (already configured via `FRONTEND_URL`).
6. **Database** — Use SSL connections (`DB_SSL=true`), restrict network access.
7. **Disable Swagger in Production**:
   ```typescript
   if (process.env.NODE_ENV !== 'production') {
     // Swagger setup...
   }
   ```

---

## 9. Monitoring & Logging

### Logging

NestJS has built-in logging. For production, add structured logging:

```bash
npm install winston nest-winston
```

### APM & Error Tracking

| Tool       | Purpose              | Free Tier |
|------------|----------------------|-----------|
| **Sentry** | Error tracking       | Yes       |
| **Axiom**  | Log aggregation      | Yes       |
| **Better Stack** | Uptime monitoring | Yes  |

### Health Endpoint

Add a simple health endpoint:

```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

---

## 10. CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build --workspace=apps/api
      - run: npm run build --workspace=apps/web

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Add deployment step for your platform (Railway, Render, etc.)

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Vercel auto-deploys from GitHub — no action needed
```

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# 3. Copy env file and configure
cp apps/api/.env.example apps/api/.env

# 4. Run database migrations
cd apps/api && npm run migration:run

# 5. Seed data (optional)
npm run seed

# 6. Start development
cd ../.. && npm run dev    # runs both API and web via turbo

# 7. Build for production
npm run build              # builds both via turbo

# 8. Start production API
cd apps/api && npm run start:prod
```

---

## Architecture Summary

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL   │
│  React/Vite  │     │   NestJS     │     │  + pgvector   │
│  Vercel/CDN  │     │  Railway/ECS │     │  Neon/RDS     │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │    Redis     │
                     │  Bull Queues │
                     │  Upstash     │
                     └──────────────┘
```
