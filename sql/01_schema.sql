-- EroTrack 2.0 — schéma Supabase. À exécuter dans un NOUVEAU projet.
create extension if not exists pgcrypto;

do $$ begin
  create type public.member_role as enum ('member','admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.observation_status as enum ('pending','validated','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  organization text,
  phone text,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  region text,
  created_at timestamptz not null default now()
);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  sector_id uuid references public.sectors(id) on delete set null,
  title text not null,
  description text not null,
  observed_at date not null,
  latitude double precision check(latitude between -90 and 90),
  longitude double precision check(longitude between -180 and 180),
  status public.observation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.observation_photos (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  caption text,
  captured_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid references public.sectors(id) on delete set null,
  observation_id uuid references public.observations(id) on delete set null,
  indicator text not null,
  value numeric not null,
  unit text not null,
  measured_at date not null,
  method text not null,
  source text,
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.observation_reviews (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  decision public.observation_status not null check(decision in ('validated','rejected')),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  observation_id uuid not null references public.observations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,observation_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null,
  status text not null default 'inactive',
  provider_reference text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,full_name)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

alter table public.profiles enable row level security;
alter table public.sectors enable row level security;
alter table public.observations enable row level security;
alter table public.observation_photos enable row level security;
alter table public.measurements enable row level security;
alter table public.observation_reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profile read own or admin" on public.profiles;
create policy "profile read own or admin" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
drop policy if exists "profile update own" on public.profiles;
create policy "profile update own" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid() and role='member');
drop policy if exists "sectors public read" on public.sectors;
create policy "sectors public read" on public.sectors for select to anon,authenticated using(true);
drop policy if exists "sectors admin manage" on public.sectors;
create policy "sectors admin manage" on public.sectors for all to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists "observations public validated" on public.observations;
create policy "observations public validated" on public.observations for select to anon,authenticated using(status='validated' or user_id=auth.uid() or public.is_admin());
drop policy if exists "observations member insert" on public.observations;
create policy "observations member insert" on public.observations for insert to authenticated with check(user_id=auth.uid() and status='pending');
drop policy if exists "observations admin update" on public.observations;
create policy "observations admin update" on public.observations for update to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists "photos owner or admin read" on public.observation_photos;
create policy "photos owner or admin read" on public.observation_photos for select to authenticated using(user_id=auth.uid() or public.is_admin() or exists(select 1 from public.observations o where o.id=observation_id and o.status='validated'));
drop policy if exists "photos owner insert" on public.observation_photos;
create policy "photos owner insert" on public.observation_photos for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.observations o where o.id=observation_id and o.user_id=auth.uid()));
drop policy if exists "measurements public read" on public.measurements;
create policy "measurements public read" on public.measurements for select to anon,authenticated using(validated_at is not null or public.is_admin());
drop policy if exists "measurements admin manage" on public.measurements;
create policy "measurements admin manage" on public.measurements for all to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists "reviews admin read" on public.observation_reviews;
create policy "reviews admin read" on public.observation_reviews for select to authenticated using(public.is_admin());
drop policy if exists "reviews admin insert" on public.observation_reviews;
create policy "reviews admin insert" on public.observation_reviews for insert to authenticated with check(public.is_admin() and reviewer_id=auth.uid());

drop policy if exists "favorites own all" on public.favorites;
create policy "favorites own all" on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "subscriptions own read" on public.subscriptions;
create policy "subscriptions own read" on public.subscriptions for select to authenticated using(user_id=auth.uid() or public.is_admin());
drop policy if exists "notifications own all" on public.notifications;
create policy "notifications own all" on public.notifications for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "audit admin read" on public.audit_logs;
create policy "audit admin read" on public.audit_logs for select to authenticated using(public.is_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('observation-photos','observation-photos',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;

drop policy if exists "upload own observation photos" on storage.objects;
create policy "upload own observation photos" on storage.objects for insert to authenticated
with check(bucket_id='observation-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "read own or admin observation photos" on storage.objects;
create policy "read own or admin observation photos" on storage.objects for select to authenticated
using(bucket_id='observation-photos' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
