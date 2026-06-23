create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  ruc text,
  city text,
  activity text,
  iva_rate numeric(6, 4) not null default 0.15,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  ruc text,
  city text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  category text,
  unit text not null default 'unidad',
  price numeric(12, 2) not null default 0,
  cost numeric(12, 2) not null default 0,
  applies_iva boolean not null default true,
  stock numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  date date not null,
  quantity numeric(12, 2) not null default 1,
  subtotal numeric(12, 2) not null default 0,
  iva numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  status text not null default 'Pendiente',
  sri_status text not null default 'No emitida',
  sri_access_key text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  date date not null,
  supplier text not null,
  category text,
  description text,
  subtotal numeric(12, 2) not null default 0,
  iva numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  status text not null default 'Pendiente',
  created_at timestamptz not null default now()
);

create table if not exists app_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table businesses enable row level security;
alter table clients enable row level security;
alter table products enable row level security;
alter table sales enable row level security;
alter table expenses enable row level security;
alter table app_states enable row level security;

create policy "business owners can read businesses" on businesses
  for select using (auth.uid() = owner_id);

create policy "business owners can insert businesses" on businesses
  for insert with check (auth.uid() = owner_id);

create policy "business owners can update businesses" on businesses
  for update using (auth.uid() = owner_id);

create policy "business members can read clients" on clients
  for select using (exists (select 1 from businesses where businesses.id = clients.business_id and businesses.owner_id = auth.uid()));

create policy "business members can manage clients" on clients
  for all using (exists (select 1 from businesses where businesses.id = clients.business_id and businesses.owner_id = auth.uid()));

create policy "business members can manage products" on products
  for all using (exists (select 1 from businesses where businesses.id = products.business_id and businesses.owner_id = auth.uid()));

create policy "business members can manage sales" on sales
  for all using (exists (select 1 from businesses where businesses.id = sales.business_id and businesses.owner_id = auth.uid()));

create policy "business members can manage expenses" on expenses
  for all using (exists (select 1 from businesses where businesses.id = expenses.business_id and businesses.owner_id = auth.uid()));

create policy "users can manage their app state" on app_states
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
