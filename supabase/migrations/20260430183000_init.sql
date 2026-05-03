create extension if not exists "pgcrypto";

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text not null,
  phone text not null,
  whatsapp text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  automation_items text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  source text not null,
  status text not null check (
    status in ('חדש', 'נוצר קשר', 'מתעניין', 'מעקב', 'נקבעה פגישה', 'נסגר', 'אבוד')
  ),
  estimated_value_agorot integer not null default 0 check (estimated_value_agorot >= 0),
  interest_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  price_agorot integer not null default 0 check (price_agorot >= 0),
  stock integer not null default 0 check (stock >= 0),
  tag text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_slots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  window_label text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null check (status in ('פנוי', 'שמור', 'הושלם')),
  owner text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or starts_at < ends_at)
);

create table public.sales_calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  provider_call_id text unique,
  lead_id uuid references public.leads(id) on delete set null,
  lead_name text not null,
  phone text not null,
  interest text not null,
  status text not null check (
    status in ('queued', 'ringing', 'in-progress', 'ended', 'failed')
  ),
  summary text,
  transcript text,
  recording_url text,
  ended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_business_created_idx on public.leads (business_id, created_at desc);
create index products_business_created_idx on public.products (business_id, created_at desc);
create index calendar_slots_business_created_idx on public.calendar_slots (business_id, created_at desc);
create index sales_calls_business_created_idx on public.sales_calls (business_id, created_at desc);
create index sales_calls_provider_call_id_idx on public.sales_calls (provider_call_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_businesses_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger set_business_settings_updated_at
before update on public.business_settings
for each row execute function public.set_updated_at();

create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_calendar_slots_updated_at
before update on public.calendar_slots
for each row execute function public.set_updated_at();

create trigger set_sales_calls_updated_at
before update on public.sales_calls
for each row execute function public.set_updated_at();
