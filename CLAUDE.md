# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version

This project uses **Next.js 16.2.4** — a version with breaking changes from what's in your training data. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Run production server
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check (no emit)
```

No test suite exists yet.

## What This Is

**BusyAI** is a Hebrew-first CRM and AI sales automation dashboard for Israeli businesses. It lets businesses run AI agents that make outbound sales calls in Hebrew via Vapi.ai.

## Architecture

### Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS 4 + PostCSS
- **i18n:** next-intl — Hebrew (`he`) is the default locale, English (`en`) also supported
- **Database:** Supabase (PostgreSQL) via service role — all DB access is server-side only
- **AI Call Provider:** Vapi.ai (phone calls — voice/STT/LLM stack configured in the Vapi dashboard)
- **Package manager:** pnpm

### Directory Structure

```
app/
  api/
    vapi/calls/          # POST — initiate Vapi outbound call
    webhooks/vapi/       # POST — receive Vapi status + end-of-call webhooks
  [locale]/dashboard/    # Localized dashboard pages (he/en)
    agent/               # AI agent testing & call history
    calls/               # Call management
    leads/               # Lead database
    products/            # Product catalog
    calendar/            # Scheduling
    settings/            # Business configuration

components/dashboard/    # Shared dashboard UI components
server/
  api/                   # apiSuccess / apiFailure response helpers
  commands/              # Business logic (Command pattern)
  calls/store.ts         # Sales call DB operations
  db/                    # Supabase client + TypeScript types
  vapi/                  # Vapi client, commands, sales playbook

lib/
  api.ts                 # API client fetch helpers + ApiErrorCode enum
  site.ts                # Site config (URL, name)
  utils.ts               # cn() and other UI utilities
  mock-data.ts           # Dev mock data

i18n/                    # next-intl routing + request config
messages/                # he.json, en.json translation files
supabase/                # DB migrations
```

### API Response Shape

All API routes use a consistent envelope from `server/api/`:

```typescript
// success
{ ok: true, data: T }

// failure
{ ok: false, error: { code: ApiErrorCode, message: string } }
```

`ApiErrorCode` is defined in `lib/api.ts`. Errors are typed as `CommandError` in server code.

### Key Patterns

- **`server-only`** imports guard all Supabase and API key usage — nothing leaks to the browser.
- **Commands pattern** — business logic lives in `server/commands/` and `server/vapi/commands.ts`. API routes call commands and translate results to HTTP responses.
- **Phone formatting** — Vapi expects E.164 (`+972...`); normalization happens in the command layer.
- **Caching** — `unstable_cache` (60 s revalidate) wraps DB reads for the calls list.
- **Single business ID** — `DEFAULT_BUSINESS_ID` in `server/db/` is a placeholder for future multi-tenancy.
- **Hebrew prompts** — The Vapi sales system prompt is in Hebrew and targets the Israeli sales context (`server/vapi/playbook.ts`).

### Environment Variables

```
VAPI_API_KEY
VAPI_ASSISTANT_ID
VAPI_PHONE_NUMBER_ID
APP_BASE_URL                  # Webhook callback base (e.g. http://localhost:3000)
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL          # Optional, defaults to https://busy.ai
```
