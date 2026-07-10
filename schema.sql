create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  location text not null default '',
  plot_price numeric not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materials_catalog (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  unit text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category, name, unit)
);

create table if not exists public.material_transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  catalog_id uuid references public.materials_catalog(id) on delete set null,
  custom_item_name text,
  custom_unit text,
  quantity numeric not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  vendor_name text not null default '',
  transaction_date date not null default current_date,
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint material_transactions_exactly_one_item check (
    (catalog_id is not null and custom_item_name is null)
    or
    (catalog_id is null and custom_item_name is not null)
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_material_transactions_updated_at on public.material_transactions;
create trigger set_material_transactions_updated_at
before update on public.material_transactions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      company_name = excluded.company_name,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.materials_catalog enable row level security;
alter table public.material_transactions enable row level security;

create policy "profiles self select" on public.profiles
for select using (auth.uid() = id);

create policy "profiles self insert" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles self update" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "projects owner select" on public.projects
for select using (auth.uid() = owner_id);

create policy "projects owner insert" on public.projects
for insert with check (auth.uid() = owner_id);

create policy "projects owner update" on public.projects
for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "projects owner delete" on public.projects
for delete using (auth.uid() = owner_id);

create policy "catalog authenticated read" on public.materials_catalog
for select using (auth.role() = 'authenticated');

create policy "transactions owner select" on public.material_transactions
for select using (
  exists (
    select 1
    from public.projects p
    where p.id = material_transactions.project_id
      and p.owner_id = auth.uid()
  )
);

create policy "transactions owner insert" on public.material_transactions
for insert with check (
  exists (
    select 1
    from public.projects p
    where p.id = material_transactions.project_id
      and p.owner_id = auth.uid()
  )
);

create policy "transactions owner update" on public.material_transactions
for update using (
  exists (
    select 1
    from public.projects p
    where p.id = material_transactions.project_id
      and p.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.projects p
    where p.id = material_transactions.project_id
      and p.owner_id = auth.uid()
  )
);

create policy "transactions owner delete" on public.material_transactions
for delete using (
  exists (
    select 1
    from public.projects p
    where p.id = material_transactions.project_id
      and p.owner_id = auth.uid()
  )
);

create or replace view public.project_material_summary as
select
  t.project_id,
  coalesce(t.catalog_id::text, 'custom:' || t.custom_item_name) as item_key,
  coalesce(c.name, t.custom_item_name) as item_name,
  coalesce(c.unit, t.custom_unit) as item_unit,
  coalesce(c.category, 'Custom') as category,
  sum(t.quantity) as total_quantity,
  sum(t.quantity * t.unit_price) as total_cost,
  case when sum(t.quantity) > 0 then sum(t.quantity * t.unit_price) / sum(t.quantity) else 0 end as weighted_avg_unit_cost,
  count(*)::integer as transaction_count
from public.material_transactions t
left join public.materials_catalog c on c.id = t.catalog_id
group by t.project_id, coalesce(t.catalog_id::text, 'custom:' || t.custom_item_name), coalesce(c.name, t.custom_item_name), coalesce(c.unit, t.custom_unit), coalesce(c.category, 'Custom');