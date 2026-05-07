-- MVP-0: multi-agent platform foundation
-- Adds: business_users (auth join), agents (per-business agent config),
--       agent_id FK on sales_calls, RLS policies on all tenant tables.
-- Service role continues to bypass RLS (used by webhooks + auto-provision).

-- ---------------------------------------------------------------------------
-- business_users: join between auth.users and businesses
-- ---------------------------------------------------------------------------
create table public.business_users (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create index business_users_business_idx on public.business_users (business_id);

alter table public.business_users enable row level security;

-- ---------------------------------------------------------------------------
-- agents: each business can create multiple agents (name, persona, services)
-- ---------------------------------------------------------------------------
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  persona text not null default '',
  services_text text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agents_business_created_idx on public.agents (business_id, created_at desc);

create trigger set_agents_updated_at
before update on public.agents
for each row execute function public.set_updated_at();

alter table public.agents enable row level security;

-- ---------------------------------------------------------------------------
-- sales_calls: link to the agent that placed the call
-- ---------------------------------------------------------------------------
alter table public.sales_calls
  add column agent_id uuid references public.agents(id) on delete set null;

create index sales_calls_agent_idx on public.sales_calls (agent_id);

-- ---------------------------------------------------------------------------
-- RLS policies
-- Pattern: a row is visible to a user iff its business_id matches one of the
-- business_users rows for that user. Service role bypasses RLS automatically.
-- ---------------------------------------------------------------------------

-- business_users: a user sees only their own membership rows.
create policy "business_users_self" on public.business_users
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- businesses: scoped by membership.
create policy "businesses_tenant" on public.businesses
  for all
  using (
    id in (select business_id from public.business_users where user_id = auth.uid())
  )
  with check (
    id in (select business_id from public.business_users where user_id = auth.uid())
  );

-- business_settings, leads, products, calendar_slots, sales_calls, agents:
-- standard tenant isolation by business_id.
create policy "business_settings_tenant" on public.business_settings
  for all
  using (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  )
  with check (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  );

create policy "leads_tenant" on public.leads
  for all
  using (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  )
  with check (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  );

create policy "products_tenant" on public.products
  for all
  using (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  )
  with check (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  );

create policy "calendar_slots_tenant" on public.calendar_slots
  for all
  using (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  )
  with check (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  );

create policy "sales_calls_tenant" on public.sales_calls
  for all
  using (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  )
  with check (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  );

create policy "agents_tenant" on public.agents
  for all
  using (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  )
  with check (
    business_id in (select business_id from public.business_users where user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Seed: a default agent for the demo business so existing demo flows work.
-- Idempotent: re-runnable.
-- ---------------------------------------------------------------------------
insert into public.agents (id, business_id, name, persona, services_text)
values (
  'a0000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'סוכן ברירת מחדל',
  'סוכן מכירות מנומס שמדבר עברית טבעית ומתאם פגישות התקנה ומדידה.',
  'ארונות הזזה, מזנונים, שולחנות אוכל. שיחות מתאמות פגישות מדידה והתקנה.'
)
on conflict (id) do nothing;
