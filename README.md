# BashaKhujo 🏠

**A Bachelor Room & Flat Rental Platform for Dhaka**

BashaKhujo is a two-sided rental platform built for the Dhaka rental market — helping bachelors and single job-holders find safe, verified rooms and flats, and helping landlords or sub-letters find genuine tenants through a proper channel instead of "To-Let" signs, phone spam, or scattered Facebook groups.

> Built as a submission for the **B-JET Cohort 16 Ideathon**.

## Why This Project

In Dhaka, finding housing is especially hard for singles — many landlords prefer married couples or families, which sharply limits options for bachelors. On top of that, unreliable landlords, unverified listings, and advance payments that are hard to recover make the search stressful and risky. On the other side, people renting out a room or subletting a flat often struggle to find genuine tenants through a proper channel.

BashaKhujo fixes this problem on both sides with verified listings, in-app reviews, direct chat, and a secure escrow-style advance payment flow.

## Features

### Core (MVP)
- Signup/Login with role selection (Seeker / Lister)
- Browse & filter listings by area, budget, and room type (bachelor-friendly, sublet, full flat)
- Listing detail page with photos, video, and lister ratings/reviews
- Create listing (for Listers)
- Real-time in-app chat between Seeker and Lister
- Review & rating system after a completed transaction

### Trust & Safety
- NID-based lister verification badge
- Escrow-style advance payment (held by the platform, released only after move-in is confirmed)
- Report/dispute option for suspicious listings or users

### Planned
- Map view with listing pins (Google Maps)
- User dashboard (saved listings, ongoing chats, transaction history)
- Basic admin panel for reviewing reports

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes + custom Socket.io server |
| Database | SQLite (dev) / PostgreSQL (production), via Prisma ORM |
| Auth | JWT with httpOnly cookies |
| Real-time chat | Socket.io |

## Getting Started

### Prerequisites
- Node.js 20+

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Push database schema & seed demo data
npm run db:setup

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Seeker | seeker@demo.com | demo123 |
| Lister | lister@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

## Project Structure

```
src/
  app/           # Pages & API routes
  components/    # Reusable UI components
  context/       # React context (auth)
  lib/           # Utilities, Prisma client, auth, socket
prisma/          # Database schema & seed data
server.ts        # Custom server with Socket.io
```

## Deployment

Deploy to **Railway** or **Render** (Vercel alone doesn't support the custom Socket.io server):

1. Create a project and add a PostgreSQL plugin
2. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`
3. Switch the Prisma `provider` from `sqlite` to `postgresql`
4. Deploy from GitHub

## Author

Built by **Fariha Rahman Saba** as an Ideathon submission for B-JET Cohort 16.
**Live Website Link:** https://bashakhujo.onrender.com/ (Note: hosted on a free tier, so the first load may take up to a minute to wake up.)
