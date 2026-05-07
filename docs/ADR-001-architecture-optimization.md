# ADR-001: BusyAI Architecture Optimization

**Status:** Proposed  
**Date:** 2026-05-07  
**Deciders:** Orel Chalfon  
**Scope:** Full-stack — auth, data model, security, caching, multi-channel expansion

---

## Context

BusyAI is a Hebrew-first CRM and AI sales automation dashboard for Israeli businesses. The current build delivers a single-tenant Vapi outbound-call agent with a Supabase backend. Three strategic forces are shaping the next phase:

1. **SaaS productization** — the codebase is built around a hardcoded `DEFAULT_BUSINESS_ID` placeholder. Signing up real businesses requires multi-tenancy and auth.
2. **Security exposure** — the webhook endpoint and API routes are unauthenticated; the service role key bypasses all RLS policies.
3. **Channel expansion** — the uploaded product specs describe a tiered Instagram DM automation service (Starter / Growth / Elite) with 30 funnel types, lead scoring, CRM sync, and AI-powered replies. This is a second revenue channel that must be integrated into the platform without forking the architecture.

The following ADR captures the six critical decisions needed to evolve from a functional demo to a shippable, multi-tenant, multi-channel SaaS.

---

## Decision 1: Auth + Multi-Tenancy via Supabase Auth + RLS

### Context

Every server-side DB call today uses the **service role key**, which bypasses RLS entirely. The `DEFAULT_BUSINESS_ID` constant is a placeholder — there is no concept of a logged-in user. The `unstable_cache` keys (`["leads"]`, `["sales-calls"]`, etc.) are global, not scoped to a tenant, so adding a second business would serve the wrong cached data.

### Options Considered

| Dimension | Option A: Supabase Auth + RLS (anon key per request) | Option B: Custom JWT + service role always |
|---|---|---|
| Complexity | Low — Supabase handles sessions | Medium — custom token verification |
| Cost | $0 additional | $0 additional |
| Security | RLS enforced at DB layer | Application-layer enforcement, error-prone |
| Time to ship | 1–2 days | 3–5 days |
| Multi-tenancy | Native via `auth.uid()` in RLS | Manual `business_id` guards on every query |

### Decision

**Use Supabase Auth (email/password or Magic Link) + RLS on the anon/user key for all dashboard reads and writes.**

The service role key is reserved for two cases only:
1. Vapi webhook handler (no user session, needs trusted write access).
2. Server Actions that execute on behalf of an authenticated session where the user key is passed through.

**RLS policy pattern for all tables:**

```sql
-- businesses
CREATE POLICY "owner_access" ON businesses
  USING (id = (SELECT business_id FROM business_users WHERE user_id = auth.uid()));

-- leads, sales_calls, products, calendar_slots, business_settings
CREATE POLICY "tenant_isolation" ON leads
  USING (business_id = (SELECT business_id FROM business_users WHERE user_id = auth.uid()));
```

**Cache key fix — always scope to business_id:**

```typescript
// Before (broken for multi-tenant)
unstable_cache(queryLeads, ["leads"], { tags: ["leads"] })

// After
unstable_cache(queryLeads, [`leads-${businessId}`], { tags: [`leads-${businessId}`] })
```

### Consequences

- Dashboard pages become protected routes behind `middleware.ts` (next-intl already has a middleware hook — add auth check there).
- `server/db/client.ts` needs two exported clients: `getSupabaseServerClient()` (service role, webhook-only) and `getSupabaseUserClient(sessionToken)` (anon/user, dashboard).
- `DEFAULT_BUSINESS_ID` is deleted; `businessId` is resolved from the session on every request.
- All `unstable_cache` keys must include the business ID as a cache key segment.

---

## Decision 2: Webhook Signature Verification

### Context

`/api/webhooks/vapi` accepts any POST request and writes directly to the `sales_calls` table using the service role key. There is no verification that the request originated from Vapi. A malicious actor could poison call records by sending fake payloads.

### Decision

**Verify the `x-vapi-secret` header on every inbound webhook request.**

Vapi supports a configurable webhook secret. Set it as `VAPI_WEBHOOK_SECRET` in the environment and verify before processing:

```typescript
// In /api/webhooks/vapi/route.ts — add at the top of POST()
const secret = request.headers.get("x-vapi-secret");
if (secret !== process.env.VAPI_WEBHOOK_SECRET) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Additionally, add the secret to Vapi's `assistantOverrides.server` config in `client.ts`:

```typescript
server: {
  url: `${process.env.APP_BASE_URL}/api/webhooks/vapi`,
  secret: process.env.VAPI_WEBHOOK_SECRET
}
```

### Consequences

- Adds `VAPI_WEBHOOK_SECRET` to the required env vars list.
- Zero performance cost — header check runs before any DB access.
- Must also add basic auth or an `Authorization` header check to `/api/vapi/calls` so only authenticated dashboard users can trigger outbound calls (the session cookie approach, or a short-lived token passed from the frontend).

---

## Decision 3: Consolidate the Dual Call-Record Data Models

### Context

There are currently two parallel representations of the same `sales_calls` table row:

- `SalesCallRecord` in `server/calls/store.ts` — full shape including `transcript`, `recordingUrl`, `endedReason`, `providerCallId`.
- `CallRecord` in `server/db/data.ts` — trimmed shape with Hebrew-localized `status` strings baked in at the data layer.

`data.ts` also exposes `getCallRecords()` (used in the dashboard stats) and `store.ts` exposes `listSalesCalls()` (used in the agent page). Both query the same table. This is a maintenance hazard — any schema change must be updated in two places.

### Decision

**Retain `SalesCallRecord` as the canonical server model. Delete `CallRecord` from `data.ts` and replace `getCallRecords()` with a thin adapter that calls `listSalesCalls()`.**

Status localization (Hebrew labels) moves to the presentation layer — either in the Server Component that renders the list, or in a shared `formatCallStatus(status, t)` utility that takes the `next-intl` translator as a parameter:

```typescript
// lib/format-call-status.ts
export function formatCallStatus(status: SalesCallStatus, t: ReturnType<typeof useTranslations>) {
  return t(`callStatuses.${status}`);
}
```

This ensures the data layer speaks English (canonical status strings) and the UI layer speaks Hebrew/English based on locale.

### Consequences

- `data.ts` becomes the module for dashboard aggregate queries (stats, cross-entity joins). Call-level CRUD lives exclusively in `store.ts`.
- Removes one source of truth conflict; adding a new status only requires a DB migration + one `SalesCallStatus` type update.
- The `mapCallStatus()` function in `data.ts` is deleted; the agent page already has its own `statusLabels` map and the calls page can reuse a shared formatter.

---

## Decision 4: Fix the `revalidateTag` API Call

### Context

`revalidateTag` in Next.js 13+ accepts only one argument — a string tag name. The current calls pass a second argument `{ expire: 0 }` which is not part of the API and is silently ignored:

```typescript
// Current (broken / no-op second arg)
revalidateTag(SALES_CALLS_CACHE_TAG, { expire: 0 });

// Correct
revalidateTag(SALES_CALLS_CACHE_TAG);
```

This is low-risk today (the cache is still invalidated) but signals that cache behavior is untested and could mask a real bug in Next.js 16 if the API changes.

### Decision

**Remove the second argument from all `revalidateTag` calls. Add cache invalidation regression coverage by manually testing end-to-end after a call is created (new call should appear in the agent page within 60s without a hard reload).**

---

## Decision 5: Dynamic Playbook — Use Business Settings

### Context

`server/vapi/playbook.ts` has the business name `"LeadPilot AI demo"` hardcoded in the system prompt. The `businesses` table stores `name` and `industry`. When a real business signs up, the assistant should introduce itself as their brand, not "LeadPilot AI demo."

### Decision

**Pass `BusinessSettings` into `buildHebrewSalesPrompt()` so the system prompt is fully dynamic.**

```typescript
// server/vapi/playbook.ts
export function buildHebrewSalesPrompt(input: StartSalesCallInput, business: BusinessSettings) {
  return [
    `You are a professional Hebrew-speaking AI sales agent for ${business.business.name}.`,
    `Industry: ${business.business.industry}.`,
    // ...rest of prompt
  ].join("\n");
}
```

`startVapiCallCommand` already has access to the DB — it creates the call record before calling Vapi. Add a `getBusinessSettings()` call before `startVapiSalesCall()` and thread `business` through to `buildHebrewSalesPrompt`.

### Consequences

- First-message greeting (`שלום ${leadName}`) should also reference the business name, not "LeadPilot AI".
- `VAPI_ASSISTANT_ID` points to a Vapi-configured assistant. `assistantOverrides.systemPrompt` must be set in the `startVapiSalesCall` call to override the static Vapi dashboard prompt with the dynamic one.

---

## Decision 6: Multi-Channel Architecture for Instagram Automation

### Context

The uploaded product documents describe a complete Instagram DM automation service with 30 funnel types across three tiers (Starter at ₪350/mo, Growth at ₪650/mo, Elite at ₪1,200/mo). This is a second acquisition channel alongside Vapi outbound calls. Both channels share the same core entities: `businesses`, `leads`, `products`, `business_settings`.

The risk is building Instagram automation as a parallel, disconnected system — duplicate lead tables, duplicate business configs, no shared CRM layer.

### Options Considered

| Dimension | Option A: Extend BusyAI schema with `channel` field | Option B: Separate microservice / separate DB |
|---|---|---|
| Complexity | Low — add `source_channel` to `leads`, new `instagram_funnels` table | High — cross-service lead deduplication, separate deploys |
| Shared CRM | Native — one `leads` table, all channels write to it | Requires sync job or event bus |
| Demo simplicity | Single dashboard shows all leads regardless of channel | Requires a unified view API |
| Cost | $0 additional infrastructure | Separate Supabase project or schema |
| Time to ship Starter tier | 3–5 days (3 funnels + ManyChat webhook receiver) | 2–4 weeks |

### Decision

**Extend the existing BusyAI schema to support Instagram automation as a native channel. Do NOT create a parallel system.**

**Schema additions:**

```sql
-- Stores Instagram funnels (keyword triggers, DM flows)
CREATE TABLE instagram_funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id),
  name text NOT NULL,
  trigger_keyword text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('starter', 'growth', 'elite')),
  funnel_type text NOT NULL, -- 'lead_magnet', 'qualification', 'calendar', etc.
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- All leads now carry a source_channel
ALTER TABLE leads ADD COLUMN source_channel text NOT NULL DEFAULT 'manual'
  CHECK (source_channel IN ('manual', 'instagram_dm', 'vapi_call', 'web_form'));

-- Instagram-specific lead metadata
ALTER TABLE leads ADD COLUMN instagram_username text;
ALTER TABLE leads ADD COLUMN funnel_id uuid REFERENCES instagram_funnels(id);
```

**Webhook receiver:**

Add `/api/webhooks/instagram` (or `/api/webhooks/manychat`) to receive lead payloads from ManyChat / Make.com when a funnel captures a new lead. This route verifies a shared secret, upserts the lead into `leads` with `source_channel = 'instagram_dm'`, and fires a cache revalidation.

**Dashboard:**

The leads page gains a `source_channel` filter pill. Stats cards can break down "new leads this week" by channel. The agent page can trigger Vapi follow-up calls directly from an Instagram lead that passed qualification — closing the loop between channels.

### Consequences

- ManyChat → Make.com / Zapier → `/api/webhooks/instagram` is the integration path for Starter/Growth. Elite adds a direct Instagram Graph API integration for AI-powered free-text replies.
- The `instagram_funnels` table is managed through a new `/dashboard/funnels` page (future sprint).
- `business_settings.automation_items` (currently an unstructured `string[]`) should be superseded by the typed `instagram_funnels` table for channel config.
- Both channels (Vapi + Instagram) feed the same `leads` table — one CRM view, all channels.

---

## Trade-off Summary

| Issue | Severity | Effort to Fix | Priority |
|---|---|---|---|
| No auth / hardcoded business ID | Critical | 2–3 days | Sprint 1 |
| Webhook lacks signature verification | Critical | 2 hours | Sprint 1 |
| Service role key used for dashboard reads | High | 1 day | Sprint 1 |
| Duplicate `CallRecord` / `SalesCallRecord` | Medium | 2 hours | Sprint 1 |
| Cache keys not tenant-scoped | Medium | 1 hour | Sprint 1 |
| `revalidateTag` wrong args | Low | 15 min | Sprint 1 |
| Hardcoded business name in playbook | Medium | 1 hour | Sprint 2 |
| Instagram channel schema + webhook | High (revenue) | 3–5 days | Sprint 2 |

---

## Action Items

### Sprint 1 — Security & Foundation
- [ ] Add `auth.users` + `business_users` join table migration
- [ ] Implement Supabase Auth (Magic Link) — protect dashboard behind `middleware.ts`
- [ ] Create `getSupabaseUserClient(session)` for dashboard reads (anon key + RLS)
- [ ] Add `VAPI_WEBHOOK_SECRET` verification to `/api/webhooks/vapi`
- [ ] Add session-based auth guard to `/api/vapi/calls`
- [ ] Scope all `unstable_cache` keys to `businessId`
- [ ] Fix `revalidateTag` to remove second argument
- [ ] Delete `CallRecord` from `data.ts`, converge on `SalesCallRecord` + locale formatter

### Sprint 2 — Dynamic Playbook + Instagram Channel
- [ ] Thread `BusinessSettings` into `buildHebrewSalesPrompt()`
- [ ] Update `startVapiSalesCall` to set `assistantOverrides.systemPrompt` dynamically
- [ ] Create `instagram_funnels` table migration
- [ ] Add `source_channel` and `funnel_id` columns to `leads` migration
- [ ] Implement `/api/webhooks/instagram` receiver (ManyChat / Make.com payload format)
- [ ] Add channel filter to leads dashboard page
- [ ] Build `/dashboard/funnels` CRUD page (Starter: 2 funnels max, Growth: 5, Elite: unlimited)
- [ ] Delete `business_settings.automation_items` or migrate to funnel records
