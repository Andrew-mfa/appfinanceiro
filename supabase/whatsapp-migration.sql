-- Moneto — WhatsApp Usage Tracking Migration
-- Execute no SQL Editor do Supabase (Dashboard → SQL Editor)

-- Vincula número WhatsApp ao perfil do usuário (multi-user)
alter table public.user_profiles
  add column if not exists whatsapp_phone text unique;

create index if not exists user_profiles_whatsapp_phone_idx
  on public.user_profiles(whatsapp_phone);

-- Rastreia uso mensal de mensagens WhatsApp por usuário
create table if not exists public.whatsapp_usage (
  user_id    uuid  references auth.users(id) on delete cascade not null,
  month      text  not null, -- 'YYYY-MM'
  count      int   not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

create index if not exists whatsapp_usage_user_month_idx
  on public.whatsapp_usage(user_id, month);

-- RLS: usuário lê apenas o próprio uso
alter table public.whatsapp_usage enable row level security;

create policy "users_select_own_whatsapp_usage" on public.whatsapp_usage
  for select using (auth.uid() = user_id);
