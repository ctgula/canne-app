-- Admin Ops Dashboard SQL Migrations
-- Run these in Supabase SQL Editor or via CLI

-- 1. SETTINGS table for ops knobs and feature flags
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Default ops settings
insert into settings(key, value) values
  ('ops', jsonb_build_object(
    'hide_asap', false,
    'asap_quota_per_15m', 20,
    'event_mode', false,
    'surge_plus', false
  ))
on conflict (key) do nothing;

-- 2. Ensure inventory_items has required columns
alter table inventory_items
  add column if not exists active boolean default true,
  add column if not exists updated_at timestamptz default now();

-- 3. Trigger to auto-toggle active based on quantity
create or replace function trg_inventory_active_from_qty()
returns trigger language plpgsql as $$
begin
  if new.qty_on_hand <= 0 then
    new.active := false;
  elsif new.qty_on_hand > 0 then
    new.active := true;
  end if;
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists inventory_active_from_qty on inventory_items;
create trigger inventory_active_from_qty
before update on inventory_items
for each row execute procedure trg_inventory_active_from_qty();

-- 4. Views for live metrics

-- ASAP orders last 15 minutes
create or replace view v_asap_15m as
select count(*) as asap_count_15m
from orders
where delivery_mode = 'NOW'
  and created_at >= now() - interval '15 minutes';

-- Dispatch p50/p90 (last 2 hours) - assuming deliveries table exists
create or replace view v_dispatch_stats as
select
  percentile_cont(0.5) within group (order by extract(epoch from (accepted_at - assigned_at))) as p50_dispatch_s,
  percentile_cont(0.9) within group (order by extract(epoch from (accepted_at - assigned_at))) as p90_dispatch_s
from deliveries
where assigned_at >= now() - interval '2 hours';

-- On-time rate (last 2 hours)
create or replace view v_on_time_2h as
select
  avg(case when late then 0 else 1 end)::float as on_time_rate
from deliveries
where assigned_at >= now() - interval '2 hours';

-- 5. Optional: Profiles table for admin roles
alter table profiles
  add column if not exists is_admin boolean default false;

-- 6. Optional: RPC function for atomic stock updates
create or replace function add_stock_delta(p_id uuid, p_delta int)
returns void language sql as $$
  update inventory_items
  set qty_on_hand = greatest(0, qty_on_hand + p_delta)
  where id = p_id;
$$;

-- 7. Optional: Kit swaps table for OOS alternatives
create table if not exists kit_swaps (
  sku text primary key,
  alt1 text,
  alt2 text
);

-- 8. Optional: Events log for inventory changes
-- Assuming events_log already exists, or create it
create table if not exists events_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_data jsonb,
  created_at timestamptz default now()
);

-- 9. Enable RLS on new tables
alter table settings enable row level security;
alter table kit_swaps enable row level security;
alter table events_log enable row level security;

-- 10. RLS Policies (admin-only access)
create policy "admin_only_settings" on settings for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy "admin_only_kit_swaps" on kit_swaps for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy "admin_only_events_log" on events_log for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
