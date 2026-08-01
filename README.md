# BashaKhujo

A two-sided rental platform helping bachelors in Dhaka, Bangladesh find safe rooms and flats, and helping landlords find genuine tenants.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes + custom Socket.io server
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT with httpOnly cookies
- **Real-time:** Socket.io for in-app chat

## Features

### Priority 1 (Core MVP)
- Signup/Login with role selection (Seeker / Lister)
- Landing page with search
- Browse listings with filters (area, budget, room type, bachelor-friendly)
- Listing detail with photos, lister verification & ratings
- Create listing (Listers)
- Real-time in-app chat
- Review & rating system

### Priority 2
- NID-based lister verification (mock approval)
- Escrow-style advance payment flow (mock: Held → Released)
- Report/dispute button

### Priority 3
- Map view with listing pins
- User dashboard (saved listings, chats, transactions)
- Basic admin panel for reports

## Quick Start

### Prerequisites
- Node.js 20+
- Optional: Docker (for PostgreSQL in production)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Push database schema & seed demo data
npm run db:setup

# 4. Start dev server (Next.js + Socket.io)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Note:** Development uses SQLite (`file:./dev.db` in the `prisma/` folder). For production on Railway/Render, switch `provider` in `prisma/schema.prisma` to `postgresql` and set a `DATABASE_URL` from your hosted Postgres instance.

### Demo Accounts

| Role   | Email            | Password |
|--------|------------------|----------|
| Seeker | seeker@demo.com  | demo123  |
| Lister | lister@demo.com  | demo123  |
| Admin  | admin@demo.com   | demo123  |

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server with Socket.io |
| `npm run build`| Production build               |
| `npm run start`| Start production server        |
| `npm run db:push` | Push Prisma schema to DB   |
| `npm run db:seed` | Seed demo data              |

## Deployment

Deploy the full stack (Next.js + Socket.io + API) to **Railway** or **Render** using the custom `server.ts` entry point. Vercel alone won't support Socket.io without a separate socket server.

### Railway (recommended)

1. Create a new project and add a **PostgreSQL** plugin
2. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`
3. Change `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`
4. Deploy from GitHub — `railway.toml` runs migrations + seed on start

### Docker

```bash
docker build -t bashakhujo .
docker run -p 3000:3000 -e DATABASE_URL="..." -e JWT_SECRET="..." bashakhujo
```

## Environment Variables

See `.env.example` for required variables.

## Project Structure

```
src/
  app/           # Next.js pages & API routes
  components/    # Reusable UI components
  context/       # React context (auth)
  lib/           # Utilities, Prisma, auth, socket
prisma/          # Schema & seed
server.ts        # Custom server with Socket.io
```
