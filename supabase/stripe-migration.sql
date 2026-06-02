-- FinançasPro — Stripe Integration Migration
-- Execute no SQL Editor do Supabase (Dashboard → SQL Editor)

-- Tabela de perfis com dados de assinatura
create table if not exists public.user_profiles (
  user_id                uuid        references auth.users(id) on delete cascade primary key,
  plan                   text        not null default 'free' check (plan in ('free', 'pro', 'ltd')),
  stripe_customer_id     text        unique,
  stripe_subscription_id text        unique,
  plan_expires_at        timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Índice para lookup por customer do Stripe
create index if not exists user_profiles_stripe_customer_idx
  on public.user_profiles(stripe_customer_id);

-- RLS: usuário lê apenas o próprio perfil
alter table public.user_profiles enable row level security;

create policy "users_select_own_profile" on public.user_profiles
  for select using (auth.uid() = user_id);

-- Trigger: cria perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill: criar perfil para usuários já existentes
insert into public.user_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;
